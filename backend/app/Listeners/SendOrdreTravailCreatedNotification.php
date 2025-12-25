<?php

namespace App\Listeners;

use App\Events\OrdreTravailCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrdreTravailCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrdreTravailCreated $event): void
    {
        $ordre = $event->ordreTravail;
        
        Log::info('Ordre de travail created', [
            'ordre_id' => $ordre->id,
            'numero' => $ordre->numero,
            'client' => $ordre->client->name ?? 'N/A',
            'type_operation' => $ordre->type_operation,
        ]);

        // TODO: Notify operations team
    }
}
