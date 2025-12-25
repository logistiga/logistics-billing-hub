<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'nif' => $this->nif,
            'rccm' => $this->rccm,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'balance' => $this->balance,
            'total_invoiced' => $this->when(isset($this->total_invoiced), $this->total_invoiced),
            'total_paid' => $this->when(isset($this->total_paid), $this->total_paid),
            'contacts' => ClientContactResource::collection($this->whenLoaded('contacts')),
            'invoices_count' => $this->when($this->invoices_count !== null, $this->invoices_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
