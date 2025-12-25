<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementCaisse extends Model
{
    use HasFactory;

    protected $table = 'mouvements_caisse';

    protected $fillable = [
        'caisse_id',
        'invoice_id',
        'user_id',
        'type',
        'amount',
        'date',
        'reference',
        'description',
        'category',
        'beneficiary',
        'balance_after',
        'is_cancelled',
        'cancelled_at',
        'cancelled_by',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'is_cancelled' => 'boolean',
        'cancelled_at' => 'datetime',
    ];

    // Relations
    public function caisse()
    {
        return $this->belongsTo(Caisse::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // Scopes
    public function scopeEncaissements($query)
    {
        return $query->where('type', 'encaissement');
    }

    public function scopeDecaissements($query)
    {
        return $query->where('type', 'decaissement');
    }

    public function scopeActive($query)
    {
        return $query->where('is_cancelled', false);
    }
}
