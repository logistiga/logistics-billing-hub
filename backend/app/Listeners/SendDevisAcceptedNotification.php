<?php

namespace App\Listeners;

use App\Events\DevisAccepted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendDevisAcceptedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DevisAccepted $event): void
    {
        $devis = $event->devis;
        
        Log::info('Devis accepted by client', [
            'devis_id' => $devis->id,
            'numero' => $devis->numero,
            'client' => $devis->client->name ?? 'N/A',
            'total' => $devis->total,
        ]);

        // TODO: Notify sales team
        // TODO: Trigger invoice creation workflow
    }
}
