<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use Illuminate\Console\Command;

class UpdateInvoiceStatuses extends Command
{
    protected $signature = 'invoices:update-statuses';

    protected $description = 'Update invoice statuses based on payments and due dates';

    public function handle(): int
    {
        $this->info('Updating invoice statuses...');

        $updated = [
            'paid' => 0,
            'partial' => 0,
            'overdue' => 0,
        ];

        // Find invoices that are fully paid but not marked as paid
        $fullyPaid = Invoice::whereIn('status', ['sent', 'partial', 'overdue'])
            ->whereRaw('amount_paid >= total')
            ->get();

        foreach ($fullyPaid as $invoice) {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => $invoice->paid_at ?? now(),
            ]);
            $this->line("  ✓ Invoice {$invoice->numero} marked as paid");
            $updated['paid']++;
        }

        // Find invoices with partial payments
        $partiallyPaid = Invoice::where('status', 'sent')
            ->where('amount_paid', '>', 0)
            ->whereRaw('amount_paid < total')
            ->get();

        foreach ($partiallyPaid as $invoice) {
            $invoice->update(['status' => 'partial']);
            $this->line("  ↗ Invoice {$invoice->numero} marked as partial");
            $updated['partial']++;
        }

        // Find overdue invoices
        $overdue = Invoice::whereIn('status', ['sent', 'partial'])
            ->where('due_date', '<', now())
            ->whereRaw('amount_paid < total')
            ->get();

        foreach ($overdue as $invoice) {
            $invoice->update(['status' => 'overdue']);
            $this->line("  ⚠ Invoice {$invoice->numero} marked as overdue");
            $updated['overdue']++;
        }

        $this->newLine();
        $this->info("Summary:");
        $this->line("  - {$updated['paid']} invoice(s) marked as paid");
        $this->line("  - {$updated['partial']} invoice(s) marked as partial");
        $this->line("  - {$updated['overdue']} invoice(s) marked as overdue");

        return Command::SUCCESS;
    }
}
