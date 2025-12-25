<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255|unique:users,email,' . $userId,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'L\'adresse email n\'est pas valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'avatar.image' => 'Le fichier doit être une image.',
            'avatar.max' => 'L\'image ne doit pas dépasser 2 Mo.',
        ];
    }
}
