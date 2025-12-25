<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Representant extends Model
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
    public function primes()
    {
        return $this->hasMany(PrimeRepresentant::class);
    }

    // Méthodes
    public function recalculerSolde()
    {
        $pending = $this->primes()->where('status', 'pending')->sum('montant');
        $this->solde = $pending;
        $this->save();
    }
}
