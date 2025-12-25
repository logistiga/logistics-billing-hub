<?php

namespace App\Console\Commands;

use App\Events\LowBankBalance;
use App\Events\LowCashBalance;
use App\Models\Banque;
use App\Models\Caisse;
use Illuminate\Console\Command;

class CheckLowBalances extends Command
{
    protected $signature = 'treasury:check-balances 
                            {--bank-threshold=100000 : Minimum bank balance threshold}
                            {--cash-threshold=50000 : Minimum cash balance threshold}';

    protected $description = 'Check for low bank and cash balances and send alerts';

    public function handle(): int
    {
        $this->info('Checking treasury balances...');

        $bankThreshold = (float) $this->option('bank-threshold');
        $cashThreshold = (float) $this->option('cash-threshold');

        $alerts = 0;

        // Check bank balances
        $this->newLine();
        $this->info('Checking bank accounts...');

        $lowBanks = Banque::where('is_active', true)
            ->where('balance', '<', $bankThreshold)
            ->get();

        foreach ($lowBanks as $banque) {
            $this->warn("  ⚠ {$banque->name}: " . number_format($banque->balance, 2) . " (threshold: " . number_format($bankThreshold, 2) . ")");
            event(new LowBankBalance($banque, $banque->balance, $bankThreshold));
            $alerts++;
        }

        if ($lowBanks->isEmpty()) {
            $this->line("  ✓ All bank accounts above threshold");
        }

        // Check cash balances
        $this->newLine();
        $this->info('Checking cash registers...');

        $lowCaisses = Caisse::where('balance', '<', $cashThreshold)->get();

        foreach ($lowCaisses as $caisse) {
            $this->warn("  ⚠ {$caisse->name}: " . number_format($caisse->balance, 2) . " (threshold: " . number_format($cashThreshold, 2) . ")");
            event(new LowCashBalance($caisse, $caisse->balance, $cashThreshold));
            $alerts++;
        }

        if ($lowCaisses->isEmpty()) {
            $this->line("  ✓ All cash registers above threshold");
        }

        $this->newLine();
        $this->info("Balance check completed. {$alerts} alert(s) triggered.");

        return Command::SUCCESS;
    }
}
