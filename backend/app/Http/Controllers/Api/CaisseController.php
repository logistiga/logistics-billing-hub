<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Caisse;
use App\Models\MouvementCaisse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CaisseController extends Controller
{
    /**
     * Récupérer l'état de la caisse
     */
    public function index()
    {
        $caisse = Caisse::first();

        if (!$caisse) {
            $caisse = Caisse::create([
                'name' => 'Caisse principale',
                'balance' => 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $caisse,
        ]);
    }

    /**
     * Liste des mouvements de caisse
     */
    public function mouvements(Request $request)
    {
        $query = MouvementCaisse::with(['user', 'invoice']);

        // Filtrage par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
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
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);

        return $query->paginate($perPage);
    }

    /**
     * Ajouter un mouvement (encaissement)
     */
    public function encaissement(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',
            'reference' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'invoice_id' => 'nullable|exists:invoices,id',
        ]);

        $caisse = Caisse::first();

        $mouvement = MouvementCaisse::create([
            'caisse_id' => $caisse->id,
            'type' => 'encaissement',
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'description' => $validated['description'] ?? null,
            'reference' => $validated['reference'] ?? null,
            'category' => $validated['category'] ?? null,
            'invoice_id' => $validated['invoice_id'] ?? null,
            'user_id' => auth()->id(),
            'balance_after' => $caisse->balance + $validated['amount'],
        ]);

        $caisse->increment('balance', $validated['amount']);

        return response()->json([
            'success' => true,
            'data' => $mouvement,
            'message' => 'Encaissement enregistré',
        ], 201);
    }

    /**
     * Ajouter un mouvement (décaissement)
     */
    public function decaissement(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',
            'reference' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'beneficiary' => 'nullable|string|max:255',
        ]);

        $caisse = Caisse::first();

        // Vérifier le solde
        if ($caisse->balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'message' => 'Solde insuffisant',
            ], 422);
        }

        $mouvement = MouvementCaisse::create([
            'caisse_id' => $caisse->id,
            'type' => 'decaissement',
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'description' => $validated['description'] ?? null,
            'reference' => $validated['reference'] ?? null,
            'category' => $validated['category'] ?? null,
            'beneficiary' => $validated['beneficiary'] ?? null,
            'user_id' => auth()->id(),
            'balance_after' => $caisse->balance - $validated['amount'],
        ]);

        $caisse->decrement('balance', $validated['amount']);

        return response()->json([
            'success' => true,
            'data' => $mouvement,
            'message' => 'Décaissement enregistré',
        ], 201);
    }

    /**
     * Annuler un mouvement
     */
    public function cancel(MouvementCaisse $mouvement)
    {
        if ($mouvement->is_cancelled) {
            return response()->json([
                'success' => false,
                'message' => 'Ce mouvement est déjà annulé',
            ], 422);
        }

        $caisse = Caisse::first();

        // Inverser le mouvement
        if ($mouvement->type === 'encaissement') {
            $caisse->decrement('balance', $mouvement->amount);
        } else {
            $caisse->increment('balance', $mouvement->amount);
        }

        $mouvement->update([
            'is_cancelled' => true,
            'cancelled_at' => now(),
            'cancelled_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mouvement annulé',
        ]);
    }

    /**
     * Clôture journalière
     */
    public function clotureJournaliere(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'physical_count' => 'required|numeric|min:0',
        ]);

        $date = Carbon::parse($validated['date']);

        // Calculer le solde théorique
        $mouvements = MouvementCaisse::whereDate('date', $date)
            ->where('is_cancelled', false)
            ->get();

        $encaissements = $mouvements->where('type', 'encaissement')->sum('amount');
        $decaissements = $mouvements->where('type', 'decaissement')->sum('amount');

        $caisse = Caisse::first();
        $theoreticalBalance = $caisse->balance;
        $difference = $validated['physical_count'] - $theoreticalBalance;

        // Enregistrer la clôture
        $cloture = \DB::table('clotures_caisse')->insert([
            'date' => $date,
            'opening_balance' => $theoreticalBalance - $encaissements + $decaissements,
            'total_encaissements' => $encaissements,
            'total_decaissements' => $decaissements,
            'theoretical_balance' => $theoreticalBalance,
            'physical_count' => $validated['physical_count'],
            'difference' => $difference,
            'user_id' => auth()->id(),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date->format('Y-m-d'),
                'encaissements' => $encaissements,
                'decaissements' => $decaissements,
                'theoretical_balance' => $theoreticalBalance,
                'physical_count' => $validated['physical_count'],
                'difference' => $difference,
            ],
            'message' => 'Clôture enregistrée',
        ]);
    }

    /**
     * Statistiques
     */
    public function stats(Request $request)
    {
        $period = $request->get('period', 'month');

        $query = MouvementCaisse::where('is_cancelled', false);

        switch ($period) {
            case 'today':
                $query->whereDate('date', today());
                break;
            case 'week':
                $query->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('date', now()->month)->whereYear('date', now()->year);
                break;
            case 'year':
                $query->whereYear('date', now()->year);
                break;
        }

        $encaissements = (clone $query)->where('type', 'encaissement')->sum('amount');
        $decaissements = (clone $query)->where('type', 'decaissement')->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => Caisse::first()->balance ?? 0,
                'encaissements' => $encaissements,
                'decaissements' => $decaissements,
                'net' => $encaissements - $decaissements,
                'count' => (clone $query)->count(),
                'by_category' => (clone $query)
                    ->selectRaw('category, type, SUM(amount) as total')
                    ->groupBy('category', 'type')
                    ->get(),
            ],
        ]);
    }
}
