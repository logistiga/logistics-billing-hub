<?php

namespace App\Listeners;

use App\Events\DevisExpired;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendDevisExpiredNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(DevisExpired $event): void
    {
        $devis = $event->devis;
        
        Log::info('Devis expired', [
            'devis_id' => $devis->id,
            'numero' => $devis->numero,
            'validity_date' => $devis->validity_date,
        ]);

        // TODO: Notify sales team for renewal
    }
}
