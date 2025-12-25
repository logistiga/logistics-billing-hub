<?php

namespace App\Exports;

use App\Models\Invoice;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InvoicesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Invoice::with('client');

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

        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Numéro',
            'Client',
            'Date',
            'Échéance',
            'Référence',
            'Sous-total',
            'TVA',
            'Total',
            'Payé',
            'Reste à payer',
            'Statut',
            'Type',
        ];
    }

    public function map($invoice): array
    {
        $statusLabels = [
            'draft' => 'Brouillon',
            'sent' => 'Envoyée',
            'partial' => 'Partiel',
            'paid' => 'Payée',
            'overdue' => 'En retard',
            'cancelled' => 'Annulée',
        ];

        return [
            $invoice->numero,
            $invoice->client->name ?? 'N/A',
            $invoice->date?->format('d/m/Y'),
            $invoice->due_date?->format('d/m/Y'),
            $invoice->reference,
            number_format($invoice->subtotal, 2, ',', ' '),
            number_format($invoice->tax_amount, 2, ',', ' '),
            number_format($invoice->total, 2, ',', ' '),
            number_format($invoice->amount_paid, 2, ',', ' '),
            number_format($invoice->total - $invoice->amount_paid, 2, ',', ' '),
            $statusLabels[$invoice->status] ?? $invoice->status,
            ucfirst($invoice->type),
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
        return 'Factures';
    }
}
