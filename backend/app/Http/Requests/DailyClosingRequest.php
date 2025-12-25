<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DailyClosingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'caisse_id' => 'required|exists:caisses,id',
            'date' => 'required|date',
            'closing_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'caisse_id.required' => 'La caisse est obligatoire.',
            'caisse_id.exists' => 'La caisse sélectionnée n\'existe pas.',
            'date.required' => 'La date est obligatoire.',
            'closing_balance.required' => 'Le solde de clôture est obligatoire.',
            'closing_balance.min' => 'Le solde de clôture ne peut pas être négatif.',
        ];
    }
}
