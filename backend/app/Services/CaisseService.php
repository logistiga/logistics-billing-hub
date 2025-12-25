<?php

namespace App\Services;

use App\Models\Caisse;
use App\Models\MouvementCaisse;
use Illuminate\Pagination\LengthAwarePaginator;

class CaisseService
{
    public function getAll(): LengthAwarePaginator
    {
        return Caisse::withCount('mouvements')->paginate(15);
    }

    public function getById(int $id): ?Caisse
    {
        return Caisse::withCount('mouvements')->find($id);
    }

    public function create(array $data): Caisse
    {
        return Caisse::create($data);
    }

    public function update(Caisse $caisse, array $data): Caisse
    {
        $caisse->update($data);
        return $caisse;
    }

    public function delete(Caisse $caisse): bool
    {
        return $caisse->delete();
    }

    public function getMouvements(Caisse $caisse, array $filters = []): LengthAwarePaginator
    {
        $query = $caisse->mouvements()->with(['client', 'invoice']);

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 50);
    }

    public function addMouvement(Caisse $caisse, array $data): MouvementCaisse
    {
        $mouvement = $caisse->mouvements()->create($data);

        $this->recalculateBalance($caisse);

        return $mouvement;
    }

    public function cancelMouvement(MouvementCaisse $mouvement, string $reason): MouvementCaisse
    {
        $mouvement->update([
            'is_cancelled' => true,
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);

        $caisse = Caisse::find($mouvement->caisse_id);
        if ($caisse) {
            $this->recalculateBalance($caisse);
        }

        return $mouvement;
    }

    public function recalculateBalance(Caisse $caisse): void
    {
        $encaissements = $caisse->mouvements()
            ->where('type', 'encaissement')
            ->where('is_cancelled', false)
            ->sum('amount');

        $decaissements = $caisse->mouvements()
            ->where('type', 'decaissement')
            ->where('is_cancelled', false)
            ->sum('amount');

        $caisse->update([
            'balance' => $encaissements - $decaissements,
        ]);
    }

    public function getStats(Caisse $caisse, ?string $period = 'day'): array
    {
        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            default => now()->startOfDay(),
        };

        $mouvements = $caisse->mouvements()
            ->where('is_cancelled', false)
            ->where('date', '>=', $startDate);

        return [
            'total_encaissements' => (clone $mouvements)->where('type', 'encaissement')->sum('amount'),
            'total_decaissements' => (clone $mouvements)->where('type', 'decaissement')->sum('amount'),
            'mouvements_count' => $mouvements->count(),
            'current_balance' => $caisse->balance,
        ];
    }

    public function getDailyReport(Caisse $caisse, string $date): array
    {
        $mouvements = $caisse->mouvements()
            ->whereDate('date', $date)
            ->where('is_cancelled', false)
            ->get();

        $encaissements = $mouvements->where('type', 'encaissement');
        $decaissements = $mouvements->where('type', 'decaissement');

        return [
            'date' => $date,
            'opening_balance' => $this->getOpeningBalance($caisse, $date),
            'encaissements' => [
                'count' => $encaissements->count(),
                'total' => $encaissements->sum('amount'),
                'by_method' => $encaissements->groupBy('payment_method')->map->sum('amount'),
            ],
            'decaissements' => [
                'count' => $decaissements->count(),
                'total' => $decaissements->sum('amount'),
                'by_category' => $decaissements->groupBy('category')->map->sum('amount'),
            ],
            'closing_balance' => $this->getClosingBalance($caisse, $date),
        ];
    }

    protected function getOpeningBalance(Caisse $caisse, string $date): float
    {
        $previousMovements = $caisse->mouvements()
            ->whereDate('date', '<', $date)
            ->where('is_cancelled', false);

        $encaissements = (clone $previousMovements)->where('type', 'encaissement')->sum('amount');
        $decaissements = (clone $previousMovements)->where('type', 'decaissement')->sum('amount');

        return $encaissements - $decaissements;
    }

    protected function getClosingBalance(Caisse $caisse, string $date): float
    {
        $movements = $caisse->mouvements()
            ->whereDate('date', '<=', $date)
            ->where('is_cancelled', false);

        $encaissements = (clone $movements)->where('type', 'encaissement')->sum('amount');
        $decaissements = (clone $movements)->where('type', 'decaissement')->sum('amount');

        return $encaissements - $decaissements;
    }
}
