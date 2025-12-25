<?php

namespace App\Services;

use App\Models\NoteDebut;
use App\Models\Entreprise;
use Illuminate\Pagination\LengthAwarePaginator;

class NoteDebutService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = NoteDebut::with(['client', 'ordreTravail']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhere('conteneur', 'like', "%{$search}%")
                    ->orWhere('bl_number', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (isset($filters['validated'])) {
            $query->where('validated', $filters['validated']);
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

    public function getById(int $id): ?NoteDebut
    {
        return NoteDebut::with(['client', 'ordreTravail'])->find($id);
    }

    public function create(array $data): NoteDebut
    {
        $data['numero'] = $this->generateNumero($data['type']);

        return NoteDebut::create($data);
    }

    public function update(NoteDebut $note, array $data): NoteDebut
    {
        $note->update($data);
        return $note;
    }

    public function delete(NoteDebut $note): bool
    {
        return $note->delete();
    }

    protected function generateNumero(string $type): string
    {
        $prefixes = [
            'debut' => 'ND',
            'detention' => 'NDET',
            'ouverture_port' => 'NOP',
            'reparation' => 'NR',
        ];

        $prefix = $prefixes[$type] ?? 'NOTE';
        $year = date('Y');
        
        $lastNote = NoteDebut::where('type', $type)
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = 1;
        if ($lastNote && preg_match('/(\d+)$/', $lastNote->numero, $matches)) {
            $number = (int) $matches[1] + 1;
        }

        return sprintf('%s-%s-%05d', $prefix, $year, $number);
    }

    public function validate(NoteDebut $note, int $userId): NoteDebut
    {
        $note->update([
            'validated' => true,
            'validated_at' => now(),
            'validated_by' => $userId,
        ]);

        return $note;
    }

    public function getByType(string $type, array $filters = []): LengthAwarePaginator
    {
        $filters['type'] = $type;
        return $this->getAll($filters);
    }

    public function getStats(): array
    {
        return [
            'total' => NoteDebut::count(),
            'by_type' => [
                'debut' => NoteDebut::where('type', 'debut')->count(),
                'detention' => NoteDebut::where('type', 'detention')->count(),
                'ouverture_port' => NoteDebut::where('type', 'ouverture_port')->count(),
                'reparation' => NoteDebut::where('type', 'reparation')->count(),
            ],
            'pending_validation' => NoteDebut::where('validated', false)->count(),
            'this_month' => NoteDebut::whereMonth('date', now()->month)->count(),
        ];
    }
}
