<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrimeRepresentant extends Model
{
    use HasFactory;

    protected $table = 'primes_representants';

    protected $fillable = [
        'representant_id',
        'invoice_id',
        'montant',
        'date',
        'status',
        'reference',
        'description',
        'date_paiement',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date' => 'date',
        'date_paiement' => 'date',
    ];

    // Relations
    public function representant()
    {
        return $this->belongsTo(Representant::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
