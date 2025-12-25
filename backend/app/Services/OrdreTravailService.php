<?php

namespace App\Services;

use App\Models\OrdreTravail;
use App\Models\LignePrestation;
use App\Models\Transport;
use App\Models\Entreprise;
use Illuminate\Pagination\LengthAwarePaginator;

class OrdreTravailService
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = OrdreTravail::with(['client', 'lignes', 'transports']);

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

        if (!empty($filters['priorite'])) {
            $query->where('priorite', $filters['priorite']);
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

    public function getById(int $id): ?OrdreTravail
    {
        return OrdreTravail::with(['client', 'lignes', 'transports', 'invoice', 'notesDebut'])->find($id);
    }

    public function create(array $data): OrdreTravail
    {
        $entreprise = Entreprise::first();
        
        $data['numero'] = $this->generateNumero($entreprise);
        $data['status'] = $data['status'] ?? 'brouillon';

        $ordre = OrdreTravail::create($data);

        if (!empty($data['lignes'])) {
            foreach ($data['lignes'] as $ligneData) {
                $ordre->lignes()->create($ligneData);
            }
        }

        if (!empty($data['transports'])) {
            foreach ($data['transports'] as $transportData) {
                $ordre->transports()->create($transportData);
            }
        }

        $this->recalculateTotals($ordre);

        if ($entreprise) {
            $entreprise->increment('next_ordre_number');
        }

        return $ordre->load(['client', 'lignes', 'transports']);
    }

    public function update(OrdreTravail $ordre, array $data): OrdreTravail
    {
        $ordre->update($data);

        if (isset($data['lignes'])) {
            $ordre->lignes()->delete();
            foreach ($data['lignes'] as $ligneData) {
                $ordre->lignes()->create($ligneData);
            }
        }

        if (isset($data['transports'])) {
            $ordre->transports()->delete();
            foreach ($data['transports'] as $transportData) {
                $ordre->transports()->create($transportData);
            }
        }

        $this->recalculateTotals($ordre);

        return $ordre->load(['client', 'lignes', 'transports']);
    }

    public function delete(OrdreTravail $ordre): bool
    {
        return $ordre->delete();
    }

    public function recalculateTotals(OrdreTravail $ordre): void
    {
        $totalHt = 0;
        $totalTva = 0;

        foreach ($ordre->lignes as $ligne) {
            $montant = $ligne->quantite * $ligne->prix_unitaire;
            $totalHt += $montant;
            $totalTva += $montant * (($ligne->tva_rate ?? 0) / 100);
        }

        foreach ($ordre->transports as $transport) {
            $totalHt += $transport->prix ?? 0;
        }

        $ordre->update([
            'total_ht' => $totalHt,
            'total_tva' => $totalTva,
            'total_ttc' => $totalHt + $totalTva,
        ]);
    }

    protected function generateNumero(?Entreprise $entreprise): string
    {
        $prefix = $entreprise?->ordre_prefix ?? 'OT';
        $number = $entreprise?->next_ordre_number ?? 1;
        $year = date('Y');
        
        return sprintf('%s-%s-%05d', $prefix, $year, $number);
    }

    public function validate(OrdreTravail $ordre, int $userId): OrdreTravail
    {
        $ordre->update([
            'status' => 'valide',
            'validated_at' => now(),
            'validated_by' => $userId,
        ]);

        return $ordre;
    }

    public function start(OrdreTravail $ordre): OrdreTravail
    {
        $ordre->update(['status' => 'en_cours']);
        return $ordre;
    }

    public function complete(OrdreTravail $ordre): OrdreTravail
    {
        $ordre->update([
            'status' => 'termine',
            'date_fin' => now(),
        ]);
        return $ordre;
    }

    public function cancel(OrdreTravail $ordre): OrdreTravail
    {
        $ordre->update(['status' => 'annule']);
        return $ordre;
    }

    public function convertToInvoice(OrdreTravail $ordre): \App\Models\Invoice
    {
        $items = $ordre->lignes->map(function ($ligne) {
            return [
                'description' => $ligne->description,
                'quantity' => $ligne->quantite,
                'unit_price' => $ligne->prix_unitaire,
                'tax_rate' => $ligne->tva_rate,
            ];
        });

        // Add transports as invoice items
        foreach ($ordre->transports as $transport) {
            if ($transport->prix > 0) {
                $items->push([
                    'description' => "Transport: {$transport->type} - {$transport->depart} → {$transport->arrivee}",
                    'quantity' => 1,
                    'unit_price' => $transport->prix,
                    'tax_rate' => 0,
                ]);
            }
        }

        $invoiceData = [
            'client_id' => $ordre->client_id,
            'ordre_travail_id' => $ordre->id,
            'date' => now(),
            'due_date' => now()->addDays(30),
            'reference' => $ordre->reference,
            'items' => $items->toArray(),
        ];

        $invoice = $this->invoiceService->create($invoiceData);

        $ordre->update([
            'invoice_id' => $invoice->id,
            'status' => 'facture',
        ]);

        return $invoice;
    }
}
