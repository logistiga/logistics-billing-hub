<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RapportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:revenue,receivables,treasury,activity,balance,profitability',
            'period' => 'nullable|in:day,week,month,quarter,year,custom',
            'date_from' => 'required_if:period,custom|nullable|date',
            'date_to' => 'required_if:period,custom|nullable|date|after_or_equal:date_from',
            'group_by' => 'nullable|in:day,week,month,quarter,year,client,type',
            'client_id' => 'nullable|exists:clients,id',
            'banque_id' => 'nullable|exists:banques,id',
            'format' => 'nullable|in:json,pdf,xlsx',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de rapport est obligatoire.',
            'type.in' => 'Le type de rapport est invalide.',
            'date_from.required_if' => 'La date de début est obligatoire pour une période personnalisée.',
            'date_to.required_if' => 'La date de fin est obligatoire pour une période personnalisée.',
            'date_to.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début.',
        ];
    }
}
