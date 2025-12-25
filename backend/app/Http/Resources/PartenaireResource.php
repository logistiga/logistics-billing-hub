<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartenaireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'contact_name' => $this->contact_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'siret' => $this->siret,
            'tva_number' => $this->tva_number,
            'iban' => $this->iban,
            'bic' => $this->bic,
            'balance' => (float) $this->balance,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'transactions_count' => $this->when($this->transactions_count !== null, $this->transactions_count),
            'transactions' => PartenaireTransactionResource::collection($this->whenLoaded('transactions')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
