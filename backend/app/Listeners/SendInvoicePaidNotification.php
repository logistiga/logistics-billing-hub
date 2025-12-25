<?php

namespace App\Listeners;

use App\Events\InvoicePaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendInvoicePaidNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(InvoicePaid $event): void
    {
        $invoice = $event->invoice;
        $payment = $event->payment;
        
        Log::info('Invoice fully paid', [
            'invoice_id' => $invoice->id,
            'numero' => $invoice->numero,
            'total' => $invoice->total,
            'final_payment' => $payment->amount,
        ]);

        // TODO: Send payment confirmation to client
        // TODO: Generate receipt
    }
}
