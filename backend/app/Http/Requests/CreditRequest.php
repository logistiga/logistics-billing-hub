<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'banque_id' => 'required|exists:banques,id',
            'name' => 'required|string|max:100',
            'type' => 'required|in:pret,ligne_credit,decouvert,leasing',
            'montant_initial' => 'required|numeric|min:0.01|max:999999999',
            'taux_interet' => 'required|numeric|min:0|max:100',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'duree_mois' => 'required|integer|min:1|max:600',
            'mensualite' => 'required|numeric|min:0|max:99999999',
            'jour_prelevement' => 'nullable|integer|min:1|max:31',
            'reference_contrat' => 'nullable|string|max:100',
            'organisme' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'banque_id.required' => 'Le compte bancaire est obligatoire.',
            'name.required' => 'Le nom du crédit est obligatoire.',
            'type.required' => 'Le type de crédit est obligatoire.',
            'montant_initial.required' => 'Le montant initial est obligatoire.',
            'montant_initial.min' => 'Le montant doit être supérieur à 0.',
            'taux_interet.required' => 'Le taux d\'intérêt est obligatoire.',
            'date_debut.required' => 'La date de début est obligatoire.',
            'date_fin.required' => 'La date de fin est obligatoire.',
            'date_fin.after' => 'La date de fin doit être postérieure à la date de début.',
            'duree_mois.required' => 'La durée est obligatoire.',
            'mensualite.required' => 'La mensualité est obligatoire.',
        ];
    }
}
