<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Container extends Model
{
    use HasFactory;

    protected $table = 'containers';

    protected $fillable = [
        'ordre_travail_id',
        'numero',
        'type',
        'description',
    ];

    public function ordreTravail()
    {
        return $this->belongsTo(OrdreTravail::class, 'ordre_travail_id');
    }
}
