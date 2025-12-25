<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrdreTravailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:2000',
            'lieu_intervention' => 'nullable|string|max:255',
            'contact_site' => 'nullable|string|max:100',
            'telephone_site' => 'nullable|string|max:20',
            'priorite' => 'nullable|in:basse,normale,haute,urgente',
            'notes' => 'nullable|string|max:2000',
            
            // Lignes de prestation
            'lignes' => 'nullable|array',
            'lignes.*.description' => 'required|string|max:500',
            'lignes.*.quantite' => 'required|numeric|min:0.01|max:999999',
            'lignes.*.prix_unitaire' => 'required|numeric|min:0|max:99999999',
            'lignes.*.unite' => 'nullable|string|max:50',
            'lignes.*.tva_rate' => 'nullable|numeric|min:0|max:100',
            
            // Transports
            'transports' => 'nullable|array',
            'transports.*.type' => 'required|string|max:100',
            'transports.*.vehicule' => 'nullable|string|max:100',
            'transports.*.immatriculation' => 'nullable|string|max:20',
            'transports.*.chauffeur' => 'nullable|string|max:100',
            'transports.*.depart' => 'nullable|string|max:255',
            'transports.*.arrivee' => 'nullable|string|max:255',
            'transports.*.date_depart' => 'nullable|date',
            'transports.*.date_arrivee' => 'nullable|date|after_or_equal:transports.*.date_depart',
            'transports.*.distance_km' => 'nullable|numeric|min:0|max:999999',
            'transports.*.prix' => 'nullable|numeric|min:0|max:99999999',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Le client est obligatoire.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'date.required' => 'La date est obligatoire.',
            'date_fin.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'lignes.*.description.required' => 'La description de la prestation est obligatoire.',
            'lignes.*.quantite.required' => 'La quantité est obligatoire.',
            'lignes.*.prix_unitaire.required' => 'Le prix unitaire est obligatoire.',
            'transports.*.type.required' => 'Le type de transport est obligatoire.',
        ];
    }
}
