<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvoirRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'date' => 'required|date',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|numeric|min:0.01|max:999999',
            'items.*.unit_price' => 'required|numeric|min:0|max:99999999',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Le client est obligatoire.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'invoice_id.exists' => 'La facture sélectionnée n\'existe pas.',
            'date.required' => 'La date est obligatoire.',
            'items.required' => 'Au moins une ligne est requise.',
            'items.min' => 'Au moins une ligne est requise.',
            'items.*.description.required' => 'La description est obligatoire.',
            'items.*.quantity.required' => 'La quantité est obligatoire.',
            'items.*.unit_price.required' => 'Le prix unitaire est obligatoire.',
        ];
    }
}
