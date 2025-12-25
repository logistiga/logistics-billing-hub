<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'description' => 'required|string|max:500',
            'quantity' => 'required|numeric|min:0.01|max:999999',
            'unit_price' => 'required|numeric|min:0|max:99999999',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'invoice_id.required' => 'La facture est obligatoire.',
            'invoice_id.exists' => 'La facture sélectionnée n\'existe pas.',
            'description.required' => 'La description est obligatoire.',
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.min' => 'La quantité doit être supérieure à 0.',
            'unit_price.required' => 'Le prix unitaire est obligatoire.',
        ];
    }
}
