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
        'number',
        'numero_booking',
        'numero_connaissement',
        'client_id',
        'invoice_id',
        'date',
        'type',
        'description',
        'amount',
        'reference',
        'navire',
        'voyage',
        'compagnie_maritime',
        'transitaire',
        'nombre_conteneurs',
        'prime_transitaire',
        'prime_representant',
        'type_operation',
        'marchandise',
        'poids',
        'nombre_colis',
        'lieu_operation',
        'observations',
        'status',
        'source',
        'external_id',
        'synced_at',
        'validated_at',
    ];

    protected $casts = [
        'date' => 'date',
        'validated_at' => 'datetime',
        'synced_at' => 'datetime',
        'poids' => 'decimal:2',
        'nombre_colis' => 'integer',
        'nombre_conteneurs' => 'integer',
        'prime_transitaire' => 'decimal:2',
        'prime_representant' => 'decimal:2',
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

    public function containers()
    {
        return $this->hasMany(Container::class, 'ordre_travail_id');
    }

    public function transport()
    {
        return $this->hasOne(Transport::class, 'ordre_travail_id');
    }

    public function notes()
    {
        return $this->hasMany(NoteDebut::class, 'ordre_travail_id');
    }

    public function taxes()
    {
        return $this->belongsToMany(Tax::class, 'ordre_travail_taxes')
            ->withPivot(['rate', 'amount'])
            ->withTimestamps();
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
