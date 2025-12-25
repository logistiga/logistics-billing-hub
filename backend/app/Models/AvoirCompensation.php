<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvoirCompensation extends Model
{
    use HasFactory;

    protected $fillable = [
        'avoir_id',
        'invoice_id',
        'amount',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Relations
    public function avoir()
    {
        return $this->belongsTo(Avoir::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
