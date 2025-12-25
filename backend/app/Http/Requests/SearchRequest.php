<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => 'nullable|string|max:100',
            'type' => 'nullable|in:all,clients,invoices,devis,ordres,avoirs,partenaires',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|max:50',
            'sort_order' => 'nullable|in:asc,desc',
        ];
    }

    public function messages(): array
    {
        return [
            'q.max' => 'La recherche ne peut pas dépasser 100 caractères.',
            'per_page.max' => 'Le nombre d\'éléments par page ne peut pas dépasser 100.',
        ];
    }
}
