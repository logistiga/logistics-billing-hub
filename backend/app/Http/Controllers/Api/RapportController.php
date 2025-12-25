<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\OrdreTravail;
use App\Models\Transaction;
use App\Models\Banque;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class RapportController extends Controller
{
    /**
     * Rapport de chiffre d'affaires
     */
    public function revenue(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'group_by' => 'nullable|in:day,week,month,year',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        $query = Invoice::whereBetween('date', [$validated['date_from'], $validated['date_to']]);

        if (isset($validated['client_id'])) {
            $query->where('client_id', $validated['client_id']);
        }

        $groupBy = $validated['group_by'] ?? 'month';
        $dateFormat = match($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%W',
            'month' => '%Y-%m',
            'year' => '%Y',
        };

        $data = $query->selectRaw("
            DATE_FORMAT(date, '{$dateFormat}') as period,
            COUNT(*) as count,
            SUM(amount) as total_amount,
            SUM(paid) as total_paid,
            SUM(amount - paid) as pending
        ")
        ->groupBy('period')
        ->orderBy('period')
        ->get();

        $totals = [
            'count' => $data->sum('count'),
            'total_amount' => $data->sum('total_amount'),
            'total_paid' => $data->sum('total_paid'),
            'pending' => $data->sum('pending'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'periods' => $data,
                'totals' => $totals,
            ],
        ]);
    }

    /**
     * Rapport de créances clients
     */
    public function receivables(Request $request)
    {
        $clients = Client::withSum(['invoices' => function ($query) {
            $query->whereIn('status', ['sent', 'partial', 'overdue']);
        }], 'amount')
        ->withSum(['invoices' => function ($query) {
            $query->whereIn('status', ['sent', 'partial', 'overdue']);
        }], 'paid')
        ->having('invoices_sum_amount', '>', 0)
        ->get()
        ->map(function ($client) {
            $client->balance = ($client->invoices_sum_amount ?? 0) - ($client->invoices_sum_paid ?? 0);
            return $client;
        })
        ->filter(function ($client) {
            return $client->balance > 0;
        })
        ->sortByDesc('balance')
        ->values();

        // Analyse par ancienneté
        $aging = [
            'current' => 0,      // 0-30 jours
            '30_days' => 0,      // 31-60 jours
            '60_days' => 0,      // 61-90 jours
            '90_days' => 0,      // > 90 jours
        ];

        $unpaidInvoices = Invoice::whereIn('status', ['sent', 'partial', 'overdue'])
            ->whereRaw('amount > paid')
            ->get();

        foreach ($unpaidInvoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date, false);
            $balance = $invoice->amount - $invoice->paid;

            if ($daysOverdue >= 0) {
                $aging['current'] += $balance;
            } elseif ($daysOverdue >= -30) {
                $aging['current'] += $balance;
            } elseif ($daysOverdue >= -60) {
                $aging['30_days'] += $balance;
            } elseif ($daysOverdue >= -90) {
                $aging['60_days'] += $balance;
            } else {
                $aging['90_days'] += $balance;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'clients' => $clients,
                'aging' => $aging,
                'total' => $clients->sum('balance'),
            ],
        ]);
    }

    /**
     * Rapport de trésorerie
     */
    public function treasury(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'banque_id' => 'nullable|exists:banques,id',
        ]);

        $query = Transaction::whereBetween('date', [$validated['date_from'], $validated['date_to']]);

        if (isset($validated['banque_id'])) {
            $query->where('banque_id', $validated['banque_id']);
        }

        // Par catégorie
        $byCategory = (clone $query)
            ->selectRaw('category, SUM(credit) as total_credit, SUM(debit) as total_debit')
            ->groupBy('category')
            ->get();

        // Par jour
        $byDay = (clone $query)
            ->selectRaw('DATE(date) as day, SUM(credit) as credit, SUM(debit) as debit')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Totaux
        $totals = [
            'credit' => (clone $query)->sum('credit'),
            'debit' => (clone $query)->sum('debit'),
            'net' => (clone $query)->sum('credit') - (clone $query)->sum('debit'),
        ];

        // Soldes par banque
        $banques = Banque::all()->map(function ($banque) {
            return [
                'id' => $banque->id,
                'name' => $banque->name,
                'balance' => $banque->balance,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'by_category' => $byCategory,
                'by_day' => $byDay,
                'totals' => $totals,
                'banques' => $banques,
            ],
        ]);
    }

    /**
     * Rapport d'activité
     */
    public function activity(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $dateFrom = $validated['date_from'];
        $dateTo = $validated['date_to'];

        // Ordres de travail
        $ordres = OrdreTravail::whereBetween('date', [$dateFrom, $dateTo])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Factures
        $invoices = Invoice::whereBetween('date', [$dateFrom, $dateTo])
            ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('status')
            ->get();

        // Nouveaux clients
        $newClients = Client::whereBetween('created_at', [$dateFrom, $dateTo])->count();

        return response()->json([
            'success' => true,
            'data' => [
                'ordres' => $ordres,
                'invoices' => $invoices,
                'new_clients' => $newClients,
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ],
            ],
        ]);
    }

    /**
     * Exporter un rapport en PDF
     */
    public function exportPdf(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:revenue,receivables,treasury,activity',
            'date_from' => 'required|date',
            'date_to' => 'required|date',
        ]);

        $method = $validated['type'];
        $data = $this->$method($request)->getData()->data;

        $pdf = Pdf::loadView("pdf.rapport-{$validated['type']}", [
            'data' => $data,
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
        ]);

        return $pdf->download("rapport-{$validated['type']}-" . date('Y-m-d') . ".pdf");
    }

    /**
     * Exporter un rapport en Excel
     */
    public function exportExcel(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:revenue,receivables,treasury,activity',
            'date_from' => 'required|date',
            'date_to' => 'required|date',
        ]);

        $exportClass = match($validated['type']) {
            'revenue' => \App\Exports\RevenueReportExport::class,
            'receivables' => \App\Exports\ReceivablesReportExport::class,
            'treasury' => \App\Exports\TreasuryReportExport::class,
            'activity' => \App\Exports\ActivityReportExport::class,
        };

        return Excel::download(
            new $exportClass($validated['date_from'], $validated['date_to']),
            "rapport-{$validated['type']}-" . date('Y-m-d') . ".xlsx"
        );
    }
}
