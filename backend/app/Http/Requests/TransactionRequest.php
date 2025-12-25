<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'banque_id' => 'required|exists:banques,id',
            'type' => 'required|in:credit,debit',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'date' => 'required|date',
            'value_date' => 'nullable|date',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'invoice_id' => 'nullable|exists:invoices,id',
            'client_id' => 'nullable|exists:clients,id',
            'partenaire_id' => 'nullable|exists:partenaires,id',
        ];
    }

    public function messages(): array
    {
        return [
            'banque_id.required' => 'Le compte bancaire est obligatoire.',
            'banque_id.exists' => 'Le compte bancaire sélectionné n\'existe pas.',
            'type.required' => 'Le type de transaction est obligatoire.',
            'type.in' => 'Le type doit être crédit ou débit.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'date.required' => 'La date est obligatoire.',
        ];
    }
}
