<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartenaireTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'partenaire_id',
        'type',
        'date',
        'credit',
        'debit',
        'reference',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'credit' => 'decimal:2',
        'debit' => 'decimal:2',
    ];

    // Relations
    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class);
    }
}
