<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'status' => 'nullable|string|max:50',
            'client_id' => 'nullable|exists:clients,id',
            'partenaire_id' => 'nullable|exists:partenaires,id',
            'banque_id' => 'nullable|exists:banques,id',
            'type' => 'nullable|string|max:50',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0|gte:min_amount',
            'is_paid' => 'nullable|boolean',
            'is_overdue' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'date_to.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
            'max_amount.gte' => 'Le montant maximum doit être supérieur ou égal au montant minimum.',
        ];
    }
}
