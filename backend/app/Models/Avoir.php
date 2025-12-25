<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Avoir extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero',
        'client_id',
        'invoice_id',
        'date',
        'amount',
        'remaining_amount',
        'reason',
        'type',
        'status',
        'validated_at',
    ];

    protected $casts = [
        'date' => 'date',
        'validated_at' => 'datetime',
        'amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    protected $appends = ['used_amount'];

    // Relations
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function items()
    {
        return $this->hasMany(AvoirItem::class);
    }

    public function compensations()
    {
        return $this->hasMany(AvoirCompensation::class);
    }

    // Accessors
    public function getUsedAmountAttribute()
    {
        return $this->amount - $this->remaining_amount;
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    public function scopeWithBalance($query)
    {
        return $query->where('remaining_amount', '>', 0);
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }
}
