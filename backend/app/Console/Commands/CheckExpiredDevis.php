<?php

namespace App\Console\Commands;

use App\Events\DevisExpired;
use App\Models\Devis;
use Illuminate\Console\Command;

class CheckExpiredDevis extends Command
{
    protected $signature = 'devis:check-expired 
                            {--notify : Send notifications for expired devis}';

    protected $description = 'Check and mark expired devis';

    public function handle(): int
    {
        $this->info('Checking for expired devis...');

        $expiredDevis = Devis::where('validity_date', '<', now())
            ->whereNotIn('status', ['accepted', 'rejected', 'expired'])
            ->get();

        if ($expiredDevis->isEmpty()) {
            $this->info('No expired devis found.');
            return Command::SUCCESS;
        }

        $updatedCount = 0;
        $notify = $this->option('notify');

        foreach ($expiredDevis as $devis) {
            $devis->update(['status' => 'expired']);
            
            $this->line("  ✓ Devis {$devis->numero} marked as expired (validity: {$devis->validity_date->format('d/m/Y')})");
            
            if ($notify) {
                event(new DevisExpired($devis));
            }
            
            $updatedCount++;
        }

        $this->newLine();
        $this->info("Summary: {$updatedCount} devis marked as expired.");

        return Command::SUCCESS;
    }
}
