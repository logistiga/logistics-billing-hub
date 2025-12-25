<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\OrdreTravail;
use App\Models\Devis;
use App\Models\Banque;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Statistiques globales du dashboard
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'clients' => $this->getClientsStats(),
                'invoices' => $this->getInvoicesStats(),
                'orders' => $this->getOrdersStats(),
                'treasury' => $this->getTreasuryStats(),
            ],
        ]);
    }

    /**
     * Statistiques des clients
     */
    private function getClientsStats()
    {
        return [
            'total' => Client::count(),
            'new_this_month' => Client::whereMonth('created_at', now()->month)->count(),
            'active' => Client::has('invoices')->count(),
        ];
    }

    /**
     * Statistiques des factures
     */
    private function getInvoicesStats()
    {
        $invoices = Invoice::query();
        $thisMonth = Invoice::whereMonth('date', now()->month);
        $lastMonth = Invoice::whereMonth('date', now()->subMonth()->month);

        return [
            'total' => $invoices->count(),
            'total_amount' => $invoices->sum('amount'),
            'paid_amount' => $invoices->sum('paid'),
            'pending_amount' => $invoices->sum('amount') - $invoices->sum('paid'),
            'overdue' => Invoice::where('status', 'overdue')->count(),
            'this_month' => [
                'count' => (clone $thisMonth)->count(),
                'amount' => (clone $thisMonth)->sum('amount'),
            ],
            'last_month' => [
                'count' => (clone $lastMonth)->count(),
                'amount' => (clone $lastMonth)->sum('amount'),
            ],
            'by_status' => [
                'draft' => Invoice::where('status', 'draft')->count(),
                'sent' => Invoice::where('status', 'sent')->count(),
                'partial' => Invoice::where('status', 'partial')->count(),
                'paid' => Invoice::where('status', 'paid')->count(),
                'overdue' => Invoice::where('status', 'overdue')->count(),
            ],
        ];
    }

    /**
     * Statistiques des ordres de travail
     */
    private function getOrdersStats()
    {
        return [
            'total' => OrdreTravail::count(),
            'pending' => OrdreTravail::where('status', 'pending')->count(),
            'in_progress' => OrdreTravail::where('status', 'in_progress')->count(),
            'completed' => OrdreTravail::where('status', 'completed')->count(),
            'this_month' => OrdreTravail::whereMonth('created_at', now()->month)->count(),
        ];
    }

    /**
     * Statistiques de trésorerie
     */
    private function getTreasuryStats()
    {
        $banques = Banque::all();
        $thisMonth = Transaction::whereMonth('date', now()->month);

        return [
            'total_balance' => $banques->sum('balance'),
            'bank_accounts' => $banques->count(),
            'this_month' => [
                'income' => (clone $thisMonth)->sum('credit'),
                'expenses' => (clone $thisMonth)->sum('debit'),
                'net' => (clone $thisMonth)->sum('credit') - (clone $thisMonth)->sum('debit'),
            ],
        ];
    }

    /**
     * Graphique de revenus mensuels
     */
    public function revenueChart(Request $request)
    {
        $year = $request->get('year', now()->year);
        $months = [];

        for ($i = 1; $i <= 12; $i++) {
            $monthStart = Carbon::create($year, $i, 1)->startOfMonth();
            $monthEnd = Carbon::create($year, $i, 1)->endOfMonth();

            $invoices = Invoice::whereBetween('date', [$monthStart, $monthEnd]);
            $transactions = Transaction::whereBetween('date', [$monthStart, $monthEnd]);

            $months[] = [
                'month' => $monthStart->format('M'),
                'invoiced' => (clone $invoices)->sum('amount'),
                'paid' => (clone $invoices)->sum('paid'),
                'income' => (clone $transactions)->sum('credit'),
                'expenses' => (clone $transactions)->sum('debit'),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $months,
        ]);
    }

    /**
     * Top clients par chiffre d'affaires
     */
    public function topClients(Request $request)
    {
        $limit = $request->get('limit', 10);
        $period = $request->get('period', 'year');

        $query = Client::withSum('invoices as total_invoiced', 'amount')
            ->withSum('invoices as total_paid', 'paid')
            ->withCount('invoices');

        if ($period === 'month') {
            $query->whereHas('invoices', function ($q) {
                $q->whereMonth('date', now()->month);
            });
        } elseif ($period === 'year') {
            $query->whereHas('invoices', function ($q) {
                $q->whereYear('date', now()->year);
            });
        }

        $clients = $query->orderByDesc('total_invoiced')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    /**
     * Factures en retard
     */
    public function overdueInvoices(Request $request)
    {
        $limit = $request->get('limit', 10);

        $invoices = Invoice::with('client')
            ->where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->whereIn('status', ['sent', 'partial'])
                  ->where('due_date', '<', now());
            })
            ->orderBy('due_date', 'asc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Activité récente
     */
    public function recentActivity(Request $request)
    {
        $limit = $request->get('limit', 20);

        $activities = collect();

        // Dernières factures
        $invoices = Invoice::with('client')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($invoice) {
                return [
                    'type' => 'invoice',
                    'message' => "Facture {$invoice->number} créée pour {$invoice->client->name}",
                    'amount' => $invoice->amount,
                    'date' => $invoice->created_at,
                ];
            });

        // Derniers paiements
        $payments = Transaction::with('banque')
            ->where('credit', '>', 0)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'type' => 'payment',
                    'message' => "Paiement reçu sur {$transaction->banque->name}",
                    'amount' => $transaction->credit,
                    'date' => $transaction->created_at,
                ];
            });

        // Derniers ordres
        $orders = OrdreTravail::with('client')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'type' => 'order',
                    'message' => "Ordre {$order->numero} créé pour {$order->client->name}",
                    'date' => $order->created_at,
                ];
            });

        $activities = $activities->merge($invoices)->merge($payments)->merge($orders);
        $activities = $activities->sortByDesc('date')->take($limit)->values();

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    /**
     * Prévisions de trésorerie
     */
    public function cashFlowForecast(Request $request)
    {
        $days = $request->get('days', 30);
        $forecast = [];

        $currentBalance = Banque::sum('balance');

        for ($i = 0; $i <= $days; $i++) {
            $date = now()->addDays($i);

            // Paiements attendus (factures à échéance)
            $expectedIncome = Invoice::whereDate('due_date', $date)
                ->whereIn('status', ['sent', 'partial'])
                ->sum(\DB::raw('amount - paid'));

            // Dépenses prévues (crédits à rembourser, etc.)
            $expectedExpenses = 0; // À implémenter selon les besoins

            $currentBalance += $expectedIncome - $expectedExpenses;

            $forecast[] = [
                'date' => $date->format('Y-m-d'),
                'balance' => $currentBalance,
                'income' => $expectedIncome,
                'expenses' => $expectedExpenses,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $forecast,
        ]);
    }
}
