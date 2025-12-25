<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banque;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionsExport;

class BanqueController extends Controller
{
    /**
     * Liste des banques
     */
    public function index(Request $request)
    {
        $query = Banque::query();

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('account_number', 'like', "%{$search}%")
                  ->orWhere('iban', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Créer une banque
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50|unique:banques',
            'iban' => 'nullable|string|max:50',
            'swift' => 'nullable|string|max:20',
            'initial_balance' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        $validated['balance'] = $validated['initial_balance'] ?? 0;

        $banque = Banque::create($validated);

        return response()->json([
            'success' => true,
            'data' => $banque,
            'message' => 'Banque créée avec succès',
        ], 201);
    }

    /**
     * Afficher une banque
     */
    public function show(Banque $banque)
    {
        return response()->json([
            'success' => true,
            'data' => $banque,
        ]);
    }

    /**
     * Mettre à jour une banque
     */
    public function update(Request $request, Banque $banque)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'account_number' => 'sometimes|string|max:50|unique:banques,account_number,' . $banque->id,
            'iban' => 'nullable|string|max:50',
            'swift' => 'nullable|string|max:20',
            'currency' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        $banque->update($validated);

        return response()->json([
            'success' => true,
            'data' => $banque->fresh(),
            'message' => 'Banque mise à jour',
        ]);
    }

    /**
     * Supprimer une banque
     */
    public function destroy(Banque $banque)
    {
        // Vérifier qu'il n'y a pas de transactions
        if ($banque->transactions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une banque avec des transactions',
            ], 422);
        }

        $banque->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banque supprimée',
        ], 204);
    }

    /**
     * Liste des transactions d'une banque
     */
    public function transactions(Request $request, Banque $banque)
    {
        $query = $banque->transactions()->with('invoice');

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
     * Ajouter une transaction
     */
    public function addTransaction(Request $request, Banque $banque)
    {
        $validated = $request->validate([
            'type' => 'required|in:credit,debit',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
            'invoice_id' => 'nullable|exists:invoices,id',
            'is_reconciled' => 'boolean',
        ]);

        $validated['banque_id'] = $banque->id;

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

        $transaction = Transaction::create($validated);

        return response()->json([
            'success' => true,
            'data' => $transaction,
            'message' => 'Transaction ajoutée',
        ], 201);
    }

    /**
     * Mettre à jour une transaction
     */
    public function updateTransaction(Request $request, Banque $banque, Transaction $transaction)
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
            'data' => $transaction->fresh(),
            'message' => 'Transaction mise à jour',
        ]);
    }

    /**
     * Supprimer une transaction
     */
    public function deleteTransaction(Banque $banque, Transaction $transaction)
    {
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
     * Rapprochement bancaire
     */
    public function reconcile(Request $request, Banque $banque)
    {
        $validated = $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:transactions,id',
            'bank_statement_balance' => 'required|numeric',
        ]);

        Transaction::whereIn('id', $validated['transaction_ids'])
            ->where('banque_id', $banque->id)
            ->update(['is_reconciled' => true]);

        // Calcul de l'écart
        $bookBalance = $banque->balance;
        $difference = $validated['bank_statement_balance'] - $bookBalance;

        return response()->json([
            'success' => true,
            'data' => [
                'book_balance' => $bookBalance,
                'bank_statement_balance' => $validated['bank_statement_balance'],
                'difference' => $difference,
                'reconciled_count' => count($validated['transaction_ids']),
            ],
            'message' => 'Rapprochement effectué',
        ]);
    }

    /**
     * Solde d'une banque
     */
    public function balance(Banque $banque)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $banque->balance,
                'total_credit' => $banque->transactions()->sum('credit'),
                'total_debit' => $banque->transactions()->sum('debit'),
                'pending_reconciliation' => $banque->transactions()->where('is_reconciled', false)->count(),
            ],
        ]);
    }

    /**
     * Exporter les transactions
     */
    public function export(Request $request, Banque $banque)
    {
        $format = $request->get('format', 'xlsx');
        $filename = "transactions_{$banque->name}_" . date('Y-m-d') . ".{$format}";

        return Excel::download(new TransactionsExport($banque->id, $request->all()), $filename);
    }

    /**
     * Statistiques globales
     */
    public function stats()
    {
        $banques = Banque::all();

        return response()->json([
            'success' => true,
            'data' => [
                'total_banques' => $banques->count(),
                'total_balance' => $banques->sum('balance'),
                'total_transactions' => Transaction::count(),
                'unreconciled_transactions' => Transaction::where('is_reconciled', false)->count(),
                'this_month' => [
                    'credits' => Transaction::whereMonth('date', now()->month)->sum('credit'),
                    'debits' => Transaction::whereMonth('date', now()->month)->sum('debit'),
                ],
            ],
        ]);
    }
}
