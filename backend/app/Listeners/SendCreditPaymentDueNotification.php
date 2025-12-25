<?php

namespace App\Listeners;

use App\Events\CreditPaymentDue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendCreditPaymentDueNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(CreditPaymentDue $event): void
    {
        $credit = $event->credit;
        $payment = $event->payment;
        
        Log::info('Credit payment due soon', [
            'credit_id' => $credit->id,
            'reference' => $credit->reference,
            'echeance' => $payment->echeance_numero,
            'amount' => $payment->montant_total,
            'days_until_due' => $event->daysUntilDue,
        ]);

        // TODO: Notify finance team
    }
}
