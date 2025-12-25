<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NoteDebut;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class NoteDebutController extends Controller
{
    /**
     * Liste des notes de début avec pagination
     */
    public function index(Request $request)
    {
        $query = NoteDebut::with(['client', 'ordreTravail']);

        // Filtrage par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtrage par client
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filtrage par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtrage par date
        if ($request->has('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);

        return $query->paginate($perPage);
    }

    /**
     * Créer une note de début
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:debut,detention,ouverture_port,reparation',
            'client_id' => 'required|exists:clients,id',
            'ordre_travail_id' => 'nullable|exists:ordres_travail,id',
            'date' => 'required|date',
            'reference' => 'nullable|string|max:100',
            'navire' => 'nullable|string|max:255',
            'voyage' => 'nullable|string|max:100',
            'conteneur' => 'nullable|string|max:50',
            'type_conteneur' => 'nullable|string|max:50',
            'taille_conteneur' => 'nullable|string|max:20',
            'armateur' => 'nullable|string|max:255',
            'date_arrivee' => 'nullable|date',
            'date_sortie' => 'nullable|date',
            'jours_detention' => 'nullable|integer',
            'montant_detention' => 'nullable|numeric',
            'observations' => 'nullable|string',
            'details' => 'nullable|array',
        ]);

        // Générer le numéro selon le type
        $prefix = match($validated['type']) {
            'debut' => 'ND',
            'detention' => 'NDT',
            'ouverture_port' => 'NOP',
            'reparation' => 'NR',
            default => 'N',
        };

        $lastNote = NoteDebut::where('type', $validated['type'])
            ->whereYear('created_at', now()->year)
            ->orderBy('id', 'desc')
            ->first();
        $numero = $prefix . '-' . now()->format('Y') . '-' . str_pad(($lastNote ? $lastNote->id + 1 : 1), 5, '0', STR_PAD_LEFT);

        $validated['numero'] = $numero;
        $validated['status'] = 'draft';

        $note = NoteDebut::create($validated);

        return response()->json([
            'success' => true,
            'data' => $note->load(['client', 'ordreTravail']),
            'message' => 'Note créée avec succès',
        ], 201);
    }

    /**
     * Afficher une note de début
     */
    public function show(NoteDebut $noteDebut)
    {
        return response()->json([
            'success' => true,
            'data' => $noteDebut->load(['client', 'ordreTravail']),
        ]);
    }

    /**
     * Mettre à jour une note de début
     */
    public function update(Request $request, NoteDebut $noteDebut)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'ordre_travail_id' => 'nullable|exists:ordres_travail,id',
            'date' => 'sometimes|date',
            'reference' => 'nullable|string|max:100',
            'navire' => 'nullable|string|max:255',
            'voyage' => 'nullable|string|max:100',
            'conteneur' => 'nullable|string|max:50',
            'type_conteneur' => 'nullable|string|max:50',
            'taille_conteneur' => 'nullable|string|max:20',
            'armateur' => 'nullable|string|max:255',
            'date_arrivee' => 'nullable|date',
            'date_sortie' => 'nullable|date',
            'jours_detention' => 'nullable|integer',
            'montant_detention' => 'nullable|numeric',
            'observations' => 'nullable|string',
            'details' => 'nullable|array',
            'status' => 'sometimes|in:draft,validated,cancelled',
        ]);

        $noteDebut->update($validated);

        return response()->json([
            'success' => true,
            'data' => $noteDebut->fresh()->load(['client', 'ordreTravail']),
            'message' => 'Note mise à jour',
        ]);
    }

    /**
     * Supprimer une note de début
     */
    public function destroy(NoteDebut $noteDebut)
    {
        $noteDebut->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note supprimée',
        ], 204);
    }

    /**
     * Valider une note de début
     */
    public function validate(NoteDebut $noteDebut)
    {
        $noteDebut->update([
            'status' => 'validated',
            'validated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $noteDebut->fresh(),
            'message' => 'Note validée',
        ]);
    }

    /**
     * Générer un PDF
     */
    public function generatePdf(NoteDebut $noteDebut)
    {
        $noteDebut->load(['client', 'ordreTravail']);

        $viewName = match($noteDebut->type) {
            'debut' => 'pdf.note-debut',
            'detention' => 'pdf.note-detention',
            'ouverture_port' => 'pdf.note-ouverture-port',
            'reparation' => 'pdf.note-reparation',
            default => 'pdf.note-debut',
        };

        $pdf = Pdf::loadView($viewName, [
            'note' => $noteDebut,
        ]);

        return $pdf->download("note-{$noteDebut->numero}.pdf");
    }

    /**
     * Statistiques par type
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => NoteDebut::count(),
                'by_type' => [
                    'debut' => NoteDebut::where('type', 'debut')->count(),
                    'detention' => NoteDebut::where('type', 'detention')->count(),
                    'ouverture_port' => NoteDebut::where('type', 'ouverture_port')->count(),
                    'reparation' => NoteDebut::where('type', 'reparation')->count(),
                ],
                'by_status' => [
                    'draft' => NoteDebut::where('status', 'draft')->count(),
                    'validated' => NoteDebut::where('status', 'validated')->count(),
                    'cancelled' => NoteDebut::where('status', 'cancelled')->count(),
                ],
                'this_month' => NoteDebut::whereMonth('created_at', now()->month)->count(),
            ],
        ]);
    }
}
