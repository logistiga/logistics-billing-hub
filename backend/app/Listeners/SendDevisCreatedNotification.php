<?php

namespace App\Listeners;

use App\Events\DevisCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendDevisCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DevisCreated $event): void
    {
        $devis = $event->devis;
        
        Log::info('Devis created', [
            'devis_id' => $devis->id,
            'numero' => $devis->numero,
            'client' => $devis->client->name ?? 'N/A',
            'total' => $devis->total,
        ]);

        // TODO: Notify sales team
    }
}
