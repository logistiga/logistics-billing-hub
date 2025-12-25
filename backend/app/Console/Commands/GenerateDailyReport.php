<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\MouvementCaisse;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateDailyReport extends Command
{
    protected $signature = 'reports:daily 
                            {--date= : Date for the report (Y-m-d format, defaults to yesterday)}
                            {--email= : Email address to send the report}';

    protected $description = 'Generate daily business activity report';

    public function handle(): int
    {
        $dateInput = $this->option('date');
        $date = $dateInput ? Carbon::parse($dateInput) : Carbon::yesterday();

        $this->info("Generating daily report for {$date->format('d/m/Y')}...");
        $this->newLine();

        // Invoices created
        $invoicesCreated = Invoice::whereDate('created_at', $date)->count();
        $invoicesTotal = Invoice::whereDate('created_at', $date)->sum('total');

        $this->info('📄 INVOICES');
        $this->line("  Created: {$invoicesCreated}");
        $this->line("  Total value: " . number_format($invoicesTotal, 2) . " GNF");
        $this->newLine();

        // Payments received
        $payments = Payment::whereDate('payment_date', $date)->get();
        $paymentsTotal = $payments->sum('amount');
        $paymentsByMethod = $payments->groupBy('payment_method')->map->sum('amount');

        $this->info('💰 PAYMENTS RECEIVED');
        $this->line("  Count: {$payments->count()}");
        $this->line("  Total: " . number_format($paymentsTotal, 2) . " GNF");
        foreach ($paymentsByMethod as $method => $amount) {
            $this->line("    - {$method}: " . number_format($amount, 2) . " GNF");
        }
        $this->newLine();

        // Bank transactions
        $bankCredits = Transaction::whereDate('date', $date)->sum('credit');
        $bankDebits = Transaction::whereDate('date', $date)->sum('debit');

        $this->info('🏦 BANK TRANSACTIONS');
        $this->line("  Credits: +" . number_format($bankCredits, 2) . " GNF");
        $this->line("  Debits: -" . number_format($bankDebits, 2) . " GNF");
        $this->line("  Net: " . number_format($bankCredits - $bankDebits, 2) . " GNF");
        $this->newLine();

        // Cash movements
        $cashIn = MouvementCaisse::whereDate('date', $date)
            ->where('type', 'encaissement')
            ->where('is_cancelled', false)
            ->sum('amount');
        $cashOut = MouvementCaisse::whereDate('date', $date)
            ->where('type', 'decaissement')
            ->where('is_cancelled', false)
            ->sum('amount');

        $this->info('💵 CASH MOVEMENTS');
        $this->line("  Encaissements: +" . number_format($cashIn, 2) . " GNF");
        $this->line("  Décaissements: -" . number_format($cashOut, 2) . " GNF");
        $this->line("  Net: " . number_format($cashIn - $cashOut, 2) . " GNF");
        $this->newLine();

        // Overdue invoices
        $overdueCount = Invoice::where('status', 'overdue')->count();
        $overdueTotal = Invoice::where('status', 'overdue')
            ->selectRaw('SUM(total - amount_paid) as due')
            ->value('due') ?? 0;

        $this->info('⚠️ OVERDUE INVOICES');
        $this->line("  Count: {$overdueCount}");
        $this->line("  Total due: " . number_format($overdueTotal, 2) . " GNF");
        $this->newLine();

        // Summary
        $this->info('═══════════════════════════════════════');
        $this->info("Report generated at " . now()->format('d/m/Y H:i:s'));

        // TODO: Send email if option provided
        if ($email = $this->option('email')) {
            $this->line("Email would be sent to: {$email}");
        }

        return Command::SUCCESS;
    }
}
