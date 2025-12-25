<?php

namespace App\Console\Commands;

use App\Events\InvoiceOverdue;
use App\Mail\PaymentReminderMail;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendPaymentReminders extends Command
{
    protected $signature = 'invoices:send-reminders 
                            {--days=7 : Days before/after due date to send reminder}
                            {--overdue : Only send reminders for overdue invoices}';

    protected $description = 'Send payment reminders for unpaid invoices';

    public function handle(): int
    {
        $this->info('Checking for invoices requiring payment reminders...');

        $daysThreshold = (int) $this->option('days');
        $onlyOverdue = $this->option('overdue');

        $query = Invoice::with('client')
            ->whereIn('status', ['sent', 'partial', 'overdue'])
            ->whereRaw('total > amount_paid');

        if ($onlyOverdue) {
            $query->where('due_date', '<', now());
        } else {
            // Include invoices due within X days or overdue
            $query->where('due_date', '<=', now()->addDays($daysThreshold));
        }

        $invoices = $query->get();

        if ($invoices->isEmpty()) {
            $this->info('No invoices requiring reminders.');
            return Command::SUCCESS;
        }

        $sentCount = 0;
        $errorCount = 0;

        foreach ($invoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date, false);
            $daysOverdue = $daysOverdue < 0 ? abs($daysOverdue) : 0;

            // Update status to overdue if necessary
            if ($daysOverdue > 0 && $invoice->status !== 'overdue') {
                $invoice->update(['status' => 'overdue']);
                event(new InvoiceOverdue($invoice, $daysOverdue));
            }

            // Send email if client has email
            if ($invoice->client && $invoice->client->email) {
                try {
                    Mail::to($invoice->client->email)
                        ->send(new PaymentReminderMail($invoice, $daysOverdue));

                    $this->line("  ✓ Reminder sent for invoice {$invoice->numero} to {$invoice->client->email}");
                    $sentCount++;
                } catch (\Exception $e) {
                    $this->error("  ✗ Failed to send reminder for invoice {$invoice->numero}: {$e->getMessage()}");
                    $errorCount++;
                }
            } else {
                $this->warn("  ⚠ No email for client on invoice {$invoice->numero}");
            }
        }

        $this->newLine();
        $this->info("Summary: {$sentCount} reminders sent, {$errorCount} errors.");

        return $errorCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
