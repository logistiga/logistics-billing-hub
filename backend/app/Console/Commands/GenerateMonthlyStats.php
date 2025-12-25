<?php

namespace App\Console\Commands;

use App\Models\Banque;
use App\Models\Caisse;
use App\Models\Invoice;
use Illuminate\Console\Command;

class GenerateMonthlyStats extends Command
{
    protected $signature = 'reports:monthly-stats 
                            {--month= : Month (1-12)}
                            {--year= : Year (defaults to current year)}';

    protected $description = 'Generate monthly business statistics';

    public function handle(): int
    {
        $month = $this->option('month') ?? now()->month;
        $year = $this->option('year') ?? now()->year;

        $startDate = now()->setYear($year)->setMonth($month)->startOfMonth();
        $endDate = now()->setYear($year)->setMonth($month)->endOfMonth();

        $this->info("═══════════════════════════════════════════════════════════");
        $this->info("       STATISTIQUES MENSUELLES - " . strtoupper($startDate->translatedFormat('F Y')));
        $this->info("═══════════════════════════════════════════════════════════");
        $this->newLine();

        // Invoice statistics
        $invoices = Invoice::whereBetween('date', [$startDate, $endDate]);
        $invoiceCount = $invoices->count();
        $invoiceTotal = $invoices->sum('total');
        $invoicePaid = Invoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'paid')->sum('total');

        $this->info('📊 FACTURATION');
        $this->table(
            ['Métrique', 'Valeur'],
            [
                ['Factures émises', $invoiceCount],
                ['Chiffre d\'affaires', number_format($invoiceTotal, 0, ',', ' ') . ' GNF'],
                ['Encaissements', number_format($invoicePaid, 0, ',', ' ') . ' GNF'],
                ['Taux de recouvrement', $invoiceTotal > 0 ? round(($invoicePaid / $invoiceTotal) * 100, 1) . '%' : 'N/A'],
            ]
        );

        // Bank balances
        $banks = Banque::where('is_active', true)->get();
        $totalBankBalance = $banks->sum('balance');

        $this->newLine();
        $this->info('🏦 SOLDES BANCAIRES');
        $bankData = $banks->map(fn($b) => [$b->name, number_format($b->balance, 0, ',', ' ') . ' GNF'])->toArray();
        $bankData[] = ['TOTAL', number_format($totalBankBalance, 0, ',', ' ') . ' GNF'];
        $this->table(['Banque', 'Solde'], $bankData);

        // Cash balances
        $caisses = Caisse::all();
        $totalCashBalance = $caisses->sum('balance');

        $this->newLine();
        $this->info('💵 SOLDES CAISSE');
        $caisseData = $caisses->map(fn($c) => [$c->name, number_format($c->balance, 0, ',', ' ') . ' GNF'])->toArray();
        $caisseData[] = ['TOTAL', number_format($totalCashBalance, 0, ',', ' ') . ' GNF'];
        $this->table(['Caisse', 'Solde'], $caisseData);

        // Outstanding amounts
        $overdueInvoices = Invoice::where('status', 'overdue');
        $overdueCount = $overdueInvoices->count();
        $overdueAmount = $overdueInvoices->selectRaw('SUM(total - amount_paid) as due')->value('due') ?? 0;

        $this->newLine();
        $this->info('⚠️ CRÉANCES EN RETARD');
        $this->table(
            ['Métrique', 'Valeur'],
            [
                ['Nombre de factures', $overdueCount],
                ['Montant total dû', number_format($overdueAmount, 0, ',', ' ') . ' GNF'],
            ]
        );

        // Treasury summary
        $this->newLine();
        $this->info('═══════════════════════════════════════════════════════════');
        $this->info('💰 TRÉSORERIE TOTALE: ' . number_format($totalBankBalance + $totalCashBalance, 0, ',', ' ') . ' GNF');
        $this->info('═══════════════════════════════════════════════════════════');

        return Command::SUCCESS;
    }
}
