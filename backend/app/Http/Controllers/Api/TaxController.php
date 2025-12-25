<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    /**
     * Liste des taxes
     */
    public function index(Request $request)
    {
        $query = Tax::query();

        // Filtrer par statut actif
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Créer une taxe
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:taxes',
            'rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'applicable_on' => 'nullable|array',
            'applicable_on.*' => 'string|in:devis,ordres,factures',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['is_default'] = $validated['is_default'] ?? false;
        $validated['applicable_on'] = $validated['applicable_on'] ?? ['devis', 'ordres', 'factures'];

        $tax = Tax::create($validated);

        return response()->json([
            'success' => true,
            'data' => $tax,
            'message' => 'Taxe créée avec succès',
        ], 201);
    }

    /**
     * Afficher une taxe
     */
    public function show(Tax $tax)
    {
        return response()->json([
            'success' => true,
            'data' => $tax,
        ]);
    }

    /**
     * Mettre à jour une taxe
     */
    public function update(Request $request, Tax $tax)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:20|unique:taxes,code,' . $tax->id,
            'rate' => 'sometimes|numeric|min:0|max:100',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'applicable_on' => 'nullable|array',
            'applicable_on.*' => 'string|in:devis,ordres,factures',
        ]);

        $tax->update($validated);

        return response()->json([
            'success' => true,
            'data' => $tax->fresh(),
            'message' => 'Taxe mise à jour',
        ]);
    }

    /**
     * Supprimer une taxe
     */
    public function destroy(Tax $tax)
    {
        $tax->delete();

        return response()->json([
            'success' => true,
            'message' => 'Taxe supprimée',
        ], 204);
    }

    /**
     * Taxes actives par défaut
     */
    public function defaults()
    {
        $taxes = Tax::active()->default()->get();
        $totalRate = $taxes->sum('rate');

        return response()->json([
            'success' => true,
            'data' => [
                'taxes' => $taxes,
                'total_rate' => $totalRate,
            ],
        ]);
    }
}
