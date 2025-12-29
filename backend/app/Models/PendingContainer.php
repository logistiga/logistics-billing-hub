<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingContainer extends Model
{
    use HasFactory;

    protected $table = 'pending_containers';

    protected $fillable = [
        'booking_number',
        'container_number',
        'container_type',
        'container_size',
        'weight',
        'seal_number',
        'description',
        'client_id',
        'client_name',
        'vessel_name',
        'voyage_number',
        'shipping_line',
        'port_origin',
        'port_destination',
        'eta',
        'etd',
        'operation_type',
        'status',
        'source',
        'external_id',
        'ordre_travail_id',
        'processed_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'eta' => 'datetime',
        'etd' => 'datetime',
        'processed_at' => 'datetime',
        'rejected_at' => 'datetime',
        'weight' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function ordreTravail()
    {
        return $this->belongsTo(OrdreTravail::class, 'ordre_travail_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    public function scopeByBooking($query, string $bookingNumber)
    {
        return $query->where('booking_number', $bookingNumber);
    }
}
