<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transitaire extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'compagnie',
        'nom',
        'tel',
        'email',
        'adresse',
        'solde',
    ];

    protected $casts = [
        'solde' => 'decimal:2',
    ];

    // Relations
    public function paiements()
    {
        return $this->hasMany(PaiementTransitaire::class);
    }

    // Méthodes
    public function recalculerSolde()
    {
        $debits = $this->paiements()->where('type', 'debit')->where('status', 'paid')->sum('montant');
        $credits = $this->paiements()->where('type', 'credit')->sum('montant');
        $this->solde = $credits - $debits;
        $this->save();
    }
}
