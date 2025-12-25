<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Devis extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'devis';

    protected $fillable = [
        'numero',
        'client_id',
        'invoice_id',
        'date',
        'validity_date',
        'reference',
        'subject',
        'introduction',
        'conditions',
        'subtotal',
        'tax_amount',
        'discount',
        'discount_type',
        'discount_amount',
        'total',
        'status',
        'sent_at',
        'accepted_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'validity_date' => 'date',
        'sent_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

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
        return $this->hasMany(DevisItem::class);
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeExpired($query)
    {
        return $query->where('validity_date', '<', now())
            ->whereNotIn('status', ['accepted', 'rejected']);
    }

    // Methods
    public function isExpired()
    {
        return $this->validity_date < now() && !in_array($this->status, ['accepted', 'rejected']);
    }
}
