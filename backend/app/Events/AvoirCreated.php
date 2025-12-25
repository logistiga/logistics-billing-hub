<?php

namespace App\Events;

use App\Models\Avoir;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AvoirCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Avoir $avoir
    ) {}
}
