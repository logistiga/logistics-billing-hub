<?php

namespace App\Services;

use App\Models\Avoir;
use App\Models\AvoirItem;
use App\Models\AvoirCompensation;
use App\Models\Entreprise;
use Illuminate\Pagination\LengthAwarePaginator;

class AvoirService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Avoir::with(['client', 'items', 'invoice']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
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

    public function getById(int $id): ?Avoir
    {
        return Avoir::with(['client', 'items', 'invoice', 'compensations.invoice'])->find($id);
    }

    public function create(array $data): Avoir
    {
        $entreprise = Entreprise::first();
        
        $data['numero'] = $this->generateNumero($entreprise);
        $data['subtotal'] = 0;
        $data['tax_amount'] = 0;
        $data['total'] = 0;
        $data['used_amount'] = 0;
        $data['remaining_amount'] = 0;
        $data['status'] = 'active';

        $avoir = Avoir::create($data);

        if (!empty($data['items'])) {
            foreach ($data['items'] as $itemData) {
                $this->createItem($avoir, $itemData);
            }
        }

        $this->recalculateTotals($avoir);

        if ($entreprise) {
            $entreprise->increment('next_avoir_number');
        }

        return $avoir->load(['client', 'items']);
    }

    public function update(Avoir $avoir, array $data): Avoir
    {
        $avoir->update($data);

        if (isset($data['items'])) {
            $avoir->items()->delete();
            foreach ($data['items'] as $itemData) {
                $this->createItem($avoir, $itemData);
            }
        }

        $this->recalculateTotals($avoir);

        return $avoir->load(['client', 'items']);
    }

    public function delete(Avoir $avoir): bool
    {
        return $avoir->delete();
    }

    protected function createItem(Avoir $avoir, array $data): AvoirItem
    {
        $amount = ($data['quantity'] ?? 1) * ($data['unit_price'] ?? 0);
        
        return $avoir->items()->create([
            'description' => $data['description'],
            'quantity' => $data['quantity'] ?? 1,
            'unit_price' => $data['unit_price'] ?? 0,
            'tax_rate' => $data['tax_rate'] ?? 0,
            'amount' => $amount,
        ]);
    }

    public function recalculateTotals(Avoir $avoir): void
    {
        $subtotal = 0;
        $taxAmount = 0;

        foreach ($avoir->items as $item) {
            $subtotal += $item->amount;
            $taxAmount += $item->amount * (($item->tax_rate ?? 0) / 100);
        }

        $total = $subtotal + $taxAmount;
        $usedAmount = $avoir->compensations()->sum('amount');
        $remainingAmount = $total - $usedAmount;

        $status = 'active';
        if ($remainingAmount <= 0) {
            $status = 'fully_used';
        } elseif ($usedAmount > 0) {
            $status = 'partially_used';
        }

        $avoir->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'used_amount' => $usedAmount,
            'remaining_amount' => max(0, $remainingAmount),
            'status' => $status,
        ]);
    }

    protected function generateNumero(?Entreprise $entreprise): string
    {
        $prefix = $entreprise?->avoir_prefix ?? 'AV';
        $number = $entreprise?->next_avoir_number ?? 1;
        $year = date('Y');
        
        return sprintf('%s-%s-%05d', $prefix, $year, $number);
    }

    public function compensate(Avoir $avoir, int $invoiceId, float $amount, ?string $notes = null): AvoirCompensation
    {
        if ($amount > $avoir->remaining_amount) {
            throw new \InvalidArgumentException('Le montant de compensation dépasse le solde disponible de l\'avoir.');
        }

        $compensation = $avoir->compensations()->create([
            'invoice_id' => $invoiceId,
            'amount' => $amount,
            'date' => now(),
            'notes' => $notes,
        ]);

        $this->recalculateTotals($avoir);

        return $compensation;
    }

    public function cancel(Avoir $avoir): Avoir
    {
        $avoir->update(['status' => 'cancelled']);
        return $avoir;
    }
}
