<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DevisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'validity_date' => 'required|date|after_or_equal:date',
            'reference' => 'nullable|string|max:100',
            'subject' => 'nullable|string|max:255',
            'introduction' => 'nullable|string|max:2000',
            'conditions' => 'nullable|string|max:2000',
            'discount' => 'nullable|numeric|min:0',
            'discount_type' => 'nullable|in:percentage,fixed',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|numeric|min:0.01|max:999999',
            'items.*.unit_price' => 'required|numeric|min:0|max:99999999',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Le client est obligatoire.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'date.required' => 'La date est obligatoire.',
            'validity_date.required' => 'La date de validité est obligatoire.',
            'validity_date.after_or_equal' => 'La date de validité doit être postérieure ou égale à la date du devis.',
            'items.required' => 'Au moins une ligne est requise.',
            'items.min' => 'Au moins une ligne est requise.',
            'items.*.description.required' => 'La description est obligatoire.',
            'items.*.quantity.required' => 'La quantité est obligatoire.',
            'items.*.quantity.min' => 'La quantité doit être supérieure à 0.',
            'items.*.unit_price.required' => 'Le prix unitaire est obligatoire.',
        ];
    }
}
