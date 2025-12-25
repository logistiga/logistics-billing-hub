<?php

namespace App\Listeners;

use App\Events\OrdreTravailCompleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrdreTravailCompletedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrdreTravailCompleted $event): void
    {
        $ordre = $event->ordreTravail;
        
        Log::info('Ordre de travail completed', [
            'ordre_id' => $ordre->id,
            'numero' => $ordre->numero,
            'client' => $ordre->client->name ?? 'N/A',
        ]);

        // TODO: Notify client
        // TODO: Trigger invoicing workflow
    }
}
