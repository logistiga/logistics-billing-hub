<?php

namespace App\Listeners;

use App\Events\InvoiceOverdue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendInvoiceOverdueNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(InvoiceOverdue $event): void
    {
        $invoice = $event->invoice;
        
        Log::warning('Invoice overdue', [
            'invoice_id' => $invoice->id,
            'numero' => $invoice->numero,
            'client' => $invoice->client->name ?? 'N/A',
            'days_overdue' => $event->daysOverdue,
            'amount_due' => $invoice->total - $invoice->amount_paid,
        ]);

        // TODO: Send reminder to client
        // TODO: Notify collection team
    }
}
