<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ordre_travail_id' => $this->ordre_travail_id,
            'type' => $this->type,
            'vehicule' => $this->vehicule,
            'immatriculation' => $this->immatriculation,
            'chauffeur' => $this->chauffeur,
            'depart' => $this->depart,
            'arrivee' => $this->arrivee,
            'date_depart' => $this->date_depart?->toDateString(),
            'date_arrivee' => $this->date_arrivee?->toDateString(),
            'distance_km' => (float) $this->distance_km,
            'prix' => (float) $this->prix,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
