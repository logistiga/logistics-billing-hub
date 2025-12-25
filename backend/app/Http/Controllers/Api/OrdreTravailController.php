<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrdreTravail;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class OrdreTravailController extends Controller
{
    /**
     * Liste des ordres de travail avec pagination
     */
    public function index(Request $request)
    {
        $query = OrdreTravail::with(['client', 'lignesPrestations']);

        // Filtrage par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtrage par client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
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
     * Ordres en attente
     */
    public function pending(Request $request)
    {
        $query = OrdreTravail::with(['client'])
            ->where('status', 'pending');

        $perPage = $request->get('per_page', 15);

        return $query->orderBy('date', 'asc')->paginate($perPage);
    }

    /**
     * Créer un ordre de travail
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            'navire' => 'nullable|string|max:255',
            'voyage' => 'nullable|string|max:100',
            'type_operation' => 'nullable|string|max:100',
            'marchandise' => 'nullable|string|max:255',
            'poids' => 'nullable|numeric',
            'nombre_colis' => 'nullable|integer',
            'lieu_operation' => 'nullable|string|max:255',
            'observations' => 'nullable|string',
            'lignes_prestations' => 'nullable|array',
            'lignes_prestations.*.description' => 'required|string',
            'lignes_prestations.*.quantite' => 'required|numeric',
            'lignes_prestations.*.prix_unitaire' => 'required|numeric',
            'transport' => 'nullable|array',
        ]);

        // Générer le numéro
        $lastOrder = OrdreTravail::whereYear('created_at', now()->year)
            ->orderBy('id', 'desc')
            ->first();
        $numero = 'OT-' . now()->format('Y') . '-' . str_pad(($lastOrder ? $lastOrder->id + 1 : 1), 5, '0', STR_PAD_LEFT);

        $validated['numero'] = $numero;
        $validated['status'] = 'pending';

        $lignesPrestations = $validated['lignes_prestations'] ?? [];
        $transport = $validated['transport'] ?? null;
        unset($validated['lignes_prestations'], $validated['transport']);

        $ordre = OrdreTravail::create($validated);

        // Ajouter les lignes de prestations
        foreach ($lignesPrestations as $ligne) {
            $ordre->lignesPrestations()->create($ligne);
        }

        // Ajouter le transport
        if ($transport) {
            $ordre->transport()->create($transport);
        }

        return response()->json([
            'success' => true,
            'data' => $ordre->load(['client', 'lignesPrestations', 'transport']),
            'message' => 'Ordre de travail créé avec succès',
        ], 201);
    }

    /**
     * Afficher un ordre de travail
     */
    public function show(OrdreTravail $ordreTravail)
    {
        return response()->json([
            'success' => true,
            'data' => $ordreTravail->load(['client', 'lignesPrestations', 'transport']),
        ]);
    }

    /**
     * Mettre à jour un ordre de travail
     */
    public function update(Request $request, OrdreTravail $ordreTravail)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'date' => 'sometimes|date',
            'reference' => 'nullable|string|max:100',
            'navire' => 'nullable|string|max:255',
            'voyage' => 'nullable|string|max:100',
            'type_operation' => 'nullable|string|max:100',
            'marchandise' => 'nullable|string|max:255',
            'poids' => 'nullable|numeric',
            'nombre_colis' => 'nullable|integer',
            'lieu_operation' => 'nullable|string|max:255',
            'observations' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'lignes_prestations' => 'nullable|array',
            'transport' => 'nullable|array',
        ]);

        $lignesPrestations = $validated['lignes_prestations'] ?? null;
        $transport = $validated['transport'] ?? null;
        unset($validated['lignes_prestations'], $validated['transport']);

        $ordreTravail->update($validated);

        // Mettre à jour les lignes si fournies
        if ($lignesPrestations !== null) {
            $ordreTravail->lignesPrestations()->delete();
            foreach ($lignesPrestations as $ligne) {
                $ordreTravail->lignesPrestations()->create($ligne);
            }
        }

        // Mettre à jour le transport si fourni
        if ($transport !== null) {
            $ordreTravail->transport()->delete();
            $ordreTravail->transport()->create($transport);
        }

        return response()->json([
            'success' => true,
            'data' => $ordreTravail->fresh()->load(['client', 'lignesPrestations', 'transport']),
            'message' => 'Ordre de travail mis à jour',
        ]);
    }

    /**
     * Supprimer un ordre de travail
     */
    public function destroy(OrdreTravail $ordreTravail)
    {
        $ordreTravail->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ordre de travail supprimé',
        ], 204);
    }

    /**
     * Valider un ordre de travail
     */
    public function validate(OrdreTravail $ordreTravail)
    {
        $ordreTravail->update([
            'status' => 'completed',
            'validated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $ordreTravail->fresh(),
            'message' => 'Ordre de travail validé',
        ]);
    }

    /**
     * Générer un PDF
     */
    public function generatePdf(OrdreTravail $ordreTravail)
    {
        $ordreTravail->load(['client', 'lignesPrestations', 'transport']);

        $pdf = Pdf::loadView('pdf.ordre-travail', [
            'ordre' => $ordreTravail,
        ]);

        return $pdf->download("ordre-travail-{$ordreTravail->numero}.pdf");
    }

    /**
     * Convertir en facture
     */
    public function convertToInvoice(OrdreTravail $ordreTravail)
    {
        // Vérifier que l'ordre n'est pas déjà facturé
        if ($ordreTravail->invoice_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cet ordre de travail est déjà facturé',
            ], 422);
        }

        // Créer la facture
        $invoice = \App\Models\Invoice::create([
            'client_id' => $ordreTravail->client_id,
            'ordre_travail_id' => $ordreTravail->id,
            'date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'amount' => $ordreTravail->total,
        ]);

        // Copier les lignes
        foreach ($ordreTravail->lignesPrestations as $ligne) {
            $invoice->items()->create([
                'description' => $ligne->description,
                'quantity' => $ligne->quantite,
                'unit_price' => $ligne->prix_unitaire,
                'amount' => $ligne->quantite * $ligne->prix_unitaire,
            ]);
        }

        // Lier l'ordre à la facture
        $ordreTravail->update(['invoice_id' => $invoice->id]);

        return response()->json([
            'success' => true,
            'data' => $invoice->load('items'),
            'message' => 'Facture créée à partir de l\'ordre de travail',
        ], 201);
    }

    /**
     * Statistiques
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => OrdreTravail::count(),
                'pending' => OrdreTravail::where('status', 'pending')->count(),
                'in_progress' => OrdreTravail::where('status', 'in_progress')->count(),
                'completed' => OrdreTravail::where('status', 'completed')->count(),
                'cancelled' => OrdreTravail::where('status', 'cancelled')->count(),
                'this_month' => OrdreTravail::whereMonth('created_at', now()->month)->count(),
            ],
        ]);
    }
}
