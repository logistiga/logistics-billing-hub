<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'banque_id' => $this->banque_id,
            'banque' => new BanqueResource($this->whenLoaded('banque')),
            'caisse_id' => $this->caisse_id,
            'caisse' => new CaisseResource($this->whenLoaded('caisse')),
            'amount' => (float) $this->amount,
            'date' => $this->date?->toDateString(),
            'method' => $this->method,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'is_cancelled' => $this->is_cancelled,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
