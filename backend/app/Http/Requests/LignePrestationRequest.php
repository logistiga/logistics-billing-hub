<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LignePrestationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ordre_travail_id' => 'required|exists:ordres_travail,id',
            'description' => 'required|string|max:500',
            'quantite' => 'required|numeric|min:0.01|max:999999',
            'prix_unitaire' => 'required|numeric|min:0|max:99999999',
            'unite' => 'nullable|string|max:50',
            'tva_rate' => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'ordre_travail_id.required' => 'L\'ordre de travail est obligatoire.',
            'ordre_travail_id.exists' => 'L\'ordre de travail sélectionné n\'existe pas.',
            'description.required' => 'La description est obligatoire.',
            'quantite.required' => 'La quantité est obligatoire.',
            'quantite.min' => 'La quantité doit être supérieure à 0.',
            'prix_unitaire.required' => 'Le prix unitaire est obligatoire.',
        ];
    }
}
