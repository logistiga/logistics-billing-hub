<?php

namespace App\Exports;

use App\Models\Credit;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CreditsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Credit::with('banque');

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['banque_id'])) {
            $query->where('banque_id', $this->filters['banque_id']);
        }

        return $query->orderBy('date_debut', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Référence',
            'Banque',
            'Montant',
            'Taux intérêt',
            'Durée (mois)',
            'Date début',
            'Date fin',
            'Mensualité',
            'Objet',
            'Échéances payées',
            'Progression',
            'Statut',
        ];
    }

    public function map($credit): array
    {
        $statusLabels = [
            'active' => 'Actif',
            'completed' => 'Terminé',
            'overdue' => 'En retard',
        ];

        return [
            $credit->reference,
            $credit->banque->name ?? 'N/A',
            number_format($credit->montant, 2, ',', ' '),
            $credit->taux_interet . '%',
            $credit->duree_mois,
            $credit->date_debut?->format('d/m/Y'),
            $credit->date_fin?->format('d/m/Y'),
            number_format($credit->mensualite, 2, ',', ' '),
            $credit->objet,
            $credit->echeances_payees . '/' . $credit->duree_mois,
            round($credit->progression, 1) . '%',
            $statusLabels[$credit->status] ?? $credit->status,
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
        return 'Crédits Bancaires';
    }
}
