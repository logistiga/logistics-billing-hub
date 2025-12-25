<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaiementTransitaire extends Model
{
    use HasFactory;

    protected $table = 'paiements_transitaires';

    protected $fillable = [
        'transitaire_id',
        'invoice_id',
        'montant',
        'date',
        'type',
        'status',
        'reference',
        'description',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date' => 'date',
    ];

    // Relations
    public function transitaire()
    {
        return $this->belongsTo(Transitaire::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
