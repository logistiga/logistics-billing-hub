<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NoteDebut extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notes_debut';

    protected $fillable = [
        'number',
        'type',
        'client_id',
        'ordre_travail_id',
        'conteneur',
        'date_arrivee',
        'date_sortie',
        'jours_detention',
        'montant_detention',
        'details',
        'status',
    ];

    protected $casts = [
        'date_arrivee' => 'date',
        'date_sortie' => 'date',
        'jours_detention' => 'integer',
        'montant_detention' => 'decimal:2',
        'details' => 'array',
    ];

    // Relations
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function ordreTravail()
    {
        return $this->belongsTo(OrdreTravail::class, 'ordre_travail_id');
    }

    // Scopes
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }
}
