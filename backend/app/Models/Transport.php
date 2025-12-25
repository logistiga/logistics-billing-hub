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
        'telephone_chauffeur',
        'point_depart',
        'point_arrivee',
        'distance',
        'prix',
        'date_transport',
        'observations',
    ];

    protected $casts = [
        'date_transport' => 'date',
        'distance' => 'decimal:2',
        'prix' => 'decimal:2',
    ];

    // Relations
    public function ordreTravail()
    {
        return $this->belongsTo(OrdreTravail::class, 'ordre_travail_id');
    }
}
