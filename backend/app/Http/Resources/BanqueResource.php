<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BanqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,
            'iban' => $this->iban,
            'bic' => $this->bic,
            'initial_balance' => (float) $this->initial_balance,
            'current_balance' => (float) $this->current_balance,
            'currency' => $this->currency,
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
            'total_credits' => $this->when(isset($this->total_credits), (float) $this->total_credits),
            'total_debits' => $this->when(isset($this->total_debits), (float) $this->total_debits),
            'transactions_count' => $this->when($this->transactions_count !== null, $this->transactions_count),
            'unreconciled_count' => $this->when($this->unreconciled_count !== null, $this->unreconciled_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
