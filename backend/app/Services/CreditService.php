<?php

namespace App\Services;

use App\Models\Credit;
use App\Models\CreditPayment;
use Illuminate\Pagination\LengthAwarePaginator;

class CreditService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Credit::with('banque');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('reference_contrat', 'like', "%{$search}%")
                    ->orWhere('organisme', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['banque_id'])) {
            $query->where('banque_id', $filters['banque_id']);
        }

        $sortBy = $filters['sort_by'] ?? 'date_debut';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?Credit
    {
        return Credit::with(['banque', 'payments'])->find($id);
    }

    public function create(array $data): Credit
    {
        $data['montant_restant'] = $data['montant_initial'];
        $data['status'] = 'active';
        $data['echeances_payees'] = 0;

        // Calculate next payment date
        $dateDebut = \Carbon\Carbon::parse($data['date_debut']);
        $jourPrelevement = $data['jour_prelevement'] ?? $dateDebut->day;
        
        $prochaine = $dateDebut->copy();
        if ($prochaine->day > $jourPrelevement) {
            $prochaine->addMonth();
        }
        $prochaine->day = min($jourPrelevement, $prochaine->daysInMonth);
        
        $data['prochaine_echeance'] = $prochaine;

        return Credit::create($data);
    }

    public function update(Credit $credit, array $data): Credit
    {
        $credit->update($data);
        return $credit;
    }

    public function delete(Credit $credit): bool
    {
        return $credit->delete();
    }

    public function getPayments(Credit $credit, array $filters = []): LengthAwarePaginator
    {
        $query = $credit->payments()->with('banque');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function addPayment(Credit $credit, array $data): CreditPayment
    {
        $payment = $credit->payments()->create($data);

        $this->recalculate($credit);

        return $payment;
    }

    public function recalculate(Credit $credit): void
    {
        $paidPayments = $credit->payments()->where('status', 'paid')->get();
        
        $totalPaid = $paidPayments->sum('principal');
        $echeancesPayees = $paidPayments->count();

        $montantRestant = $credit->montant_initial - $totalPaid;

        // Calculate next payment date
        $lastPayment = $credit->payments()->where('status', 'paid')->latest('date')->first();
        $prochaine = null;
        
        if ($montantRestant > 0) {
            if ($lastPayment) {
                $prochaine = \Carbon\Carbon::parse($lastPayment->date)->addMonth();
            } else {
                $prochaine = \Carbon\Carbon::parse($credit->date_debut);
            }
            
            $jourPrelevement = $credit->jour_prelevement ?? 1;
            $prochaine->day = min($jourPrelevement, $prochaine->daysInMonth);
        }

        $status = 'active';
        if ($montantRestant <= 0) {
            $status = 'completed';
        } elseif ($prochaine && $prochaine->isPast()) {
            $status = 'overdue';
        }

        $credit->update([
            'montant_restant' => max(0, $montantRestant),
            'echeances_payees' => $echeancesPayees,
            'prochaine_echeance' => $prochaine,
            'status' => $status,
        ]);
    }

    public function getStats(): array
    {
        $credits = Credit::where('status', '!=', 'completed')->get();

        return [
            'total_credits' => $credits->sum('montant_initial'),
            'total_restant' => $credits->sum('montant_restant'),
            'mensualites_total' => $credits->sum('mensualite'),
            'active_count' => $credits->where('status', 'active')->count(),
            'overdue_count' => $credits->where('status', 'overdue')->count(),
        ];
    }

    public function getUpcomingPayments(int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        return Credit::where('status', 'active')
            ->whereNotNull('prochaine_echeance')
            ->whereDate('prochaine_echeance', '<=', now()->addDays($days))
            ->with('banque')
            ->get();
    }
}
