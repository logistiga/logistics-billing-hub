<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Caisse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    // Relations
    public function mouvements()
    {
        return $this->hasMany(MouvementCaisse::class);
    }

    // Accessors
    public function getTotalEncaissementsAttribute()
    {
        return $this->mouvements()->where('type', 'encaissement')->where('is_cancelled', false)->sum('amount');
    }

    public function getTotalDecaissementsAttribute()
    {
        return $this->mouvements()->where('type', 'decaissement')->where('is_cancelled', false)->sum('amount');
    }
}
