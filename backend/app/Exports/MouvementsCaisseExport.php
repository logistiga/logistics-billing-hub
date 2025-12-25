<?php

namespace App\Exports;

use App\Models\MouvementCaisse;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MouvementsCaisseExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = MouvementCaisse::with(['caisse', 'user']);

        if (!empty($this->filters['caisse_id'])) {
            $query->where('caisse_id', $this->filters['caisse_id']);
        }

        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        if (!empty($this->filters['category'])) {
            $query->where('category', $this->filters['category']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('date', '<=', $this->filters['date_to']);
        }

        if (!empty($this->filters['include_cancelled']) && $this->filters['include_cancelled'] !== 'true') {
            $query->where('is_cancelled', false);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Caisse',
            'Type',
            'Catégorie',
            'Description',
            'Référence',
            'Montant',
            'Utilisateur',
            'Annulé',
        ];
    }

    public function map($mouvement): array
    {
        return [
            $mouvement->date?->format('d/m/Y H:i'),
            $mouvement->caisse->name ?? 'N/A',
            $mouvement->type === 'encaissement' ? 'Encaissement' : 'Décaissement',
            ucfirst($mouvement->category),
            $mouvement->description,
            $mouvement->reference,
            number_format($mouvement->amount, 2, ',', ' '),
            $mouvement->user->name ?? 'N/A',
            $mouvement->is_cancelled ? 'Oui' : 'Non',
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
        return 'Mouvements Caisse';
    }
}
