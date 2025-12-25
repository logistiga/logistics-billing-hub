<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partenaire;
use Illuminate\Http\Request;

class PartenaireController extends Controller
{
    /**
     * Liste des partenaires avec pagination
     */
    public function index(Request $request)
    {
        $query = Partenaire::query();

        // Filtrage par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtrage par statut
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nif', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);

        return $query->paginate($perPage);
    }

    /**
     * Créer un partenaire
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:supplier,subcontractor,transporter,agent,other',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'nif' => 'nullable|string|max:50',
            'rc' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:50',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $partenaire = Partenaire::create($validated);

        return response()->json([
            'success' => true,
            'data' => $partenaire,
            'message' => 'Partenaire créé avec succès',
        ], 201);
    }

    /**
     * Afficher un partenaire
     */
    public function show(Partenaire $partenaire)
    {
        return response()->json([
            'success' => true,
            'data' => $partenaire->load('transactions'),
        ]);
    }

    /**
     * Mettre à jour un partenaire
     */
    public function update(Request $request, Partenaire $partenaire)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:supplier,subcontractor,transporter,agent,other',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'nif' => 'nullable|string|max:50',
            'rc' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:50',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $partenaire->update($validated);

        return response()->json([
            'success' => true,
            'data' => $partenaire->fresh(),
            'message' => 'Partenaire mis à jour',
        ]);
    }

    /**
     * Supprimer un partenaire
     */
    public function destroy(Partenaire $partenaire)
    {
        $partenaire->delete();

        return response()->json([
            'success' => true,
            'message' => 'Partenaire supprimé',
        ], 204);
    }

    /**
     * Rechercher des partenaires
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $type = $request->get('type');

        $partenaires = Partenaire::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('nif', 'like', "%{$query}%");
            })
            ->when($type, function ($q) use ($type) {
                $q->where('type', $type);
            })
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $partenaires,
        ]);
    }

    /**
     * Solde d'un partenaire
     */
    public function balance(Partenaire $partenaire)
    {
        $transactions = $partenaire->transactions();

        return response()->json([
            'success' => true,
            'data' => [
                'total_credit' => $transactions->sum('credit'),
                'total_debit' => $transactions->sum('debit'),
                'balance' => $transactions->sum('credit') - $transactions->sum('debit'),
                'transactions_count' => $transactions->count(),
            ],
        ]);
    }

    /**
     * Statistiques par type
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Partenaire::count(),
                'active' => Partenaire::where('is_active', true)->count(),
                'by_type' => [
                    'supplier' => Partenaire::where('type', 'supplier')->count(),
                    'subcontractor' => Partenaire::where('type', 'subcontractor')->count(),
                    'transporter' => Partenaire::where('type', 'transporter')->count(),
                    'agent' => Partenaire::where('type', 'agent')->count(),
                    'other' => Partenaire::where('type', 'other')->count(),
                ],
            ],
        ]);
    }
}
