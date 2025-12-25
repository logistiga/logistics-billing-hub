<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DevisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'invoice_id' => $this->invoice_id,
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'date' => $this->date?->toDateString(),
            'validity_date' => $this->validity_date?->toDateString(),
            'reference' => $this->reference,
            'subject' => $this->subject,
            'introduction' => $this->introduction,
            'conditions' => $this->conditions,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'discount' => (float) $this->discount,
            'discount_type' => $this->discount_type,
            'discount_amount' => (float) $this->discount_amount,
            'total' => (float) $this->total,
            'status' => $this->status,
            'is_expired' => $this->isExpired(),
            'sent_at' => $this->sent_at?->toISOString(),
            'accepted_at' => $this->accepted_at?->toISOString(),
            'rejected_at' => $this->rejected_at?->toISOString(),
            'rejection_reason' => $this->rejection_reason,
            'items' => DevisItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
