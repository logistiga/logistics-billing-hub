<?php

namespace App\Exports;

use App\Models\Banque;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BanquesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Banque::withCount('transactions');

        if (!empty($this->filters['is_active'])) {
            $query->where('is_active', $this->filters['is_active'] === 'true');
        }

        if (!empty($this->filters['currency'])) {
            $query->where('currency', $this->filters['currency']);
        }

        return $query->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'Nom',
            'N° Compte',
            'IBAN',
            'SWIFT',
            'Devise',
            'Solde initial',
            'Solde actuel',
            'Total crédit',
            'Total débit',
            'Statut',
            'Nb Transactions',
        ];
    }

    public function map($banque): array
    {
        return [
            $banque->name,
            $banque->account_number,
            $banque->iban,
            $banque->swift,
            $banque->currency,
            number_format($banque->initial_balance, 2, ',', ' '),
            number_format($banque->balance, 2, ',', ' '),
            number_format($banque->total_credit, 2, ',', ' '),
            number_format($banque->total_debit, 2, ',', ' '),
            $banque->is_active ? 'Active' : 'Inactive',
            $banque->transactions_count,
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
        return 'Banques';
    }
}
