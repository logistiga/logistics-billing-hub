<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Entreprise;
use Illuminate\Pagination\LengthAwarePaginator;

class InvoiceService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Invoice::with(['client', 'items']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        if (isset($filters['is_overdue']) && $filters['is_overdue']) {
            $query->where('status', '!=', 'paid')
                ->where('due_date', '<', now());
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?Invoice
    {
        return Invoice::with(['client', 'items', 'payments', 'avoirs'])->find($id);
    }

    public function create(array $data): Invoice
    {
        $entreprise = Entreprise::first();
        
        $data['numero'] = $this->generateNumero($entreprise);
        $data['subtotal'] = 0;
        $data['tax_amount'] = 0;
        $data['total'] = 0;

        $invoice = Invoice::create($data);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $itemData) {
                $this->createItem($invoice, $itemData);
            }
        }

        $this->recalculateTotals($invoice);

        // Update entreprise next number
        if ($entreprise) {
            $entreprise->increment('next_invoice_number');
        }

        return $invoice->load(['client', 'items']);
    }

    public function update(Invoice $invoice, array $data): Invoice
    {
        $invoice->update($data);

        if (isset($data['items'])) {
            $invoice->items()->delete();
            foreach ($data['items'] as $itemData) {
                $this->createItem($invoice, $itemData);
            }
        }

        $this->recalculateTotals($invoice);

        return $invoice->load(['client', 'items']);
    }

    public function delete(Invoice $invoice): bool
    {
        return $invoice->delete();
    }

    protected function createItem(Invoice $invoice, array $data): InvoiceItem
    {
        $amount = ($data['quantity'] ?? 1) * ($data['unit_price'] ?? 0);
        
        return $invoice->items()->create([
            'description' => $data['description'],
            'quantity' => $data['quantity'] ?? 1,
            'unit_price' => $data['unit_price'] ?? 0,
            'tax_rate' => $data['tax_rate'] ?? 0,
            'amount' => $amount,
        ]);
    }

    public function recalculateTotals(Invoice $invoice): void
    {
        $subtotal = 0;
        $taxAmount = 0;

        foreach ($invoice->items as $item) {
            $subtotal += $item->amount;
            $taxAmount += $item->amount * (($item->tax_rate ?? 0) / 100);
        }

        $discountAmount = 0;
        if ($invoice->discount > 0) {
            if ($invoice->discount_type === 'percentage') {
                $discountAmount = $subtotal * ($invoice->discount / 100);
            } else {
                $discountAmount = $invoice->discount;
            }
        }

        $invoice->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total' => $subtotal + $taxAmount - $discountAmount,
        ]);
    }

    protected function generateNumero(?Entreprise $entreprise): string
    {
        $prefix = $entreprise?->invoice_prefix ?? 'FAC';
        $number = $entreprise?->next_invoice_number ?? 1;
        $year = date('Y');
        
        return sprintf('%s-%s-%05d', $prefix, $year, $number);
    }

    public function markAsSent(Invoice $invoice): Invoice
    {
        $invoice->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $invoice;
    }

    public function markAsPaid(Invoice $invoice): Invoice
    {
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
            'paid_amount' => $invoice->total,
            'remaining_amount' => 0,
        ]);

        return $invoice;
    }

    public function addPayment(Invoice $invoice, array $paymentData): Invoice
    {
        $payment = $invoice->payments()->create($paymentData);

        $totalPaid = $invoice->payments()->where('is_cancelled', false)->sum('amount');
        $remaining = $invoice->total - $totalPaid;

        $invoice->update([
            'paid_amount' => $totalPaid,
            'remaining_amount' => max(0, $remaining),
            'status' => $remaining <= 0 ? 'paid' : 'partial',
            'paid_at' => $remaining <= 0 ? now() : null,
        ]);

        return $invoice->load('payments');
    }
}
