<?php

namespace App\Services;

use App\Models\Devis;
use App\Models\DevisItem;
use App\Models\Invoice;
use App\Models\Entreprise;
use Illuminate\Pagination\LengthAwarePaginator;

class DevisService
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Devis::with(['client', 'items']);

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

        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?Devis
    {
        return Devis::with(['client', 'items', 'invoice'])->find($id);
    }

    public function create(array $data): Devis
    {
        $entreprise = Entreprise::first();
        
        $data['numero'] = $this->generateNumero($entreprise);
        $data['subtotal'] = 0;
        $data['tax_amount'] = 0;
        $data['total'] = 0;
        $data['status'] = $data['status'] ?? 'draft';

        $devis = Devis::create($data);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $itemData) {
                $this->createItem($devis, $itemData);
            }
        }

        $this->recalculateTotals($devis);

        if ($entreprise) {
            $entreprise->increment('next_devis_number');
        }

        return $devis->load(['client', 'items']);
    }

    public function update(Devis $devis, array $data): Devis
    {
        $devis->update($data);

        if (isset($data['items'])) {
            $devis->items()->delete();
            foreach ($data['items'] as $itemData) {
                $this->createItem($devis, $itemData);
            }
        }

        $this->recalculateTotals($devis);

        return $devis->load(['client', 'items']);
    }

    public function delete(Devis $devis): bool
    {
        return $devis->delete();
    }

    protected function createItem(Devis $devis, array $data): DevisItem
    {
        $amount = ($data['quantity'] ?? 1) * ($data['unit_price'] ?? 0);
        
        return $devis->items()->create([
            'description' => $data['description'],
            'quantity' => $data['quantity'] ?? 1,
            'unit_price' => $data['unit_price'] ?? 0,
            'tax_rate' => $data['tax_rate'] ?? 0,
            'amount' => $amount,
        ]);
    }

    public function recalculateTotals(Devis $devis): void
    {
        $subtotal = 0;
        $taxAmount = 0;

        foreach ($devis->items as $item) {
            $subtotal += $item->amount;
            $taxAmount += $item->amount * (($item->tax_rate ?? 0) / 100);
        }

        $discountAmount = 0;
        if ($devis->discount > 0) {
            if ($devis->discount_type === 'percentage') {
                $discountAmount = $subtotal * ($devis->discount / 100);
            } else {
                $discountAmount = $devis->discount;
            }
        }

        $devis->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total' => $subtotal + $taxAmount - $discountAmount,
        ]);
    }

    protected function generateNumero(?Entreprise $entreprise): string
    {
        $prefix = $entreprise?->devis_prefix ?? 'DEV';
        $number = $entreprise?->next_devis_number ?? 1;
        $year = date('Y');
        
        return sprintf('%s-%s-%05d', $prefix, $year, $number);
    }

    public function markAsSent(Devis $devis): Devis
    {
        $devis->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $devis;
    }

    public function accept(Devis $devis): Devis
    {
        $devis->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return $devis;
    }

    public function reject(Devis $devis, ?string $reason = null): Devis
    {
        $devis->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        return $devis;
    }

    public function convertToInvoice(Devis $devis): Invoice
    {
        $invoiceData = [
            'client_id' => $devis->client_id,
            'date' => now(),
            'due_date' => now()->addDays(30),
            'reference' => $devis->reference,
            'subject' => $devis->subject,
            'introduction' => $devis->introduction,
            'conditions' => $devis->conditions,
            'discount' => $devis->discount,
            'discount_type' => $devis->discount_type,
            'items' => $devis->items->map(function ($item) {
                return [
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'tax_rate' => $item->tax_rate,
                ];
            })->toArray(),
        ];

        $invoice = $this->invoiceService->create($invoiceData);

        $devis->update([
            'invoice_id' => $invoice->id,
            'status' => 'accepted',
            'accepted_at' => $devis->accepted_at ?? now(),
        ]);

        return $invoice;
    }

    public function duplicate(Devis $devis): Devis
    {
        $newData = $devis->toArray();
        unset($newData['id'], $newData['numero'], $newData['created_at'], $newData['updated_at']);
        
        $newData['date'] = now();
        $newData['validity_date'] = now()->addDays(30);
        $newData['status'] = 'draft';
        $newData['sent_at'] = null;
        $newData['accepted_at'] = null;
        $newData['rejected_at'] = null;
        $newData['rejection_reason'] = null;
        $newData['invoice_id'] = null;
        
        $newData['items'] = $devis->items->map(function ($item) {
            return [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'tax_rate' => $item->tax_rate,
            ];
        })->toArray();

        return $this->create($newData);
    }
}
