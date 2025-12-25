<?php

namespace App\Console\Commands;

use App\Events\CreditPaymentDue;
use App\Events\CreditPaymentOverdue;
use App\Models\Credit;
use App\Models\CreditPayment;
use Illuminate\Console\Command;

class CheckCreditPayments extends Command
{
    protected $signature = 'credits:check-payments 
                            {--days-before=7 : Days before due date to send reminder}
                            {--update-status : Update credit status based on payments}';

    protected $description = 'Check credit payment schedules and send reminders';

    public function handle(): int
    {
        $this->info('Checking credit payment schedules...');

        $daysBefore = (int) $this->option('days-before');
        $updateStatus = $this->option('update-status');

        // Check upcoming payments (due soon)
        $upcomingPayments = CreditPayment::with('credit.banque')
            ->where('status', 'pending')
            ->whereBetween('date_echeance', [now(), now()->addDays($daysBefore)])
            ->get();

        $this->info("Found {$upcomingPayments->count()} upcoming payment(s)...");

        foreach ($upcomingPayments as $payment) {
            $daysUntilDue = now()->diffInDays($payment->date_echeance);
            
            $this->line("  ⏰ Credit {$payment->credit->reference} - Échéance #{$payment->echeance_numero} due in {$daysUntilDue} days");
            
            event(new CreditPaymentDue($payment->credit, $payment, $daysUntilDue));
        }

        // Check overdue payments
        $overduePayments = CreditPayment::with('credit.banque')
            ->where('status', 'pending')
            ->where('date_echeance', '<', now())
            ->get();

        $this->newLine();
        $this->info("Found {$overduePayments->count()} overdue payment(s)...");

        foreach ($overduePayments as $payment) {
            $daysOverdue = now()->diffInDays($payment->date_echeance);
            
            // Update payment status
            $payment->update(['status' => 'overdue']);
            
            $this->error("  ⚠ Credit {$payment->credit->reference} - Échéance #{$payment->echeance_numero} overdue by {$daysOverdue} days");
            
            event(new CreditPaymentOverdue($payment->credit, $payment, $daysOverdue));
        }

        // Update credit statuses if requested
        if ($updateStatus) {
            $this->newLine();
            $this->info('Updating credit statuses...');

            $credits = Credit::where('status', 'active')->get();

            foreach ($credits as $credit) {
                $hasOverdue = $credit->payments()->where('status', 'overdue')->exists();
                $allPaid = $credit->payments()->where('status', '!=', 'paid')->doesntExist();

                if ($allPaid && $credit->echeances_payees >= $credit->duree_mois) {
                    $credit->update(['status' => 'completed']);
                    $this->line("  ✓ Credit {$credit->reference} marked as completed");
                } elseif ($hasOverdue) {
                    $credit->update(['status' => 'overdue']);
                    $this->warn("  ⚠ Credit {$credit->reference} marked as overdue");
                }
            }
        }

        $this->newLine();
        $this->info('Credit payment check completed.');

        return Command::SUCCESS;
    }
}
