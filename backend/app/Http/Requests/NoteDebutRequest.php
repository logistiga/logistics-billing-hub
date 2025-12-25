<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NoteDebutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:debut,detention,ouverture_port,reparation',
            'client_id' => 'required|exists:clients,id',
            'ordre_travail_id' => 'nullable|exists:ordres_travail,id',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            
            // Champs communs
            'conteneur' => 'nullable|string|max:50',
            'type_conteneur' => 'nullable|string|max:50',
            'navire' => 'nullable|string|max:100',
            'armateur' => 'nullable|string|max:100',
            'bl_number' => 'nullable|string|max:100',
            'port_chargement' => 'nullable|string|max:100',
            'port_dechargement' => 'nullable|string|max:100',
            
            // Dates spécifiques
            'date_arrivee' => 'nullable|date',
            'date_debut_detention' => 'nullable|date',
            'date_fin_detention' => 'nullable|date|after_or_equal:date_debut_detention',
            'date_ouverture' => 'nullable|date',
            'date_reparation' => 'nullable|date',
            
            // Montants
            'montant_detention' => 'nullable|numeric|min:0|max:99999999',
            'frais_ouverture' => 'nullable|numeric|min:0|max:99999999',
            'cout_reparation' => 'nullable|numeric|min:0|max:99999999',
            
            // Détails reparation
            'nature_avarie' => 'nullable|string|max:500',
            'reparations_effectuees' => 'nullable|string|max:2000',
            
            'notes' => 'nullable|string|max:2000',
            'validated' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de note est obligatoire.',
            'type.in' => 'Le type de note est invalide.',
            'client_id.required' => 'Le client est obligatoire.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'date.required' => 'La date est obligatoire.',
            'date_fin_detention.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
        ];
    }
}
