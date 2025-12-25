<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\Banque;
use App\Models\Caisse;
use App\Models\OrdreTravail;
use App\Models\Devis;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(string $period = 'month'): array
    {
        $startDate = match ($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $previousStart = match ($period) {
            'week' => now()->subWeek()->startOfWeek(),
            'month' => now()->subMonth()->startOfMonth(),
            'quarter' => now()->subQuarter()->startOfQuarter(),
            'year' => now()->subYear()->startOfYear(),
            default => now()->subMonth()->startOfMonth(),
        };

        $previousEnd = $startDate->copy()->subDay();

        // Current period revenue
        $currentRevenue = Invoice::where('date', '>=', $startDate)
            ->where('status', 'paid')
            ->sum('total');

        // Previous period revenue
        $previousRevenue = Invoice::whereBetween('date', [$previousStart, $previousEnd])
            ->where('status', 'paid')
            ->sum('total');

        // Calculate change percentage
        $revenueChange = $previousRevenue > 0 
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 
            : 0;

        return [
            'revenue' => $currentRevenue,
            'revenue_change' => round($revenueChange, 1),
            'invoices_count' => Invoice::where('date', '>=', $startDate)->count(),
            'invoices_pending' => Invoice::whereIn('status', ['draft', 'sent', 'partial'])->count(),
            'invoices_overdue' => Invoice::where('status', '!=', 'paid')
                ->where('due_date', '<', now())
                ->count(),
            'clients_count' => Client::count(),
            'new_clients' => Client::where('created_at', '>=', $startDate)->count(),
            'receivables' => Invoice::whereIn('status', ['sent', 'partial', 'overdue'])
                ->sum(DB::raw('total - paid_amount')),
            'cash_balance' => Caisse::sum('balance'),
            'bank_balance' => Banque::where('is_active', true)->sum('current_balance'),
        ];
    }

    public function getRevenueByMonth(int $months = 12): array
    {
        $data = [];
        
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Invoice::whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->where('status', 'paid')
                ->sum('total');

            $data[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        return $data;
    }

    public function getRevenueByType(): array
    {
        return Invoice::where('status', 'paid')
            ->whereYear('date', now()->year)
            ->selectRaw('type, SUM(total) as total')
            ->groupBy('type')
            ->pluck('total', 'type')
            ->toArray();
    }

    public function getInvoicesByStatus(): array
    {
        return Invoice::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    public function getTopClients(int $limit = 5): array
    {
        return Client::select('clients.*')
            ->selectRaw('SUM(invoices.total) as total_invoiced')
            ->join('invoices', 'clients.id', '=', 'invoices.client_id')
            ->where('invoices.status', 'paid')
            ->whereYear('invoices.date', now()->year)
            ->groupBy('clients.id')
            ->orderByDesc('total_invoiced')
            ->limit($limit)
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'total_invoiced' => (float) $client->total_invoiced,
                ];
            })
            ->toArray();
    }

    public function getOverdueInvoices(int $limit = 10): array
    {
        return Invoice::with('client')
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->limit($limit)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'numero' => $invoice->numero,
                    'client' => $invoice->client->name,
                    'total' => (float) $invoice->total,
                    'remaining' => (float) $invoice->remaining_amount,
                    'due_date' => $invoice->due_date->toDateString(),
                    'days_overdue' => $invoice->due_date->diffInDays(now()),
                ];
            })
            ->toArray();
    }

    public function getRecentActivities(int $limit = 20): array
    {
        $activities = collect();

        // Recent invoices
        $invoices = Invoice::with('client')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($invoice) {
                return [
                    'type' => 'invoice',
                    'message' => "Facture {$invoice->numero} créée pour {$invoice->client->name}",
                    'amount' => (float) $invoice->total,
                    'date' => $invoice->created_at,
                ];
            });

        // Recent payments
        $payments = \App\Models\Payment::with('invoice.client')
            ->where('is_cancelled', false)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($payment) {
                return [
                    'type' => 'payment',
                    'message' => "Paiement reçu pour facture {$payment->invoice->numero}",
                    'amount' => (float) $payment->amount,
                    'date' => $payment->created_at,
                ];
            });

        // Recent ordres
        $ordres = OrdreTravail::with('client')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($ordre) {
                return [
                    'type' => 'ordre',
                    'message' => "Ordre de travail {$ordre->numero} créé",
                    'amount' => (float) $ordre->total_ttc,
                    'date' => $ordre->created_at,
                ];
            });

        return $activities
            ->merge($invoices)
            ->merge($payments)
            ->merge($ordres)
            ->sortByDesc('date')
            ->take($limit)
            ->values()
            ->toArray();
    }
}
