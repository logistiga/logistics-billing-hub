<?php

namespace App\Listeners;

use App\Events\AvoirCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendAvoirCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(AvoirCreated $event): void
    {
        $avoir = $event->avoir;
        
        Log::info('Avoir created', [
            'avoir_id' => $avoir->id,
            'numero' => $avoir->numero,
            'client' => $avoir->client->name ?? 'N/A',
            'total' => $avoir->total,
            'reason' => $avoir->reason,
        ]);

        // TODO: Notify accounting team
        // TODO: Send confirmation to client
    }
}
