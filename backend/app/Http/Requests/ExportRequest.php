<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:clients,invoices,devis,avoirs,transactions,ordres,partenaires',
            'format' => 'required|in:xlsx,csv,pdf',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'status' => 'nullable|string|max:50',
            'client_id' => 'nullable|exists:clients,id',
            'banque_id' => 'nullable|exists:banques,id',
            'columns' => 'nullable|array',
            'columns.*' => 'string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type d\'export est obligatoire.',
            'type.in' => 'Le type d\'export est invalide.',
            'format.required' => 'Le format d\'export est obligatoire.',
            'format.in' => 'Le format doit être XLSX, CSV ou PDF.',
            'date_to.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
        ];
    }
}
