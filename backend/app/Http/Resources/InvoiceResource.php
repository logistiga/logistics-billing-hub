<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'ordre_travail_id' => $this->ordre_travail_id,
            'ordre_travail' => new OrdreTravailResource($this->whenLoaded('ordreTravail')),
            'date' => $this->date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'type' => $this->type,
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
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => (float) $this->remaining_amount,
            'status' => $this->status,
            'is_overdue' => $this->is_overdue,
            'days_overdue' => $this->days_overdue,
            'sent_at' => $this->sent_at?->toISOString(),
            'paid_at' => $this->paid_at?->toISOString(),
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'avoirs' => AvoirResource::collection($this->whenLoaded('avoirs')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
