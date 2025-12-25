<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ordre_travail_id' => 'required|exists:ordres_travail,id',
            'type' => 'required|string|max:100',
            'vehicule' => 'nullable|string|max:100',
            'immatriculation' => 'nullable|string|max:20',
            'chauffeur' => 'nullable|string|max:100',
            'depart' => 'nullable|string|max:255',
            'arrivee' => 'nullable|string|max:255',
            'date_depart' => 'nullable|date',
            'date_arrivee' => 'nullable|date|after_or_equal:date_depart',
            'distance_km' => 'nullable|numeric|min:0|max:999999',
            'prix' => 'nullable|numeric|min:0|max:99999999',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'ordre_travail_id.required' => 'L\'ordre de travail est obligatoire.',
            'ordre_travail_id.exists' => 'L\'ordre de travail sélectionné n\'existe pas.',
            'type.required' => 'Le type de transport est obligatoire.',
            'date_arrivee.after_or_equal' => 'La date d\'arrivée doit être postérieure ou égale à la date de départ.',
        ];
    }
}
