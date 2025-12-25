<?php

namespace App\Services;

use App\Models\Partenaire;
use App\Models\PartenaireTransaction;
use Illuminate\Pagination\LengthAwarePaginator;

class PartenaireService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Partenaire::withCount('transactions');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?Partenaire
    {
        return Partenaire::with(['transactions' => function ($q) {
            $q->latest()->limit(20);
        }])->withCount('transactions')->find($id);
    }

    public function create(array $data): Partenaire
    {
        return Partenaire::create($data);
    }

    public function update(Partenaire $partenaire, array $data): Partenaire
    {
        $partenaire->update($data);
        return $partenaire;
    }

    public function delete(Partenaire $partenaire): bool
    {
        return $partenaire->delete();
    }

    public function getTransactions(Partenaire $partenaire, array $filters = []): LengthAwarePaginator
    {
        $query = $partenaire->transactions();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
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

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function addTransaction(Partenaire $partenaire, array $data): PartenaireTransaction
    {
        $transaction = $partenaire->transactions()->create($data);

        $this->recalculateBalance($partenaire);

        return $transaction;
    }

    public function recalculateBalance(Partenaire $partenaire): void
    {
        $factures = $partenaire->transactions()
            ->where('type', 'facture')
            ->where('status', '!=', 'cancelled')
            ->sum('amount');

        $paiements = $partenaire->transactions()
            ->where('type', 'paiement')
            ->where('status', '!=', 'cancelled')
            ->sum('amount');

        $avoirs = $partenaire->transactions()
            ->where('type', 'avoir')
            ->where('status', '!=', 'cancelled')
            ->sum('amount');

        $partenaire->update([
            'balance' => $factures - $paiements - $avoirs,
        ]);
    }

    public function markTransactionPaid(PartenaireTransaction $transaction): PartenaireTransaction
    {
        $transaction->update(['status' => 'paid']);

        $partenaire = Partenaire::find($transaction->partenaire_id);
        if ($partenaire) {
            $this->recalculateBalance($partenaire);
        }

        return $transaction;
    }

    public function getStats(Partenaire $partenaire): array
    {
        return [
            'total_factures' => $partenaire->transactions()->where('type', 'facture')->sum('amount'),
            'total_paiements' => $partenaire->transactions()->where('type', 'paiement')->sum('amount'),
            'balance' => $partenaire->balance,
            'pending_count' => $partenaire->transactions()->where('status', 'pending')->count(),
            'overdue_count' => $partenaire->transactions()
                ->where('status', 'pending')
                ->where('due_date', '<', now())
                ->count(),
        ];
    }
}
