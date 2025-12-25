<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AvoirResource extends JsonResource
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
            'reason' => $this->reason,
            'notes' => $this->notes,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'used_amount' => (float) $this->used_amount,
            'remaining_amount' => (float) $this->remaining_amount,
            'status' => $this->status,
            'items' => AvoirItemResource::collection($this->whenLoaded('items')),
            'compensations' => AvoirCompensationResource::collection($this->whenLoaded('compensations')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
