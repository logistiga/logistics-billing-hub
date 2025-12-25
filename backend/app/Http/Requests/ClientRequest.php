<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client')?->id;

        return [
            'name' => 'required|string|max:255',
            'nif' => 'required|string|max:50|unique:clients,nif,' . $clientId,
            'rccm' => 'required|string|max:50|unique:clients,rccm,' . $clientId,
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'contacts' => 'nullable|array',
            'contacts.*.name' => 'required_with:contacts|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.phone' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'La raison sociale est requise.',
            'nif.required' => 'Le numéro NIF est requis.',
            'nif.unique' => 'Ce numéro NIF est déjà utilisé.',
            'rccm.required' => 'Le numéro RCCM est requis.',
            'rccm.unique' => 'Ce numéro RCCM est déjà utilisé.',
            'email.email' => 'L\'email doit être valide.',
            'contacts.*.name.required_with' => 'Le nom du contact est requis.',
            'contacts.*.email.email' => 'L\'email du contact doit être valide.',
        ];
    }
}
