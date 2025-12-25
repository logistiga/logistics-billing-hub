<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreditPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'credit_id' => 'required|exists:credits,id',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'principal' => 'nullable|numeric|min:0|max:99999999',
            'interest' => 'nullable|numeric|min:0|max:99999999',
            'date' => 'required|date',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:pending,paid,late',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'banque_id' => 'nullable|exists:banques,id',
        ];
    }

    public function messages(): array
    {
        return [
            'credit_id.required' => 'Le crédit est obligatoire.',
            'credit_id.exists' => 'Le crédit sélectionné n\'existe pas.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'date.required' => 'La date est obligatoire.',
        ];
    }
}
