<?php

namespace App\Exports;

use App\Models\Payment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PaymentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Payment::with(['invoice.client']);

        if (!empty($this->filters['payment_method'])) {
            $query->where('payment_method', $this->filters['payment_method']);
        }

        if (!empty($this->filters['invoice_id'])) {
            $query->where('invoice_id', $this->filters['invoice_id']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('payment_date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('payment_date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('payment_date', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Facture',
            'Client',
            'Montant',
            'Mode de paiement',
            'Référence',
            'Notes',
        ];
    }

    public function map($payment): array
    {
        $methodLabels = [
            'cash' => 'Espèces',
            'bank_transfer' => 'Virement',
            'check' => 'Chèque',
            'card' => 'Carte',
        ];

        return [
            $payment->payment_date?->format('d/m/Y'),
            $payment->invoice->numero ?? 'N/A',
            $payment->invoice->client->name ?? 'N/A',
            number_format($payment->amount, 2, ',', ' '),
            $methodLabels[$payment->payment_method] ?? $payment->payment_method,
            $payment->reference,
            $payment->notes,
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
        return 'Paiements';
    }
}
