<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BanqueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $banqueId = $this->route('banque') ? $this->route('banque')->id : null;

        return [
            'name' => 'required|string|max:100',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:34|regex:/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/',
            'bic' => 'nullable|string|max:11|regex:/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/',
            'initial_balance' => 'nullable|numeric|min:-99999999|max:99999999',
            'currency' => 'nullable|string|size:3',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du compte est obligatoire.',
            'name.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'iban.regex' => 'Le format IBAN est invalide.',
            'bic.regex' => 'Le format BIC/SWIFT est invalide.',
        ];
    }
}
