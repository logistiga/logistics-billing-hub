<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendPaymentReceivedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(PaymentReceived $event): void
    {
        $payment = $event->payment;
        $invoice = $payment->invoice;
        
        Log::info('Payment received', [
            'payment_id' => $payment->id,
            'invoice_numero' => $invoice->numero,
            'amount' => $payment->amount,
            'method' => $payment->payment_method,
        ]);

        // TODO: Send confirmation to client
        // TODO: Notify accounting team
    }
}
