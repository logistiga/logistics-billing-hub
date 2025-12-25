<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Banque extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'account_number',
        'iban',
        'swift',
        'initial_balance',
        'balance',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relations
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'banque_id');
    }

    public function credits()
    {
        return $this->hasMany(Credit::class, 'banque_id');
    }

    // Accessors
    public function getTotalCreditAttribute()
    {
        return $this->transactions()->sum('credit');
    }

    public function getTotalDebitAttribute()
    {
        return $this->transactions()->sum('debit');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Methods
    public function recalculateBalance()
    {
        $this->balance = $this->initial_balance + $this->transactions()->sum('credit') - $this->transactions()->sum('debit');
        $this->save();
    }
}
