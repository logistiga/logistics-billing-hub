<?php

namespace App\Listeners;

use App\Events\CreditPaymentOverdue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendCreditPaymentOverdueNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(CreditPaymentOverdue $event): void
    {
        $credit = $event->credit;
        $payment = $event->payment;
        
        Log::warning('Credit payment overdue', [
            'credit_id' => $credit->id,
            'reference' => $credit->reference,
            'echeance' => $payment->echeance_numero,
            'amount' => $payment->montant_total,
            'days_overdue' => $event->daysOverdue,
        ]);

        // TODO: Send urgent notification to finance team
    }
}
