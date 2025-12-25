<?php

namespace App\Exports;

use App\Models\Avoir;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AvoirsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Avoir::with(['client', 'invoice']);

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
            'Facture liée',
            'Client',
            'Date',
            'Motif',
            'Sous-total',
            'TVA',
            'Total',
            'Utilisé',
            'Restant',
            'Statut',
        ];
    }

    public function map($avoir): array
    {
        $statusLabels = [
            'pending' => 'En attente',
            'partial' => 'Partiel',
            'used' => 'Utilisé',
            'cancelled' => 'Annulé',
        ];

        $reasonLabels = [
            'retour' => 'Retour marchandise',
            'remise' => 'Remise commerciale',
            'erreur_facturation' => 'Erreur facturation',
            'annulation' => 'Annulation',
        ];

        return [
            $avoir->numero,
            $avoir->invoice->numero ?? 'N/A',
            $avoir->client->name ?? 'N/A',
            $avoir->date?->format('d/m/Y'),
            $reasonLabels[$avoir->reason] ?? $avoir->reason,
            number_format($avoir->subtotal, 2, ',', ' '),
            number_format($avoir->tax_amount, 2, ',', ' '),
            number_format($avoir->total, 2, ',', ' '),
            number_format($avoir->amount_used, 2, ',', ' '),
            number_format($avoir->amount_remaining, 2, ',', ' '),
            $statusLabels[$avoir->status] ?? $avoir->status,
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
        return 'Avoirs';
    }
}
