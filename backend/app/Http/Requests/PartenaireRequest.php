<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PartenaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'type' => 'required|in:fournisseur,sous-traitant,transporteur,autre',
            'contact_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'siret' => 'nullable|string|max:14|regex:/^[0-9]{14}$/',
            'tva_number' => 'nullable|string|max:20',
            'iban' => 'nullable|string|max:34',
            'bic' => 'nullable|string|max:11',
            'notes' => 'nullable|string|max:2000',
            'is_active' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'name.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'type.required' => 'Le type de partenaire est obligatoire.',
            'type.in' => 'Le type de partenaire est invalide.',
            'email.email' => 'L\'adresse email n\'est pas valide.',
            'siret.regex' => 'Le SIRET doit contenir 14 chiffres.',
        ];
    }
}
