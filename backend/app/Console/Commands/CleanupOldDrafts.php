<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Devis;
use App\Models\OrdreTravail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupOldDrafts extends Command
{
    protected $signature = 'cleanup:old-drafts 
                            {--days=30 : Days after which drafts are considered old}
                            {--dry-run : Show what would be deleted without actually deleting}';

    protected $description = 'Clean up old draft invoices, devis, and ordres de travail';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');
        $cutoffDate = now()->subDays($days);

        $this->info("Looking for drafts older than {$days} days (before {$cutoffDate->format('d/m/Y')})...");
        $this->newLine();

        // Old draft invoices
        $oldInvoices = Invoice::where('status', 'draft')
            ->where('updated_at', '<', $cutoffDate)
            ->get();

        $this->info("📄 Draft Invoices: {$oldInvoices->count()} found");
        foreach ($oldInvoices as $invoice) {
            $this->line("  - {$invoice->numero} (updated: {$invoice->updated_at->format('d/m/Y')})");
        }

        // Old draft devis
        $oldDevis = Devis::where('status', 'draft')
            ->where('updated_at', '<', $cutoffDate)
            ->get();

        $this->newLine();
        $this->info("📋 Draft Devis: {$oldDevis->count()} found");
        foreach ($oldDevis as $devis) {
            $this->line("  - {$devis->numero} (updated: {$devis->updated_at->format('d/m/Y')})");
        }

        // Old draft ordres de travail
        $oldOrdres = OrdreTravail::where('status', 'draft')
            ->where('updated_at', '<', $cutoffDate)
            ->get();

        $this->newLine();
        $this->info("📝 Draft Ordres de Travail: {$oldOrdres->count()} found");
        foreach ($oldOrdres as $ordre) {
            $this->line("  - {$ordre->numero} (updated: {$ordre->updated_at->format('d/m/Y')})");
        }

        $total = $oldInvoices->count() + $oldDevis->count() + $oldOrdres->count();

        if ($total === 0) {
            $this->info('No old drafts found.');
            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->newLine();
            $this->warn("Dry run - {$total} item(s) would be deleted.");
            return Command::SUCCESS;
        }

        if (!$this->confirm("Delete {$total} old draft(s)?")) {
            $this->info('Operation cancelled.');
            return Command::SUCCESS;
        }

        // Soft delete the drafts
        Invoice::whereIn('id', $oldInvoices->pluck('id'))->delete();
        Devis::whereIn('id', $oldDevis->pluck('id'))->delete();
        OrdreTravail::whereIn('id', $oldOrdres->pluck('id'))->delete();

        $this->newLine();
        $this->info("{$total} old draft(s) have been deleted.");

        return Command::SUCCESS;
    }
}
