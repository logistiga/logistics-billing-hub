<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrdreTravailResource extends JsonResource
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
            'date_fin' => $this->date_fin?->toDateString(),
            'reference' => $this->reference,
            'description' => $this->description,
            'lieu_intervention' => $this->lieu_intervention,
            'contact_site' => $this->contact_site,
            'telephone_site' => $this->telephone_site,
            'priorite' => $this->priorite,
            'status' => $this->status,
            'notes' => $this->notes,
            'total_ht' => (float) $this->total_ht,
            'total_tva' => (float) $this->total_tva,
            'total_ttc' => (float) $this->total_ttc,
            'validated_at' => $this->validated_at?->toISOString(),
            'validated_by' => $this->validated_by,
            'lignes' => LignePrestationResource::collection($this->whenLoaded('lignes')),
            'transports' => TransportResource::collection($this->whenLoaded('transports')),
            'notes_debut' => NoteDebutResource::collection($this->whenLoaded('notesDebut')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
