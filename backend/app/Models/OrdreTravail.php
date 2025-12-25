<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrdreTravail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ordres_travail';

    protected $fillable = [
        'numero',
        'client_id',
        'invoice_id',
        'date',
        'reference',
        'navire',
        'voyage',
        'type_operation',
        'marchandise',
        'poids',
        'nombre_colis',
        'lieu_operation',
        'observations',
        'status',
        'validated_at',
    ];

    protected $casts = [
        'date' => 'date',
        'validated_at' => 'datetime',
        'poids' => 'decimal:2',
        'nombre_colis' => 'integer',
    ];

    protected $appends = ['total'];

    // Relations
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function lignesPrestations()
    {
        return $this->hasMany(LignePrestation::class, 'ordre_travail_id');
    }

    public function transport()
    {
        return $this->hasOne(Transport::class, 'ordre_travail_id');
    }

    public function notes()
    {
        return $this->hasMany(NoteDebut::class, 'ordre_travail_id');
    }

    // Accessors
    public function getTotalAttribute()
    {
        return $this->lignesPrestations->sum(function ($ligne) {
            return $ligne->quantite * $ligne->prix_unitaire;
        });
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }
}
