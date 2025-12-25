<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user')->id : null;

        $rules = [
            'name' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($userId),
            ],
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|exists:roles,name',
            'is_active' => 'nullable|boolean',
        ];

        // Password required only on create
        if ($this->isMethod('POST')) {
            $rules['password'] = ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()];
        } else {
            $rules['password'] = ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L\'email est obligatoire.',
            'email.email' => 'L\'adresse email n\'est pas valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'role.exists' => 'Le rôle sélectionné n\'existe pas.',
        ];
    }
}
