<?php

namespace App\Exports;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class ComptabiliteExport implements WithMultipleSheets
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function sheets(): array
    {
        return [
            'Chiffre d\'affaires' => new ChiffreAffairesSheet($this->filters),
            'Encaissements' => new EncaissementsSheet($this->filters),
            'Transactions bancaires' => new TransactionsBancairesSheet($this->filters),
        ];
    }
}

class ChiffreAffairesSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Invoice::with('client')
            ->whereIn('status', ['sent', 'partial', 'paid']);

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('date')->get();
    }

    public function headings(): array
    {
        return ['Date', 'Numéro', 'Client', 'HT', 'TVA', 'TTC', 'Payé', 'Reste'];
    }

    public function map($invoice): array
    {
        return [
            $invoice->date?->format('d/m/Y'),
            $invoice->numero,
            $invoice->client->name ?? 'N/A',
            number_format($invoice->subtotal, 2, ',', ' '),
            number_format($invoice->tax_amount, 2, ',', ' '),
            number_format($invoice->total, 2, ',', ' '),
            number_format($invoice->amount_paid, 2, ',', ' '),
            number_format($invoice->total - $invoice->amount_paid, 2, ',', ' '),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }

    public function title(): string
    {
        return 'Chiffre d\'affaires';
    }
}

class EncaissementsSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Payment::with(['invoice.client']);

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('payment_date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('payment_date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('payment_date')->get();
    }

    public function headings(): array
    {
        return ['Date', 'Facture', 'Client', 'Montant', 'Mode'];
    }

    public function map($payment): array
    {
        return [
            $payment->payment_date?->format('d/m/Y'),
            $payment->invoice->numero ?? 'N/A',
            $payment->invoice->client->name ?? 'N/A',
            number_format($payment->amount, 2, ',', ' '),
            ucfirst($payment->payment_method),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }

    public function title(): string
    {
        return 'Encaissements';
    }
}

class TransactionsBancairesSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Transaction::with('banque');

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('date')->get();
    }

    public function headings(): array
    {
        return ['Date', 'Banque', 'Description', 'Crédit', 'Débit'];
    }

    public function map($tx): array
    {
        return [
            $tx->date?->format('d/m/Y'),
            $tx->banque->name ?? 'N/A',
            $tx->description,
            $tx->credit > 0 ? number_format($tx->credit, 2, ',', ' ') : '-',
            $tx->debit > 0 ? number_format($tx->debit, 2, ',', ' ') : '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }

    public function title(): string
    {
        return 'Transactions bancaires';
    }
}
