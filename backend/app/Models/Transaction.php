<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'banque_id',
        'invoice_id',
        'type',
        'date',
        'credit',
        'debit',
        'reference',
        'description',
        'category',
        'is_reconciled',
        'reconciled_at',
    ];

    protected $casts = [
        'date' => 'date',
        'credit' => 'decimal:2',
        'debit' => 'decimal:2',
        'is_reconciled' => 'boolean',
        'reconciled_at' => 'datetime',
    ];

    protected $appends = ['amount', 'type_label'];

    // Relations
    public function banque()
    {
        return $this->belongsTo(Banque::class, 'banque_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    // Accessors
    public function getAmountAttribute()
    {
        return $this->credit > 0 ? $this->credit : -$this->debit;
    }

    public function getTypeLabelAttribute()
    {
        return $this->credit > 0 ? 'Crédit' : 'Débit';
    }

    // Scopes
    public function scopeCredits($query)
    {
        return $query->where('credit', '>', 0);
    }

    public function scopeDebits($query)
    {
        return $query->where('debit', '>', 0);
    }

    public function scopeReconciled($query)
    {
        return $query->where('is_reconciled', true);
    }

    public function scopeUnreconciled($query)
    {
        return $query->where('is_reconciled', false);
    }

    public function scopeForPeriod($query, $from, $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}
