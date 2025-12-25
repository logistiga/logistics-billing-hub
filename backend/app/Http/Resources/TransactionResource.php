<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'banque_id' => $this->banque_id,
            'banque' => new BanqueResource($this->whenLoaded('banque')),
            'invoice_id' => $this->invoice_id,
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'partenaire_id' => $this->partenaire_id,
            'partenaire' => new PartenaireResource($this->whenLoaded('partenaire')),
            'type' => $this->type,
            'reference' => $this->reference,
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'date' => $this->date?->toDateString(),
            'value_date' => $this->value_date?->toDateString(),
            'category' => $this->category,
            'is_reconciled' => $this->is_reconciled,
            'reconciled_at' => $this->reconciled_at?->toDateString(),
            'reconciliation_note' => $this->reconciliation_note,
            'is_cancelled' => $this->is_cancelled,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
