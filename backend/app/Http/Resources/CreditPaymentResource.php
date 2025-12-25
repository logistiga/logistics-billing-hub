<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreditPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'credit_id' => $this->credit_id,
            'credit' => new CreditResource($this->whenLoaded('credit')),
            'banque_id' => $this->banque_id,
            'banque' => new BanqueResource($this->whenLoaded('banque')),
            'amount' => (float) $this->amount,
            'principal' => (float) $this->principal,
            'interest' => (float) $this->interest,
            'date' => $this->date?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'status' => $this->status,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
