<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvoirItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'avoir_id',
        'description',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
    ];

    protected $appends = ['amount'];

    // Relations
    public function avoir()
    {
        return $this->belongsTo(Avoir::class);
    }

    // Accessors
    public function getAmountAttribute()
    {
        return $this->quantity * $this->unit_price;
    }
}
