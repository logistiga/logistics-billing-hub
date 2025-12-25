<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partenaire extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'nif',
        'rc',
        'bank_name',
        'bank_account',
        'iban',
        'contact_name',
        'contact_phone',
        'contact_email',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relations
    public function transactions()
    {
        return $this->hasMany(PartenaireTransaction::class);
    }

    // Accessors
    public function getBalanceAttribute()
    {
        return $this->transactions()->sum('credit') - $this->transactions()->sum('debit');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeSuppliers($query)
    {
        return $query->where('type', 'supplier');
    }

    public function scopeTransporters($query)
    {
        return $query->where('type', 'transporter');
    }
}
