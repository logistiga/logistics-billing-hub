<?php

namespace App\Console\Commands;

use App\Models\Banque;
use Illuminate\Console\Command;

class RecalculateBankBalances extends Command
{
    protected $signature = 'banks:recalculate-balances 
                            {--bank= : Specific bank ID to recalculate}';

    protected $description = 'Recalculate bank balances from transactions';

    public function handle(): int
    {
        $this->info('Recalculating bank balances...');

        $bankId = $this->option('bank');

        $query = Banque::query();
        
        if ($bankId) {
            $query->where('id', $bankId);
        }

        $banks = $query->get();

        if ($banks->isEmpty()) {
            $this->error('No banks found.');
            return Command::FAILURE;
        }

        foreach ($banks as $bank) {
            $oldBalance = $bank->balance;
            
            $totalCredit = $bank->transactions()->sum('credit');
            $totalDebit = $bank->transactions()->sum('debit');
            $newBalance = $bank->initial_balance + $totalCredit - $totalDebit;

            $bank->update(['balance' => $newBalance]);

            $difference = $newBalance - $oldBalance;
            $diffSign = $difference >= 0 ? '+' : '';

            $this->line("  {$bank->name}:");
            $this->line("    Initial: " . number_format($bank->initial_balance, 2));
            $this->line("    Credits: +" . number_format($totalCredit, 2));
            $this->line("    Debits:  -" . number_format($totalDebit, 2));
            $this->line("    Old balance: " . number_format($oldBalance, 2));
            $this->line("    New balance: " . number_format($newBalance, 2));
            
            if (abs($difference) > 0.01) {
                $this->warn("    Adjustment: {$diffSign}" . number_format($difference, 2));
            } else {
                $this->info("    ✓ No adjustment needed");
            }
            
            $this->newLine();
        }

        $this->info('Bank balance recalculation completed.');

        return Command::SUCCESS;
    }
}
