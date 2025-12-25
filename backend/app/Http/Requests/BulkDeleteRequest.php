<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Au moins un élément doit être sélectionné.',
            'ids.min' => 'Au moins un élément doit être sélectionné.',
            'ids.*.integer' => 'Les identifiants doivent être des nombres entiers.',
        ];
    }
}
