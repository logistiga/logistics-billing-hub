<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'banque_id' => 'required|exists:banques,id',
            'file' => 'required|file|mimes:csv,txt,xlsx,xls,ofx,qif|max:5120',
            'format' => 'nullable|in:csv,xlsx,ofx,qif',
            'date_format' => 'nullable|string|max:20',
            'delimiter' => 'nullable|string|max:1',
            'skip_first_row' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'banque_id.required' => 'Le compte bancaire est obligatoire.',
            'banque_id.exists' => 'Le compte bancaire sélectionné n\'existe pas.',
            'file.required' => 'Le fichier est obligatoire.',
            'file.mimes' => 'Le fichier doit être au format CSV, XLSX, XLS, OFX ou QIF.',
            'file.max' => 'Le fichier ne doit pas dépasser 5 Mo.',
        ];
    }
}
