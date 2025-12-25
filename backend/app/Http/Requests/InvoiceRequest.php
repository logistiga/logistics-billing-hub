<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date',
            'type' => 'required|in:Manutention,Transport,Stockage,Location',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:500',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Le client est requis.',
            'client_id.exists' => 'Le client sélectionné n\'existe pas.',
            'date.required' => 'La date est requise.',
            'due_date.required' => 'La date d\'échéance est requise.',
            'due_date.after_or_equal' => 'La date d\'échéance doit être postérieure ou égale à la date.',
            'type.required' => 'Le type de prestation est requis.',
            'items.required' => 'Au moins une ligne de facturation est requise.',
            'items.*.description.required' => 'La description de la ligne est requise.',
            'items.*.quantity.required' => 'La quantité est requise.',
            'items.*.quantity.min' => 'La quantité doit être au moins 1.',
            'items.*.unit_price.required' => 'Le prix unitaire est requis.',
            'items.*.unit_price.min' => 'Le prix unitaire doit être positif.',
        ];
    }
}
