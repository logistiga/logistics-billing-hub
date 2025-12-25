<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CreditResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'banque_id' => $this->banque_id,
            'banque' => new BanqueResource($this->whenLoaded('banque')),
            'name' => $this->name,
            'type' => $this->type,
            'montant_initial' => (float) $this->montant_initial,
            'montant_restant' => (float) $this->montant_restant,
            'taux_interet' => (float) $this->taux_interet,
            'date_debut' => $this->date_debut?->toDateString(),
            'date_fin' => $this->date_fin?->toDateString(),
            'duree_mois' => $this->duree_mois,
            'mensualite' => (float) $this->mensualite,
            'jour_prelevement' => $this->jour_prelevement,
            'echeances_payees' => $this->echeances_payees,
            'prochaine_echeance' => $this->prochaine_echeance?->toDateString(),
            'reference_contrat' => $this->reference_contrat,
            'organisme' => $this->organisme,
            'status' => $this->status,
            'notes' => $this->notes,
            'progression' => $this->progression,
            'is_overdue' => $this->is_overdue,
            'payments' => CreditPaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
