<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EntrepriseController extends Controller
{
    /**
     * Récupérer les informations de l'entreprise
     */
    public function show()
    {
        $entreprise = Entreprise::first();

        if (!$entreprise) {
            $entreprise = Entreprise::create([
                'name' => 'Mon Entreprise',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $entreprise,
        ]);
    }

    /**
     * Mettre à jour les informations de l'entreprise
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'legal_form' => 'nullable|string|max:100',
            'nif' => 'nullable|string|max:50',
            'nis' => 'nullable|string|max:50',
            'rc' => 'nullable|string|max:50',
            'ai' => 'nullable|string|max:50',
            'capital' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'fax' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'bank_name' => 'nullable|string|max:255',
            'bank_account' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:50',
            'swift' => 'nullable|string|max:20',
            'invoice_prefix' => 'nullable|string|max:10',
            'invoice_footer' => 'nullable|string',
            'invoice_terms' => 'nullable|string',
            'default_payment_terms' => 'nullable|integer|min:0',
            'default_tax_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|max:10',
            'fiscal_year_start' => 'nullable|integer|min:1|max:12',
        ]);

        $entreprise = Entreprise::first();

        if (!$entreprise) {
            $entreprise = Entreprise::create($validated);
        } else {
            $entreprise->update($validated);
        }

        return response()->json([
            'success' => true,
            'data' => $entreprise->fresh(),
            'message' => 'Informations mises à jour',
        ]);
    }

    /**
     * Mettre à jour le logo
     */
    public function updateLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $entreprise = Entreprise::first();

        // Supprimer l'ancien logo
        if ($entreprise && $entreprise->logo) {
            Storage::disk('public')->delete($entreprise->logo);
        }

        // Enregistrer le nouveau logo
        $path = $request->file('logo')->store('logos', 'public');

        if (!$entreprise) {
            $entreprise = Entreprise::create([
                'name' => 'Mon Entreprise',
                'logo' => $path,
            ]);
        } else {
            $entreprise->update(['logo' => $path]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'logo' => $path,
                'url' => Storage::disk('public')->url($path),
            ],
            'message' => 'Logo mis à jour',
        ]);
    }

    /**
     * Supprimer le logo
     */
    public function deleteLogo()
    {
        $entreprise = Entreprise::first();

        if ($entreprise && $entreprise->logo) {
            Storage::disk('public')->delete($entreprise->logo);
            $entreprise->update(['logo' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logo supprimé',
        ]);
    }

    /**
     * Récupérer les paramètres de taxes
     */
    public function taxes()
    {
        $entreprise = Entreprise::first();

        return response()->json([
            'success' => true,
            'data' => [
                'default_rate' => $entreprise->default_tax_rate ?? 19,
                'rates' => [
                    ['label' => 'TVA 19%', 'value' => 19],
                    ['label' => 'TVA 9%', 'value' => 9],
                    ['label' => 'Exonéré', 'value' => 0],
                ],
            ],
        ]);
    }

    /**
     * Mettre à jour les paramètres de taxes
     */
    public function updateTaxes(Request $request)
    {
        $validated = $request->validate([
            'default_rate' => 'required|numeric|min:0|max:100',
        ]);

        $entreprise = Entreprise::first();

        if ($entreprise) {
            $entreprise->update(['default_tax_rate' => $validated['default_rate']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Paramètres de taxes mis à jour',
        ]);
    }
}
