<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Credit extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank',
        'reference',
        'capital_initial',
        'capital_restant',
        'taux_interet',
        'mensualite',
        'date_debut',
        'date_fin',
        'duree_total',
        'echeances_payees',
        'status',
        'prochain_paiement',
        'objet_credit',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'prochain_paiement' => 'date',
        'capital_initial' => 'decimal:2',
        'capital_restant' => 'decimal:2',
        'taux_interet' => 'decimal:2',
        'mensualite' => 'decimal:2',
    ];

    protected $attributes = [
        'echeances_payees' => 0,
        'status' => 'active',
    ];

    /**
     * Paiements du crédit
     */
    public function payments(): HasMany
    {
        return $this->hasMany(CreditPayment::class);
    }

    /**
     * Pourcentage de progression
     */
    public function getProgressionAttribute(): float
    {
        if ($this->duree_total <= 0) return 0;
        return ($this->echeances_payees / $this->duree_total) * 100;
    }

    /**
     * Vérifier si le crédit est en retard
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'active' && $this->prochain_paiement < now();
    }

    /**
     * Mettre à jour le statut automatiquement
     */
    protected static function booted()
    {
        static::saving(function ($credit) {
            // Vérifier si le crédit est terminé
            if ($credit->echeances_payees >= $credit->duree_total) {
                $credit->status = 'completed';
            }
            
            // Vérifier si en retard
            if ($credit->status === 'active' && $credit->prochain_paiement < now()) {
                $credit->status = 'overdue';
            }
        });
    }
}
