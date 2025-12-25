<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'date' => 'required|date',
            'method' => 'required|in:cash,check,transfer,card,other',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'banque_id' => 'nullable|exists:banques,id',
            'caisse_id' => 'nullable|exists:caisses,id',
        ];
    }

    public function messages(): array
    {
        return [
            'invoice_id.required' => 'La facture est obligatoire.',
            'invoice_id.exists' => 'La facture sélectionnée n\'existe pas.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'date.required' => 'La date est obligatoire.',
            'method.required' => 'Le mode de paiement est obligatoire.',
            'method.in' => 'Le mode de paiement est invalide.',
        ];
    }
}
