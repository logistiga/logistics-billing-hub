<?php

namespace App\Listeners;

use App\Events\LowCashBalance;
use App\Events\LowBankBalance;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendLowBalanceNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handleCash(LowCashBalance $event): void
    {
        Log::warning('Low cash balance alert', [
            'caisse' => $event->caisse->name,
            'current_balance' => $event->currentBalance,
            'threshold' => $event->threshold,
        ]);

        // TODO: Notify finance team urgently
    }

    public function handleBank(LowBankBalance $event): void
    {
        Log::warning('Low bank balance alert', [
            'banque' => $event->banque->name,
            'current_balance' => $event->currentBalance,
            'threshold' => $event->threshold,
        ]);

        // TODO: Notify finance team
    }
}
