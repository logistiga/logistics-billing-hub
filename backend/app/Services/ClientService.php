<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ClientService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Client::with('contacts')
            ->withCount('invoices');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nif', 'like', "%{$search}%")
                    ->orWhere('rccm', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getById(int $id): ?Client
    {
        return Client::with(['contacts', 'invoices' => function ($q) {
            $q->latest()->limit(10);
        }])->find($id);
    }

    public function create(array $data): Client
    {
        $client = Client::create($data);

        if (!empty($data['contacts'])) {
            foreach ($data['contacts'] as $contact) {
                $client->contacts()->create($contact);
            }
        }

        return $client->load('contacts');
    }

    public function update(Client $client, array $data): Client
    {
        $client->update($data);

        if (isset($data['contacts'])) {
            $client->contacts()->delete();
            foreach ($data['contacts'] as $contact) {
                $client->contacts()->create($contact);
            }
        }

        return $client->load('contacts');
    }

    public function delete(Client $client): bool
    {
        return $client->delete();
    }

    public function getBalance(Client $client): float
    {
        $totalInvoiced = $client->invoices()->sum('total');
        $totalPaid = $client->invoices()->sum('paid_amount');
        return $totalInvoiced - $totalPaid;
    }

    public function getStats(Client $client): array
    {
        return [
            'total_invoiced' => $client->invoices()->sum('total'),
            'total_paid' => $client->invoices()->sum('paid_amount'),
            'balance' => $this->getBalance($client),
            'invoices_count' => $client->invoices()->count(),
            'pending_invoices' => $client->invoices()->where('status', 'pending')->count(),
            'overdue_invoices' => $client->invoices()->where('status', 'overdue')->count(),
        ];
    }
}
