<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntrepriseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'legal_form' => 'nullable|string|max:50',
            'siret' => 'nullable|string|max:14|regex:/^[0-9]{14}$/',
            'tva_number' => 'nullable|string|max:20',
            'capital' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'postal_code' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|max:2048',
            'iban' => 'nullable|string|max:34',
            'bic' => 'nullable|string|max:11',
            'bank_name' => 'nullable|string|max:100',
            'default_tva_rate' => 'nullable|numeric|min:0|max:100',
            'invoice_footer' => 'nullable|string|max:2000',
            'devis_footer' => 'nullable|string|max:2000',
            'invoice_prefix' => 'nullable|string|max:10',
            'devis_prefix' => 'nullable|string|max:10',
            'avoir_prefix' => 'nullable|string|max:10',
            'ordre_prefix' => 'nullable|string|max:10',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de l\'entreprise est obligatoire.',
            'siret.regex' => 'Le SIRET doit contenir 14 chiffres.',
            'email.email' => 'L\'adresse email n\'est pas valide.',
            'website.url' => 'L\'URL du site web n\'est pas valide.',
            'logo.image' => 'Le fichier doit être une image.',
            'logo.max' => 'L\'image ne doit pas dépasser 2 Mo.',
        ];
    }
}
