<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_ids' => 'required|array|min:1',
            'transaction_ids.*' => 'required|exists:transactions,id',
            'reconciliation_note' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_ids.required' => 'Au moins une transaction doit être sélectionnée.',
            'transaction_ids.min' => 'Au moins une transaction doit être sélectionnée.',
            'transaction_ids.*.exists' => 'Une des transactions sélectionnées n\'existe pas.',
        ];
    }
}
