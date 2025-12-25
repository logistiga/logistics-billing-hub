<?php

namespace App\Listeners;

use App\Events\InvoiceCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendInvoiceCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(InvoiceCreated $event): void
    {
        $invoice = $event->invoice;
        
        Log::info('Invoice created', [
            'invoice_id' => $invoice->id,
            'numero' => $invoice->numero,
            'client' => $invoice->client->name ?? 'N/A',
            'total' => $invoice->total,
        ]);

        // TODO: Send notification to admin/manager
        // Notification::send($admins, new InvoiceCreatedNotification($invoice));
    }
}
