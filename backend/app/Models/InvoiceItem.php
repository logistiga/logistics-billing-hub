<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'tax_rate',
        'amount',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    protected $appends = ['tax_amount', 'total'];

    // Relations
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    // Accessors
    public function getTaxAmountAttribute()
    {
        return $this->amount * (($this->tax_rate ?? 0) / 100);
    }

    public function getTotalAttribute()
    {
        return $this->amount + $this->tax_amount;
    }
}
