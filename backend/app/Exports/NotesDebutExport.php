<?php

namespace App\Exports;

use App\Models\NoteDebut;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NotesDebutExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = NoteDebut::with(['client', 'createdBy', 'validatedBy']);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
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
            'Client',
            'Date',
            'Type',
            'BL Numéro',
            'Conteneur',
            'Navire',
            'Sous-total',
            'TVA',
            'Total',
            'Statut',
            'Créé par',
            'Validé par',
        ];
    }

    public function map($note): array
    {
        $statusLabels = [
            'draft' => 'Brouillon',
            'pending' => 'En attente',
            'validated' => 'Validée',
            'invoiced' => 'Facturée',
            'cancelled' => 'Annulée',
        ];

        $typeLabels = [
            'debut' => 'Note de Début',
            'detention' => 'Détention',
            'ouverture_port' => 'Ouverture Port',
            'reparation' => 'Réparation',
        ];

        return [
            $note->numero,
            $note->client->name ?? 'N/A',
            $note->date?->format('d/m/Y'),
            $typeLabels[$note->type] ?? $note->type,
            $note->bl_numero,
            $note->conteneur_numero,
            $note->navire,
            number_format($note->subtotal, 2, ',', ' '),
            number_format($note->tax_amount, 2, ',', ' '),
            number_format($note->total, 2, ',', ' '),
            $statusLabels[$note->status] ?? $note->status,
            $note->createdBy->name ?? 'N/A',
            $note->validatedBy->name ?? '-',
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
        return 'Notes de Début';
    }
}
