<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MouvementCaisseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'caisse_id' => 'required|exists:caisses,id',
            'type' => 'required|in:encaissement,decaissement',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'date' => 'required|date',
            'payment_method' => 'nullable|in:cash,check,card,other',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'invoice_id' => 'nullable|exists:invoices,id',
            'client_id' => 'nullable|exists:clients,id',
        ];
    }

    public function messages(): array
    {
        return [
            'caisse_id.required' => 'La caisse est obligatoire.',
            'caisse_id.exists' => 'La caisse sélectionnée n\'existe pas.',
            'type.required' => 'Le type de mouvement est obligatoire.',
            'type.in' => 'Le type doit être encaissement ou décaissement.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'date.required' => 'La date est obligatoire.',
        ];
    }
}
