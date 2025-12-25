<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Transaction::with('banque');

        if (!empty($this->filters['banque_id'])) {
            $query->where('banque_id', $this->filters['banque_id']);
        }

        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        if (!empty($this->filters['category'])) {
            $query->where('category', $this->filters['category']);
        }

        if (!empty($this->filters['is_reconciled'])) {
            $query->where('is_reconciled', $this->filters['is_reconciled'] === 'true');
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
            'Date',
            'Banque',
            'Description',
            'Référence',
            'Type',
            'Catégorie',
            'Crédit',
            'Débit',
            'Solde',
            'Rapproché',
        ];
    }

    public function map($transaction): array
    {
        $typeLabels = [
            'virement' => 'Virement',
            'cheque' => 'Chèque',
            'prelevement' => 'Prélèvement',
            'versement' => 'Versement',
            'retrait' => 'Retrait',
        ];

        return [
            $transaction->date?->format('d/m/Y'),
            $transaction->banque->name ?? 'N/A',
            $transaction->description,
            $transaction->reference,
            $typeLabels[$transaction->type] ?? $transaction->type,
            ucfirst($transaction->category),
            $transaction->credit > 0 ? number_format($transaction->credit, 2, ',', ' ') : '-',
            $transaction->debit > 0 ? number_format($transaction->debit, 2, ',', ' ') : '-',
            number_format($transaction->credit - $transaction->debit, 2, ',', ' '),
            $transaction->is_reconciled ? 'Oui' : 'Non',
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
        return 'Transactions Bancaires';
    }
}
