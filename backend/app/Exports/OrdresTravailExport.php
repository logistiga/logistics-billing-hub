<?php

namespace App\Exports;

use App\Models\OrdreTravail;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrdresTravailExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = OrdreTravail::with(['client', 'createdBy', 'validatedBy']);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['client_id'])) {
            $query->where('client_id', $this->filters['client_id']);
        }

        if (!empty($this->filters['type_operation'])) {
            $query->where('type_operation', $this->filters['type_operation']);
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
            'Date exécution',
            'Type opération',
            'BL Numéro',
            'Conteneur',
            'Navire',
            'Port origine',
            'Port destination',
            'Statut',
            'Créé par',
            'Validé par',
        ];
    }

    public function map($ordre): array
    {
        $statusLabels = [
            'draft' => 'Brouillon',
            'pending' => 'En attente',
            'in_progress' => 'En cours',
            'completed' => 'Terminé',
            'cancelled' => 'Annulé',
        ];

        $typeLabels = [
            'import' => 'Import',
            'export' => 'Export',
            'transit' => 'Transit',
            'stockage' => 'Stockage',
        ];

        return [
            $ordre->numero,
            $ordre->client->name ?? 'N/A',
            $ordre->date?->format('d/m/Y'),
            $ordre->date_execution?->format('d/m/Y'),
            $typeLabels[$ordre->type_operation] ?? $ordre->type_operation,
            $ordre->bl_numero,
            $ordre->conteneur_numero,
            $ordre->navire,
            $ordre->port_origine,
            $ordre->port_destination,
            $statusLabels[$ordre->status] ?? $ordre->status,
            $ordre->createdBy->name ?? 'N/A',
            $ordre->validatedBy->name ?? '-',
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
        return 'Ordres de Travail';
    }
}
