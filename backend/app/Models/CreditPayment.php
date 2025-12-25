<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'credit_id',
        'banque_id',
        'amount',
        'principal',
        'interest',
        'date',
        'reference',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'principal' => 'decimal:2',
        'interest' => 'decimal:2',
    ];

    // Relations
    public function credit()
    {
        return $this->belongsTo(Credit::class);
    }

    public function banque()
    {
        return $this->belongsTo(Banque::class, 'banque_id');
    }
}
