<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LignePrestation extends Model
{
    use HasFactory;

    protected $table = 'lignes_prestations';

    protected $fillable = [
        'ordre_travail_id',
        'description',
        'quantite',
        'prix_unitaire',
        'unite',
        'tva_rate',
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix_unitaire' => 'decimal:2',
        'tva_rate' => 'decimal:2',
    ];

    protected $appends = ['montant', 'montant_ttc'];

    // Relations
    public function ordreTravail()
    {
        return $this->belongsTo(OrdreTravail::class, 'ordre_travail_id');
    }

    // Accessors
    public function getMontantAttribute()
    {
        return $this->quantite * $this->prix_unitaire;
    }

    public function getMontantTtcAttribute()
    {
        $montant = $this->montant;
        $tva = $montant * (($this->tva_rate ?? 0) / 100);
        return $montant + $tva;
    }
}
