<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvoirCompensationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avoir_id' => 'required|exists:avoirs,id',
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'avoir_id.required' => 'L\'avoir est obligatoire.',
            'avoir_id.exists' => 'L\'avoir sélectionné n\'existe pas.',
            'invoice_id.required' => 'La facture est obligatoire.',
            'invoice_id.exists' => 'La facture sélectionnée n\'existe pas.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'date.required' => 'La date est obligatoire.',
        ];
    }
}
