<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Banque;
use App\Models\Caisse;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentService
{
    protected InvoiceService $invoiceService;
    protected BanqueService $banqueService;
    protected CaisseService $caisseService;

    public function __construct(
        InvoiceService $invoiceService,
        BanqueService $banqueService,
        CaisseService $caisseService
    ) {
        $this->invoiceService = $invoiceService;
        $this->banqueService = $banqueService;
        $this->caisseService = $caisseService;
    }

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Payment::with(['invoice.client', 'banque', 'caisse']);

        if (!empty($filters['invoice_id'])) {
            $query->where('invoice_id', $filters['invoice_id']);
        }

        if (!empty($filters['method'])) {
            $query->where('method', $filters['method']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getById(int $id): ?Payment
    {
        return Payment::with(['invoice.client', 'banque', 'caisse'])->find($id);
    }

    public function create(array $data): Payment
    {
        $invoice = Invoice::findOrFail($data['invoice_id']);

        // Validate amount
        $maxAmount = $invoice->remaining_amount;
        if ($data['amount'] > $maxAmount) {
            throw new \InvalidArgumentException("Le montant dépasse le solde restant ({$maxAmount})");
        }

        $payment = Payment::create($data);

        // Update invoice
        $this->updateInvoicePayments($invoice);

        // Create bank transaction if paid by transfer
        if (!empty($data['banque_id']) && in_array($data['method'], ['transfer', 'check', 'card'])) {
            $banque = Banque::find($data['banque_id']);
            if ($banque) {
                $this->banqueService->addTransaction($banque, [
                    'type' => 'credit',
                    'amount' => $data['amount'],
                    'date' => $data['date'],
                    'invoice_id' => $invoice->id,
                    'client_id' => $invoice->client_id,
                    'reference' => $data['reference'] ?? $invoice->numero,
                    'description' => "Paiement facture {$invoice->numero}",
                    'category' => 'Encaissement client',
                ]);
            }
        }

        // Create cash movement if paid by cash
        if (!empty($data['caisse_id']) && $data['method'] === 'cash') {
            $caisse = Caisse::find($data['caisse_id']);
            if ($caisse) {
                $this->caisseService->addMouvement($caisse, [
                    'type' => 'encaissement',
                    'amount' => $data['amount'],
                    'date' => $data['date'],
                    'invoice_id' => $invoice->id,
                    'client_id' => $invoice->client_id,
                    'payment_method' => 'cash',
                    'reference' => $data['reference'] ?? $invoice->numero,
                    'description' => "Paiement facture {$invoice->numero}",
                ]);
            }
        }

        return $payment->load(['invoice', 'banque', 'caisse']);
    }

    public function cancel(Payment $payment, string $reason): Payment
    {
        $payment->update([
            'is_cancelled' => true,
        ]);

        // Update invoice
        $invoice = Invoice::find($payment->invoice_id);
        if ($invoice) {
            $this->updateInvoicePayments($invoice);
        }

        return $payment;
    }

    protected function updateInvoicePayments(Invoice $invoice): void
    {
        $totalPaid = $invoice->payments()
            ->where('is_cancelled', false)
            ->sum('amount');

        $remaining = $invoice->total - $totalPaid;

        $status = $invoice->status;
        if ($remaining <= 0) {
            $status = 'paid';
        } elseif ($totalPaid > 0) {
            $status = 'partial';
        }

        $invoice->update([
            'paid_amount' => $totalPaid,
            'remaining_amount' => max(0, $remaining),
            'status' => $status,
            'paid_at' => $remaining <= 0 ? now() : null,
        ]);
    }

    public function getStats(string $period = 'month'): array
    {
        $startDate = match ($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $payments = Payment::where('is_cancelled', false)
            ->where('date', '>=', $startDate);

        return [
            'total' => (clone $payments)->sum('amount'),
            'count' => $payments->count(),
            'by_method' => (clone $payments)->selectRaw('method, SUM(amount) as total')
                ->groupBy('method')
                ->pluck('total', 'method')
                ->toArray(),
        ];
    }
}
