<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'nif',
        'rccm',
        'address',
        'city',
        'phone',
        'email',
    ];

    protected $appends = ['total_invoices', 'balance'];

    /**
     * Contacts du client
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(ClientContact::class);
    }

    /**
     * Factures du client
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Ordres de travail du client
     */
    public function ordresTravail(): HasMany
    {
        return $this->hasMany(OrdreTravail::class);
    }

    /**
     * Notes de début du client
     */
    public function notesDebut(): HasMany
    {
        return $this->hasMany(NoteDebut::class);
    }

    /**
     * Avoirs du client
     */
    public function avoirs(): HasMany
    {
        return $this->hasMany(Avoir::class);
    }

    /**
     * Total des factures
     */
    public function getTotalInvoicesAttribute(): int
    {
        return $this->invoices()->count();
    }

    /**
     * Solde du client (montant dû)
     */
    public function getBalanceAttribute(): float
    {
        return $this->invoices()
            ->selectRaw('SUM(amount - paid - advance) as balance')
            ->value('balance') ?? 0;
    }
}
