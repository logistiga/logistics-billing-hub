<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntrepriseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'legal_form' => $this->legal_form,
            'siret' => $this->siret,
            'tva_number' => $this->tva_number,
            'capital' => $this->capital,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'country' => $this->country,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'logo' => $this->logo,
            'logo_url' => $this->logo ? asset('storage/' . $this->logo) : null,
            'iban' => $this->iban,
            'bic' => $this->bic,
            'bank_name' => $this->bank_name,
            'default_tva_rate' => (float) $this->default_tva_rate,
            'invoice_footer' => $this->invoice_footer,
            'devis_footer' => $this->devis_footer,
            'invoice_prefix' => $this->invoice_prefix,
            'devis_prefix' => $this->devis_prefix,
            'avoir_prefix' => $this->avoir_prefix,
            'ordre_prefix' => $this->ordre_prefix,
            'next_invoice_number' => $this->next_invoice_number,
            'next_devis_number' => $this->next_devis_number,
            'next_avoir_number' => $this->next_avoir_number,
            'next_ordre_number' => $this->next_ordre_number,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
