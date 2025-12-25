<?php

namespace App\Listeners;

use App\Events\OrdreTravailValidated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrdreTravailValidatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrdreTravailValidated $event): void
    {
        $ordre = $event->ordreTravail;
        
        Log::info('Ordre de travail validated', [
            'ordre_id' => $ordre->id,
            'numero' => $ordre->numero,
            'validated_by' => $event->validatedBy->name,
        ]);

        // TODO: Notify creator and operations team
    }
}
