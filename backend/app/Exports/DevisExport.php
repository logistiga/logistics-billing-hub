<?php

namespace App\Exports;

use App\Models\Devis;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DevisExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Devis::with('client');

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['client_id'])) {
            $query->where('client_id', $this->filters['client_id']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Numéro',
            'Client',
            'Date',
            'Validité',
            'Objet',
            'Sous-total',
            'TVA',
            'Remise',
            'Total',
            'Statut',
        ];
    }

    public function map($devis): array
    {
        $statusLabels = [
            'draft' => 'Brouillon',
            'sent' => 'Envoyé',
            'accepted' => 'Accepté',
            'rejected' => 'Refusé',
            'expired' => 'Expiré',
        ];

        return [
            $devis->numero,
            $devis->client->name ?? 'N/A',
            $devis->date?->format('d/m/Y'),
            $devis->validity_date?->format('d/m/Y'),
            $devis->subject,
            number_format($devis->subtotal, 2, ',', ' '),
            number_format($devis->tax_amount, 2, ',', ' '),
            number_format($devis->discount_amount, 2, ',', ' '),
            number_format($devis->total, 2, ',', ' '),
            $statusLabels[$devis->status] ?? $devis->status,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function title(): string
    {
        return 'Devis';
    }
}
