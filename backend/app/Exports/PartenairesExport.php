<?php

namespace App\Exports;

use App\Models\Partenaire;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PartenairesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Partenaire::withCount('transactions');

        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        if (!empty($this->filters['is_active'])) {
            $query->where('is_active', $this->filters['is_active'] === 'true');
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'Nom',
            'Type',
            'Email',
            'Téléphone',
            'Adresse',
            'Ville',
            'Pays',
            'NIF',
            'Contact',
            'Solde',
            'Statut',
            'Nb Transactions',
        ];
    }

    public function map($partenaire): array
    {
        $typeLabels = [
            'supplier' => 'Fournisseur',
            'transporter' => 'Transporteur',
            'other' => 'Autre',
        ];

        return [
            $partenaire->name,
            $typeLabels[$partenaire->type] ?? $partenaire->type,
            $partenaire->email,
            $partenaire->phone,
            $partenaire->address,
            $partenaire->city,
            $partenaire->country,
            $partenaire->nif,
            $partenaire->contact_name,
            number_format($partenaire->balance, 2, ',', ' '),
            $partenaire->is_active ? 'Actif' : 'Inactif',
            $partenaire->transactions_count,
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
        return 'Partenaires';
    }
}
