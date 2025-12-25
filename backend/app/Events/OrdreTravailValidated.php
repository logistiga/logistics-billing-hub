<?php

namespace App\Events;

use App\Models\OrdreTravail;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrdreTravailValidated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public OrdreTravail $ordreTravail,
        public User $validatedBy
    ) {}
}
