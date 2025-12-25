<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\Banque;
use Illuminate\Pagination\LengthAwarePaginator;

class TransactionService
{
    protected BanqueService $banqueService;

    public function __construct(BanqueService $banqueService)
    {
        $this->banqueService = $banqueService;
    }

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Transaction::with(['banque', 'client', 'invoice', 'partenaire']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['banque_id'])) {
            $query->where('banque_id', $filters['banque_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        if (isset($filters['is_reconciled'])) {
            $query->where('is_reconciled', $filters['is_reconciled']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 50);
    }

    public function getById(int $id): ?Transaction
    {
        return Transaction::with(['banque', 'client', 'invoice', 'partenaire'])->find($id);
    }

    public function create(array $data): Transaction
    {
        $transaction = Transaction::create($data);

        $banque = Banque::find($data['banque_id']);
        if ($banque) {
            $this->banqueService->recalculateBalance($banque);
        }

        return $transaction->load(['banque', 'client', 'invoice']);
    }

    public function update(Transaction $transaction, array $data): Transaction
    {
        $oldBanqueId = $transaction->banque_id;
        
        $transaction->update($data);

        // Recalculate balance for old banque
        $oldBanque = Banque::find($oldBanqueId);
        if ($oldBanque) {
            $this->banqueService->recalculateBalance($oldBanque);
        }

        // If banque changed, recalculate new banque balance
        if (isset($data['banque_id']) && $data['banque_id'] != $oldBanqueId) {
            $newBanque = Banque::find($data['banque_id']);
            if ($newBanque) {
                $this->banqueService->recalculateBalance($newBanque);
            }
        }

        return $transaction->load(['banque', 'client', 'invoice']);
    }

    public function delete(Transaction $transaction): bool
    {
        $banqueId = $transaction->banque_id;
        
        $result = $transaction->delete();

        $banque = Banque::find($banqueId);
        if ($banque) {
            $this->banqueService->recalculateBalance($banque);
        }

        return $result;
    }

    public function cancel(Transaction $transaction): Transaction
    {
        $transaction->update(['is_cancelled' => true]);

        $banque = Banque::find($transaction->banque_id);
        if ($banque) {
            $this->banqueService->recalculateBalance($banque);
        }

        return $transaction;
    }

    public function reconcile(Transaction $transaction, ?string $note = null): Transaction
    {
        $transaction->update([
            'is_reconciled' => true,
            'reconciled_at' => now(),
            'reconciliation_note' => $note,
        ]);

        return $transaction;
    }

    public function bulkReconcile(array $ids, ?string $note = null): int
    {
        return Transaction::whereIn('id', $ids)->update([
            'is_reconciled' => true,
            'reconciled_at' => now(),
            'reconciliation_note' => $note,
        ]);
    }

    public function categorize(Transaction $transaction, string $category): Transaction
    {
        $transaction->update(['category' => $category]);
        return $transaction;
    }

    public function getCategories(): array
    {
        return Transaction::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->toArray();
    }
}
