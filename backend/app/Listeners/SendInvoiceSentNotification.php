<?php

namespace App\Listeners;

use App\Events\InvoiceSent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvoiceSentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(InvoiceSent $event): void
    {
        $invoice = $event->invoice;
        
        Log::info('Invoice sent to client', [
            'invoice_id' => $invoice->id,
            'numero' => $invoice->numero,
            'recipient' => $event->recipientEmail,
        ]);

        // TODO: Send email with invoice PDF
        // Mail::to($event->recipientEmail)->send(new InvoiceMail($invoice));
    }
}
