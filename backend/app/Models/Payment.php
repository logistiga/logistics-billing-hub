<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'banque_id',
        'amount',
        'date',
        'method',
        'reference',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Relations
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function banque()
    {
        return $this->belongsTo(Banque::class, 'banque_id');
    }

    // Scopes
    public function scopeForPeriod($query, $from, $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}
