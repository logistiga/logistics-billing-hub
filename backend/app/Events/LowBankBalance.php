<?php

namespace App\Events;

use App\Models\Banque;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowBankBalance
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Banque $banque,
        public float $currentBalance,
        public float $threshold
    ) {}
}
