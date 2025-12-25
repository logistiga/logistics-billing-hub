<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaisseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'balance' => (float) $this->balance,
            'total_encaissements' => $this->when(isset($this->total_encaissements), (float) $this->total_encaissements),
            'total_decaissements' => $this->when(isset($this->total_decaissements), (float) $this->total_decaissements),
            'mouvements_count' => $this->when($this->mouvements_count !== null, $this->mouvements_count),
            'mouvements' => MouvementCaisseResource::collection($this->whenLoaded('mouvements')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
