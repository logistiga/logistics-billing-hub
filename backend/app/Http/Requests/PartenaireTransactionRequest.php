<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PartenaireTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partenaire_id' => 'required|exists:partenaires,id',
            'type' => 'required|in:facture,paiement,avoir,autre',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'amount' => 'required|numeric|min:0.01|max:99999999',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'status' => 'nullable|in:pending,paid,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'partenaire_id.required' => 'Le partenaire est obligatoire.',
            'partenaire_id.exists' => 'Le partenaire sélectionné n\'existe pas.',
            'type.required' => 'Le type de transaction est obligatoire.',
            'type.in' => 'Le type de transaction est invalide.',
            'amount.required' => 'Le montant est obligatoire.',
            'amount.min' => 'Le montant doit être supérieur à 0.',
            'date.required' => 'La date est obligatoire.',
            'due_date.after_or_equal' => 'La date d\'échéance doit être postérieure ou égale à la date.',
        ];
    }
}
