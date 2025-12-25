<?php

namespace App\Listeners;

use App\Events\DevisRejected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendDevisRejectedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DevisRejected $event): void
    {
        $devis = $event->devis;
        
        Log::info('Devis rejected by client', [
            'devis_id' => $devis->id,
            'numero' => $devis->numero,
            'client' => $devis->client->name ?? 'N/A',
            'reason' => $event->reason,
        ]);

        // TODO: Notify sales team for follow-up
    }
}
