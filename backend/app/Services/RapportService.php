<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\Transaction;
use App\Models\Caisse;
use App\Models\MouvementCaisse;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class RapportService
{
    public function generateRevenue(array $params): array
    {
        $query = Invoice::where('status', 'paid');

        if (!empty($params['date_from'])) {
            $query->whereDate('date', '>=', $params['date_from']);
        }

        if (!empty($params['date_to'])) {
            $query->whereDate('date', '<=', $params['date_to']);
        }

        if (!empty($params['client_id'])) {
            $query->where('client_id', $params['client_id']);
        }

        $groupBy = $params['group_by'] ?? 'month';

        $data = match ($groupBy) {
            'day' => $query->selectRaw('DATE(date) as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'week' => $query->selectRaw('YEARWEEK(date) as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'month' => $query->selectRaw('DATE_FORMAT(date, "%Y-%m") as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'quarter' => $query->selectRaw('CONCAT(YEAR(date), "-Q", QUARTER(date)) as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'year' => $query->selectRaw('YEAR(date) as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'client' => $query->selectRaw('client_id as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->with('client')
                ->get()
                ->map(function ($item) {
                    $item->period = $item->client?->name ?? 'N/A';
                    return $item;
                }),
            'type' => $query->selectRaw('type as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->get(),
            default => $query->selectRaw('DATE_FORMAT(date, "%Y-%m") as period, SUM(total) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
        };

        return [
            'data' => $data->toArray(),
            'summary' => [
                'total' => $data->sum('total'),
                'count' => $data->sum('count'),
                'average' => $data->count() > 0 ? $data->sum('total') / $data->count() : 0,
            ],
        ];
    }

    public function generateReceivables(array $params): array
    {
        $query = Invoice::with('client')
            ->whereIn('status', ['sent', 'partial', 'overdue']);

        if (!empty($params['client_id'])) {
            $query->where('client_id', $params['client_id']);
        }

        $invoices = $query->orderBy('due_date')->get();

        $aging = [
            'current' => 0,
            '1-30' => 0,
            '31-60' => 0,
            '61-90' => 0,
            '90+' => 0,
        ];

        foreach ($invoices as $invoice) {
            $remaining = $invoice->total - $invoice->paid_amount;
            $daysOverdue = $invoice->due_date->isPast() ? $invoice->due_date->diffInDays(now()) : 0;

            if ($daysOverdue === 0) {
                $aging['current'] += $remaining;
            } elseif ($daysOverdue <= 30) {
                $aging['1-30'] += $remaining;
            } elseif ($daysOverdue <= 60) {
                $aging['31-60'] += $remaining;
            } elseif ($daysOverdue <= 90) {
                $aging['61-90'] += $remaining;
            } else {
                $aging['90+'] += $remaining;
            }
        }

        return [
            'invoices' => $invoices->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'numero' => $invoice->numero,
                    'client' => $invoice->client->name,
                    'date' => $invoice->date->toDateString(),
                    'due_date' => $invoice->due_date->toDateString(),
                    'total' => (float) $invoice->total,
                    'paid' => (float) $invoice->paid_amount,
                    'remaining' => (float) ($invoice->total - $invoice->paid_amount),
                    'days_overdue' => $invoice->due_date->isPast() ? $invoice->due_date->diffInDays(now()) : 0,
                ];
            })->toArray(),
            'aging' => $aging,
            'total_receivables' => array_sum($aging),
        ];
    }

    public function generateTreasury(array $params): array
    {
        $banks = \App\Models\Banque::where('is_active', true)->get();
        $caisses = Caisse::all();

        $bankTransactions = Transaction::selectRaw('
            DATE(date) as date,
            SUM(CASE WHEN type = "credit" THEN amount ELSE 0 END) as credits,
            SUM(CASE WHEN type = "debit" THEN amount ELSE 0 END) as debits
        ')
            ->where('is_cancelled', false);

        if (!empty($params['date_from'])) {
            $bankTransactions->whereDate('date', '>=', $params['date_from']);
        }

        if (!empty($params['date_to'])) {
            $bankTransactions->whereDate('date', '<=', $params['date_to']);
        }

        if (!empty($params['banque_id'])) {
            $bankTransactions->where('banque_id', $params['banque_id']);
        }

        $bankData = $bankTransactions->groupBy('date')->orderBy('date')->get();

        return [
            'banks' => $banks->map(function ($bank) {
                return [
                    'id' => $bank->id,
                    'name' => $bank->name,
                    'balance' => (float) $bank->current_balance,
                ];
            })->toArray(),
            'caisses' => $caisses->map(function ($caisse) {
                return [
                    'id' => $caisse->id,
                    'name' => $caisse->name,
                    'balance' => (float) $caisse->balance,
                ];
            })->toArray(),
            'transactions' => $bankData->toArray(),
            'total_bank_balance' => $banks->sum('current_balance'),
            'total_cash_balance' => $caisses->sum('balance'),
            'total_treasury' => $banks->sum('current_balance') + $caisses->sum('balance'),
        ];
    }

    public function generateActivity(array $params): array
    {
        $dateFrom = $params['date_from'] ?? now()->startOfMonth();
        $dateTo = $params['date_to'] ?? now();

        return [
            'invoices' => [
                'created' => Invoice::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
                'paid' => Invoice::where('status', 'paid')->whereBetween('paid_at', [$dateFrom, $dateTo])->count(),
                'total_amount' => Invoice::whereBetween('date', [$dateFrom, $dateTo])->sum('total'),
            ],
            'payments' => [
                'count' => \App\Models\Payment::where('is_cancelled', false)->whereBetween('date', [$dateFrom, $dateTo])->count(),
                'total' => \App\Models\Payment::where('is_cancelled', false)->whereBetween('date', [$dateFrom, $dateTo])->sum('amount'),
            ],
            'clients' => [
                'new' => Client::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
                'active' => Client::whereHas('invoices', function ($q) use ($dateFrom, $dateTo) {
                    $q->whereBetween('date', [$dateFrom, $dateTo]);
                })->count(),
            ],
            'ordres' => [
                'created' => \App\Models\OrdreTravail::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
                'completed' => \App\Models\OrdreTravail::where('status', 'termine')->whereBetween('updated_at', [$dateFrom, $dateTo])->count(),
            ],
        ];
    }
}
