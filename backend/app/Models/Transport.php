<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transport extends Model
{
    use HasFactory;

    protected $fillable = [
        'ordre_travail_id',
        'type',
        'vehicule',
        'immatriculation',
        'chauffeur',
        'depart',
        'arrivee',
        'date_depart',
        'date_arrivee',
        'distance_km',
        'prix',
        'notes',
    ];

    protected $casts = [
        'date_depart' => 'date',
        'date_arrivee' => 'date',
        'distance_km' => 'decimal:2',
        'prix' => 'decimal:2',
    ];

    // Relations
    public function ordreTravail()
    {
        return $this->belongsTo(OrdreTravail::class, 'ordre_travail_id');
    }
}
