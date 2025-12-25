<?php

namespace App\Services;

use App\Models\Banque;
use App\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BanqueService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Banque::withCount('transactions');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('bank_name', 'like', "%{$search}%")
                    ->orWhere('iban', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?Banque
    {
        return Banque::withCount('transactions')->find($id);
    }

    public function create(array $data): Banque
    {
        $data['current_balance'] = $data['initial_balance'] ?? 0;
        
        $banque = Banque::create($data);

        if ($banque->is_default) {
            Banque::where('id', '!=', $banque->id)->update(['is_default' => false]);
        }

        return $banque;
    }

    public function update(Banque $banque, array $data): Banque
    {
        $banque->update($data);

        if ($banque->is_default) {
            Banque::where('id', '!=', $banque->id)->update(['is_default' => false]);
        }

        return $banque;
    }

    public function delete(Banque $banque): bool
    {
        return $banque->delete();
    }

    public function getTransactions(Banque $banque, array $filters = []): LengthAwarePaginator
    {
        $query = $banque->transactions()->with(['client', 'invoice', 'partenaire']);

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
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

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 50);
    }

    public function addTransaction(Banque $banque, array $data): Transaction
    {
        $transaction = $banque->transactions()->create($data);

        $this->recalculateBalance($banque);

        return $transaction;
    }

    public function recalculateBalance(Banque $banque): void
    {
        $credits = $banque->transactions()
            ->where('type', 'credit')
            ->where('is_cancelled', false)
            ->sum('amount');

        $debits = $banque->transactions()
            ->where('type', 'debit')
            ->where('is_cancelled', false)
            ->sum('amount');

        $banque->update([
            'current_balance' => $banque->initial_balance + $credits - $debits,
        ]);
    }

    public function reconcile(array $transactionIds, ?string $note = null): int
    {
        return Transaction::whereIn('id', $transactionIds)->update([
            'is_reconciled' => true,
            'reconciled_at' => now(),
            'reconciliation_note' => $note,
        ]);
    }

    public function getStats(Banque $banque, ?string $period = 'month'): array
    {
        $startDate = match ($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $transactions = $banque->transactions()
            ->where('is_cancelled', false)
            ->where('date', '>=', $startDate);

        return [
            'total_credits' => (clone $transactions)->where('type', 'credit')->sum('amount'),
            'total_debits' => (clone $transactions)->where('type', 'debit')->sum('amount'),
            'transaction_count' => $transactions->count(),
            'unreconciled_count' => $banque->transactions()->where('is_reconciled', false)->count(),
            'current_balance' => $banque->current_balance,
        ];
    }
}
