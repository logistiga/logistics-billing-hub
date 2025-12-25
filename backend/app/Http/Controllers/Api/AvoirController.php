<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avoir;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class AvoirController extends Controller
{
    /**
     * Liste des avoirs avec pagination
     */
    public function index(Request $request)
    {
        $query = Avoir::with(['client', 'invoice']);

        // Filtrage par client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filtrage par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtrage par date
        if ($request->has('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('invoice', function ($q) use ($search) {
                      $q->where('number', 'like', "%{$search}%");
                  });
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);

        return $query->paginate($perPage);
    }

    /**
     * Créer un avoir
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
            'type' => 'required|in:refund,credit,compensation',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric',
            'items.*.unit_price' => 'required|numeric',
        ]);

        // Générer le numéro
        $lastAvoir = Avoir::whereYear('created_at', now()->year)
            ->orderBy('id', 'desc')
            ->first();
        $numero = 'AV-' . now()->format('Y') . '-' . str_pad(($lastAvoir ? $lastAvoir->id + 1 : 1), 5, '0', STR_PAD_LEFT);

        $validated['numero'] = $numero;
        $validated['status'] = 'draft';
        $validated['remaining_amount'] = $validated['amount'];

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        $avoir = Avoir::create($validated);

        // Ajouter les lignes
        foreach ($items as $item) {
            $avoir->items()->create($item);
        }

        // Si lié à une facture, mettre à jour le solde
        if ($avoir->invoice_id) {
            $invoice = Invoice::find($avoir->invoice_id);
            $invoice->decrement('amount', $avoir->amount);
        }

        return response()->json([
            'success' => true,
            'data' => $avoir->load(['client', 'invoice', 'items']),
            'message' => 'Avoir créé avec succès',
        ], 201);
    }

    /**
     * Afficher un avoir
     */
    public function show(Avoir $avoir)
    {
        return response()->json([
            'success' => true,
            'data' => $avoir->load(['client', 'invoice', 'items', 'compensations']),
        ]);
    }

    /**
     * Mettre à jour un avoir
     */
    public function update(Request $request, Avoir $avoir)
    {
        // Vérifier que l'avoir n'est pas validé
        if ($avoir->status === 'validated') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier un avoir validé',
            ], 422);
        }

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0.01',
            'reason' => 'sometimes|string|max:500',
            'items' => 'nullable|array',
            'status' => 'sometimes|in:draft,validated,cancelled,used',
        ]);

        $items = $validated['items'] ?? null;
        unset($validated['items']);

        if (isset($validated['amount'])) {
            $validated['remaining_amount'] = $validated['amount'];
        }

        $avoir->update($validated);

        // Mettre à jour les lignes si fournies
        if ($items !== null) {
            $avoir->items()->delete();
            foreach ($items as $item) {
                $avoir->items()->create($item);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $avoir->fresh()->load(['client', 'invoice', 'items']),
            'message' => 'Avoir mis à jour',
        ]);
    }

    /**
     * Supprimer un avoir
     */
    public function destroy(Avoir $avoir)
    {
        // Vérifier que l'avoir n'est pas utilisé
        if ($avoir->status === 'used' || $avoir->remaining_amount < $avoir->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un avoir utilisé',
            ], 422);
        }

        $avoir->delete();

        return response()->json([
            'success' => true,
            'message' => 'Avoir supprimé',
        ], 204);
    }

    /**
     * Valider un avoir
     */
    public function validate(Avoir $avoir)
    {
        $avoir->update([
            'status' => 'validated',
            'validated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $avoir->fresh(),
            'message' => 'Avoir validé',
        ]);
    }

    /**
     * Compenser un avoir sur une facture
     */
    public function compensate(Request $request, Avoir $avoir)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        // Vérifier que l'avoir a assez de solde
        if ($validated['amount'] > $avoir->remaining_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Montant supérieur au solde de l\'avoir',
            ], 422);
        }

        $invoice = Invoice::find($validated['invoice_id']);

        // Vérifier que la facture appartient au même client
        if ($invoice->client_id !== $avoir->client_id) {
            return response()->json([
                'success' => false,
                'message' => 'La facture n\'appartient pas au même client',
            ], 422);
        }

        // Créer la compensation
        $compensation = $avoir->compensations()->create([
            'invoice_id' => $invoice->id,
            'amount' => $validated['amount'],
            'date' => now(),
        ]);

        // Mettre à jour l'avoir
        $avoir->decrement('remaining_amount', $validated['amount']);
        if ($avoir->remaining_amount <= 0) {
            $avoir->update(['status' => 'used']);
        }

        // Mettre à jour la facture
        $invoice->increment('paid', $validated['amount']);
        if ($invoice->paid >= $invoice->amount) {
            $invoice->update(['status' => 'paid']);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'compensation' => $compensation,
                'avoir' => $avoir->fresh(),
                'invoice' => $invoice->fresh(),
            ],
            'message' => 'Compensation effectuée',
        ]);
    }

    /**
     * Historique des compensations
     */
    public function compensations(Avoir $avoir)
    {
        return response()->json([
            'success' => true,
            'data' => $avoir->compensations()->with('invoice')->get(),
        ]);
    }

    /**
     * Générer un PDF
     */
    public function generatePdf(Avoir $avoir)
    {
        $avoir->load(['client', 'invoice', 'items']);

        $pdf = Pdf::loadView('pdf.avoir', [
            'avoir' => $avoir,
        ]);

        return $pdf->download("avoir-{$avoir->numero}.pdf");
    }

    /**
     * Statistiques
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Avoir::count(),
                'total_amount' => Avoir::sum('amount'),
                'remaining_amount' => Avoir::sum('remaining_amount'),
                'used_amount' => Avoir::sum('amount') - Avoir::sum('remaining_amount'),
                'by_status' => [
                    'draft' => Avoir::where('status', 'draft')->count(),
                    'validated' => Avoir::where('status', 'validated')->count(),
                    'used' => Avoir::where('status', 'used')->count(),
                    'cancelled' => Avoir::where('status', 'cancelled')->count(),
                ],
                'this_month' => Avoir::whereMonth('created_at', now()->month)->sum('amount'),
            ],
        ]);
    }
}
