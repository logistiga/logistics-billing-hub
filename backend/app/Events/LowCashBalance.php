<?php

namespace App\Events;

use App\Models\Caisse;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowCashBalance
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Caisse $caisse,
        public float $currentBalance,
        public float $threshold
    ) {}
}
