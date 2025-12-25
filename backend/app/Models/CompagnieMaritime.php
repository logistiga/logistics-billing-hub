<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompagnieMaritime extends Model
{
    use HasFactory;

    protected $table = 'compagnies_maritimes';

    protected $fillable = [
        'nom',
        'num_tc',
        'prix',
        'jours',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'jours' => 'integer',
    ];
}
