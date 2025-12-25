<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'client_id',
        'date',
        'due_date',
        'amount',
        'paid',
        'advance',
        'status',
        'type',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'amount' => 'decimal:2',
        'paid' => 'decimal:2',
        'advance' => 'decimal:2',
    ];

    protected $attributes = [
        'paid' => 0,
        'advance' => 0,
        'status' => 'pending',
    ];

    /**
     * Client de la facture
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Lignes de la facture
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Paiements de la facture
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Avoirs liés à cette facture
     */
    public function avoirs(): HasMany
    {
        return $this->hasMany(Avoir::class);
    }

    /**
     * Montant restant à payer
     */
    public function getRemainingAttribute(): float
    {
        return $this->amount - $this->paid - $this->advance;
    }

    /**
     * Vérifier si la facture est en retard
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status !== 'paid' && $this->due_date < now();
    }

    /**
     * Mettre à jour le statut automatiquement
     */
    protected static function booted()
    {
        static::saving(function ($invoice) {
            // Mettre à jour le statut en fonction des paiements
            if ($invoice->isDirty(['paid', 'advance', 'amount'])) {
                $remaining = $invoice->amount - $invoice->paid - $invoice->advance;
                
                if ($remaining <= 0) {
                    $invoice->status = 'paid';
                } elseif ($invoice->paid > 0 || $invoice->advance > 0) {
                    $invoice->status = 'partial';
                } elseif ($invoice->due_date < now()) {
                    $invoice->status = 'overdue';
                }
            }
        });
    }
}
