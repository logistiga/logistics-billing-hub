<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CaisseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'balance' => 'nullable|numeric|min:0|max:99999999',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la caisse est obligatoire.',
            'name.max' => 'Le nom ne peut pas dépasser 100 caractères.',
        ];
    }
}
