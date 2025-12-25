<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Banque;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Liste de toutes les transactions avec pagination
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['banque', 'invoice']);

        // Filtrage par banque
        if ($request->has('banque_id')) {
            $query->where('banque_id', $request->banque_id);
        }

        // Filtrage par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filtrage par catégorie
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filtrage par statut de rapprochement
        if ($request->has('is_reconciled')) {
            $query->where('is_reconciled', $request->boolean('is_reconciled'));
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
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('banque', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
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
     * Créer une transaction
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'banque_id' => 'required|exists:banques,id',
            'type' => 'required|in:credit,debit',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'invoice_id' => 'nullable|exists:invoices,id',
        ]);

        $banque = Banque::findOrFail($validated['banque_id']);

        if ($validated['type'] === 'credit') {
            $validated['credit'] = $validated['amount'];
            $validated['debit'] = 0;
            $banque->increment('balance', $validated['amount']);
        } else {
            $validated['debit'] = $validated['amount'];
            $validated['credit'] = 0;
            $banque->decrement('balance', $validated['amount']);
        }

        unset($validated['amount']);
        $validated['is_reconciled'] = false;

        $transaction = Transaction::create($validated);

        return response()->json([
            'success' => true,
            'data' => $transaction->load(['banque', 'invoice']),
            'message' => 'Transaction créée',
        ], 201);
    }

    /**
     * Afficher une transaction
     */
    public function show(Transaction $transaction)
    {
        return response()->json([
            'success' => true,
            'data' => $transaction->load(['banque', 'invoice']),
        ]);
    }

    /**
     * Mettre à jour une transaction
     */
    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'date' => 'sometimes|date',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'is_reconciled' => 'boolean',
        ]);

        $transaction->update($validated);

        return response()->json([
            'success' => true,
            'data' => $transaction->fresh()->load(['banque', 'invoice']),
            'message' => 'Transaction mise à jour',
        ]);
    }

    /**
     * Supprimer une transaction
     */
    public function destroy(Transaction $transaction)
    {
        $banque = $transaction->banque;

        // Inverser l'effet sur le solde
        if ($transaction->credit > 0) {
            $banque->decrement('balance', $transaction->credit);
        } else {
            $banque->increment('balance', $transaction->debit);
        }

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction supprimée',
        ], 204);
    }

    /**
     * Marquer comme rapproché
     */
    public function reconcile(Request $request)
    {
        $validated = $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:transactions,id',
        ]);

        Transaction::whereIn('id', $validated['transaction_ids'])
            ->update(['is_reconciled' => true]);

        return response()->json([
            'success' => true,
            'message' => count($validated['transaction_ids']) . ' transactions rapprochées',
        ]);
    }

    /**
     * Annuler le rapprochement
     */
    public function unreconcile(Request $request)
    {
        $validated = $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:transactions,id',
        ]);

        Transaction::whereIn('id', $validated['transaction_ids'])
            ->update(['is_reconciled' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Rapprochement annulé',
        ]);
    }

    /**
     * Catégories disponibles
     */
    public function categories()
    {
        $categories = Transaction::distinct()->pluck('category')->filter();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Statistiques
     */
    public function stats(Request $request)
    {
        $query = Transaction::query();

        // Filtrage par période
        if ($request->has('period')) {
            switch ($request->period) {
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
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_credit' => (clone $query)->sum('credit'),
                'total_debit' => (clone $query)->sum('debit'),
                'net' => (clone $query)->sum('credit') - (clone $query)->sum('debit'),
                'count' => (clone $query)->count(),
                'reconciled' => (clone $query)->where('is_reconciled', true)->count(),
                'unreconciled' => (clone $query)->where('is_reconciled', false)->count(),
                'by_category' => Transaction::selectRaw('category, SUM(credit) as total_credit, SUM(debit) as total_debit, COUNT(*) as count')
                    ->groupBy('category')
                    ->get(),
            ],
        ]);
    }
}
