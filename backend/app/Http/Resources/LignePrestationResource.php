<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LignePrestationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ordre_travail_id' => $this->ordre_travail_id,
            'description' => $this->description,
            'quantite' => (float) $this->quantite,
            'prix_unitaire' => (float) $this->prix_unitaire,
            'unite' => $this->unite,
            'tva_rate' => (float) $this->tva_rate,
            'montant' => (float) $this->montant,
            'montant_ttc' => (float) $this->montant_ttc,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
