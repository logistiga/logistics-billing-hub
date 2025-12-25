<?php

namespace App\Events;

use App\Models\Avoir;
use App\Models\AvoirCompensation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AvoirUsed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Avoir $avoir,
        public AvoirCompensation $compensation
    ) {}
}
