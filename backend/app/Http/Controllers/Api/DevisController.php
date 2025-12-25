<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Devis;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DevisController extends Controller
{
    /**
     * Liste des devis avec pagination
     */
    public function index(Request $request)
    {
        $query = Devis::with(['client']);

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
                  ->orWhere('reference', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
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
     * Créer un devis
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'validity_date' => 'required|date|after:date',
            'reference' => 'nullable|string|max:100',
            'subject' => 'nullable|string|max:255',
            'introduction' => 'nullable|string',
            'conditions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percent,fixed',
        ]);

        // Générer le numéro
        $lastDevis = Devis::whereYear('created_at', now()->year)
            ->orderBy('id', 'desc')
            ->first();
        $numero = 'DEV-' . now()->format('Y') . '-' . str_pad(($lastDevis ? $lastDevis->id + 1 : 1), 5, '0', STR_PAD_LEFT);

        // Calculer les montants
        $subtotal = 0;
        $totalTax = 0;
        foreach ($validated['items'] as $item) {
            $lineTotal = $item['quantity'] * $item['unit_price'];
            $subtotal += $lineTotal;
            $totalTax += $lineTotal * (($item['tax_rate'] ?? 0) / 100);
        }

        $discount = $validated['discount'] ?? 0;
        if (($validated['discount_type'] ?? 'fixed') === 'percent') {
            $discount = $subtotal * ($discount / 100);
        }

        $validated['numero'] = $numero;
        $validated['status'] = 'draft';
        $validated['subtotal'] = $subtotal;
        $validated['tax_amount'] = $totalTax;
        $validated['discount_amount'] = $discount;
        $validated['total'] = $subtotal + $totalTax - $discount;

        $items = $validated['items'];
        unset($validated['items']);

        $devis = Devis::create($validated);

        // Ajouter les lignes
        foreach ($items as $item) {
            $item['amount'] = $item['quantity'] * $item['unit_price'];
            $devis->items()->create($item);
        }

        return response()->json([
            'success' => true,
            'data' => $devis->load(['client', 'items']),
            'message' => 'Devis créé avec succès',
        ], 201);
    }

    /**
     * Afficher un devis
     */
    public function show(Devis $devi)
    {
        return response()->json([
            'success' => true,
            'data' => $devi->load(['client', 'items']),
        ]);
    }

    /**
     * Mettre à jour un devis
     */
    public function update(Request $request, Devis $devi)
    {
        if ($devi->status === 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de modifier un devis accepté',
            ], 422);
        }

        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'date' => 'sometimes|date',
            'validity_date' => 'sometimes|date',
            'reference' => 'nullable|string|max:100',
            'subject' => 'nullable|string|max:255',
            'introduction' => 'nullable|string',
            'conditions' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percent,fixed',
            'status' => 'sometimes|in:draft,sent,accepted,rejected,expired',
        ]);

        $items = $validated['items'] ?? null;
        unset($validated['items']);

        // Recalculer si les items sont fournis
        if ($items !== null) {
            $subtotal = 0;
            $totalTax = 0;
            foreach ($items as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $subtotal += $lineTotal;
                $totalTax += $lineTotal * (($item['tax_rate'] ?? 0) / 100);
            }

            $discount = $validated['discount'] ?? $devi->discount ?? 0;
            if (($validated['discount_type'] ?? $devi->discount_type ?? 'fixed') === 'percent') {
                $discount = $subtotal * ($discount / 100);
            }

            $validated['subtotal'] = $subtotal;
            $validated['tax_amount'] = $totalTax;
            $validated['discount_amount'] = $discount;
            $validated['total'] = $subtotal + $totalTax - $discount;

            $devi->items()->delete();
            foreach ($items as $item) {
                $item['amount'] = $item['quantity'] * $item['unit_price'];
                $devi->items()->create($item);
            }
        }

        $devi->update($validated);

        return response()->json([
            'success' => true,
            'data' => $devi->fresh()->load(['client', 'items']),
            'message' => 'Devis mis à jour',
        ]);
    }

    /**
     * Supprimer un devis
     */
    public function destroy(Devis $devi)
    {
        if ($devi->invoice_id) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un devis converti en facture',
            ], 422);
        }

        $devi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Devis supprimé',
        ], 204);
    }

    /**
     * Envoyer le devis par email
     */
    public function send(Request $request, Devis $devi)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string',
        ]);

        // Logique d'envoi d'email
        // Mail::to($validated['email'])->send(new DevisMail($devi, $validated));

        $devi->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Devis envoyé par email',
        ]);
    }

    /**
     * Accepter un devis
     */
    public function accept(Devis $devi)
    {
        $devi->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $devi->fresh(),
            'message' => 'Devis accepté',
        ]);
    }

    /**
     * Rejeter un devis
     */
    public function reject(Request $request, Devis $devi)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $devi->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $devi->fresh(),
            'message' => 'Devis rejeté',
        ]);
    }

    /**
     * Convertir en facture
     */
    public function convertToInvoice(Devis $devi)
    {
        if ($devi->invoice_id) {
            return response()->json([
                'success' => false,
                'message' => 'Ce devis est déjà converti en facture',
            ], 422);
        }

        // Créer la facture
        $lastInvoice = Invoice::whereYear('created_at', now()->year)
            ->orderBy('id', 'desc')
            ->first();
        $invoiceNumber = 'FAC-' . now()->format('Y') . '-' . str_pad(($lastInvoice ? $lastInvoice->id + 1 : 1), 5, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'number' => $invoiceNumber,
            'client_id' => $devi->client_id,
            'devis_id' => $devi->id,
            'date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'subtotal' => $devi->subtotal,
            'tax_amount' => $devi->tax_amount,
            'discount_amount' => $devi->discount_amount,
            'amount' => $devi->total,
            'paid' => 0,
        ]);

        // Copier les lignes
        foreach ($devi->items as $item) {
            $invoice->items()->create([
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'tax_rate' => $item->tax_rate,
                'amount' => $item->amount,
            ]);
        }

        // Lier le devis à la facture
        $devi->update([
            'invoice_id' => $invoice->id,
            'status' => 'accepted',
        ]);

        return response()->json([
            'success' => true,
            'data' => $invoice->load(['client', 'items']),
            'message' => 'Facture créée à partir du devis',
        ], 201);
    }

    /**
     * Dupliquer un devis
     */
    public function duplicate(Devis $devi)
    {
        $lastDevis = Devis::whereYear('created_at', now()->year)
            ->orderBy('id', 'desc')
            ->first();
        $numero = 'DEV-' . now()->format('Y') . '-' . str_pad(($lastDevis ? $lastDevis->id + 1 : 1), 5, '0', STR_PAD_LEFT);

        $newDevis = $devi->replicate();
        $newDevis->numero = $numero;
        $newDevis->status = 'draft';
        $newDevis->date = now();
        $newDevis->validity_date = now()->addDays(30);
        $newDevis->sent_at = null;
        $newDevis->accepted_at = null;
        $newDevis->rejected_at = null;
        $newDevis->invoice_id = null;
        $newDevis->save();

        // Copier les lignes
        foreach ($devi->items as $item) {
            $newDevis->items()->create($item->toArray());
        }

        return response()->json([
            'success' => true,
            'data' => $newDevis->load(['client', 'items']),
            'message' => 'Devis dupliqué',
        ], 201);
    }

    /**
     * Générer un PDF
     */
    public function generatePdf(Devis $devi)
    {
        $devi->load(['client', 'items']);

        $pdf = Pdf::loadView('pdf.devis', [
            'devis' => $devi,
        ]);

        return $pdf->download("devis-{$devi->numero}.pdf");
    }

    /**
     * Statistiques
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Devis::count(),
                'total_amount' => Devis::sum('total'),
                'by_status' => [
                    'draft' => Devis::where('status', 'draft')->count(),
                    'sent' => Devis::where('status', 'sent')->count(),
                    'accepted' => Devis::where('status', 'accepted')->count(),
                    'rejected' => Devis::where('status', 'rejected')->count(),
                    'expired' => Devis::where('status', 'expired')->count(),
                ],
                'conversion_rate' => Devis::count() > 0 
                    ? round((Devis::where('status', 'accepted')->count() / Devis::count()) * 100, 2) 
                    : 0,
                'this_month' => Devis::whereMonth('created_at', now()->month)->sum('total'),
            ],
        ]);
    }
}
