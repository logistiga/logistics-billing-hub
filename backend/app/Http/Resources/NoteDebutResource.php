<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteDebutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'type' => $this->type,
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'ordre_travail_id' => $this->ordre_travail_id,
            'ordre_travail' => new OrdreTravailResource($this->whenLoaded('ordreTravail')),
            'date' => $this->date?->toDateString(),
            'reference' => $this->reference,
            'conteneur' => $this->conteneur,
            'type_conteneur' => $this->type_conteneur,
            'navire' => $this->navire,
            'armateur' => $this->armateur,
            'bl_number' => $this->bl_number,
            'port_chargement' => $this->port_chargement,
            'port_dechargement' => $this->port_dechargement,
            'date_arrivee' => $this->date_arrivee?->toDateString(),
            'date_debut_detention' => $this->date_debut_detention?->toDateString(),
            'date_fin_detention' => $this->date_fin_detention?->toDateString(),
            'date_ouverture' => $this->date_ouverture?->toDateString(),
            'date_reparation' => $this->date_reparation?->toDateString(),
            'montant_detention' => (float) $this->montant_detention,
            'frais_ouverture' => (float) $this->frais_ouverture,
            'cout_reparation' => (float) $this->cout_reparation,
            'nature_avarie' => $this->nature_avarie,
            'reparations_effectuees' => $this->reparations_effectuees,
            'notes' => $this->notes,
            'validated' => $this->validated,
            'validated_at' => $this->validated_at?->toISOString(),
            'validated_by' => $this->validated_by,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
