<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Credit;
use App\Models\CreditPayment;
use Illuminate\Http\Request;

class CreditController extends Controller
{
    /**
     * Liste des crédits
     */
    public function index(Request $request)
    {
        $query = Credit::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('bank', 'like', "%{$search}%")
                  ->orWhere('objet_credit', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
    }

    /**
     * Créer un crédit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank' => 'required|string|max:255',
            'capital_initial' => 'required|numeric|min:0',
            'taux_interet' => 'required|numeric|min:0|max:100',
            'duree_total' => 'required|integer|min:1',
            'date_debut' => 'required|date',
            'objet_credit' => 'required|string|max:500',
        ]);

        // Générer la référence
        $year = date('Y');
        $count = Credit::whereYear('created_at', $year)->count() + 1;
        $validated['reference'] = sprintf('CR-%s-%03d', $year, $count);

        // Calculer les valeurs dérivées
        $validated['capital_restant'] = $validated['capital_initial'];
        $validated['echeances_payees'] = 0;
        $validated['status'] = 'active';

        // Calculer la mensualité (formule d'amortissement)
        $tauxMensuel = $validated['taux_interet'] / 100 / 12;
        $n = $validated['duree_total'];
        $capital = $validated['capital_initial'];
        
        if ($tauxMensuel > 0) {
            $validated['mensualite'] = $capital * ($tauxMensuel * pow(1 + $tauxMensuel, $n)) / (pow(1 + $tauxMensuel, $n) - 1);
        } else {
            $validated['mensualite'] = $capital / $n;
        }

        // Date de fin et prochain paiement
        $dateDebut = new \DateTime($validated['date_debut']);
        $dateFin = clone $dateDebut;
        $dateFin->modify("+{$n} months");
        $validated['date_fin'] = $dateFin->format('Y-m-d');

        $prochainPaiement = clone $dateDebut;
        $prochainPaiement->modify('+1 month');
        $validated['prochain_paiement'] = $prochainPaiement->format('Y-m-d');

        $credit = Credit::create($validated);

        return response()->json([
            'success' => true,
            'data' => $credit,
            'message' => 'Crédit créé avec succès',
        ], 201);
    }

    /**
     * Afficher un crédit
     */
    public function show(Credit $credit)
    {
        return response()->json([
            'success' => true,
            'data' => $credit->load('payments'),
        ]);
    }

    /**
     * Mettre à jour un crédit
     */
    public function update(Request $request, Credit $credit)
    {
        $validated = $request->validate([
            'bank' => 'sometimes|string|max:255',
            'objet_credit' => 'sometimes|string|max:500',
            'status' => 'sometimes|in:active,overdue,completed,suspended',
        ]);

        $credit->update($validated);

        return response()->json([
            'success' => true,
            'data' => $credit->fresh(),
            'message' => 'Crédit mis à jour',
        ]);
    }

    /**
     * Supprimer un crédit
     */
    public function destroy(Credit $credit)
    {
        $credit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Crédit supprimé',
        ], 204);
    }

    /**
     * Paiements d'un crédit
     */
    public function payments(Credit $credit)
    {
        return response()->json([
            'success' => true,
            'data' => $credit->payments()->orderBy('echeance')->get(),
        ]);
    }

    /**
     * Enregistrer un paiement
     */
    public function recordPayment(Request $request, Credit $credit)
    {
        $validated = $request->validate([
            'montant' => 'required|numeric|min:0',
            'date' => 'nullable|date',
        ]);

        $echeance = $credit->echeances_payees + 1;
        
        // Calculer la répartition capital/intérêts
        $tauxMensuel = $credit->taux_interet / 100 / 12;
        $interet = $credit->capital_restant * $tauxMensuel;
        $capital = $validated['montant'] - $interet;

        $payment = $credit->payments()->create([
            'credit_ref' => $credit->reference,
            'bank' => $credit->bank,
            'date' => $validated['date'] ?? now()->format('Y-m-d'),
            'montant' => $validated['montant'],
            'capital' => max(0, $capital),
            'interet' => $interet,
            'status' => 'paid',
            'echeance' => $echeance,
        ]);

        // Mettre à jour le crédit
        $credit->capital_restant = max(0, $credit->capital_restant - $capital);
        $credit->echeances_payees = $echeance;

        // Calculer le prochain paiement
        $prochainPaiement = new \DateTime($credit->prochain_paiement);
        $prochainPaiement->modify('+1 month');
        $credit->prochain_paiement = $prochainPaiement->format('Y-m-d');

        // Vérifier si le crédit est terminé
        if ($credit->echeances_payees >= $credit->duree_total || $credit->capital_restant <= 0) {
            $credit->status = 'completed';
        }

        $credit->save();

        return response()->json([
            'success' => true,
            'data' => $payment,
            'message' => 'Paiement enregistré',
        ]);
    }

    /**
     * Échéancier complet
     */
    public function schedule(Credit $credit)
    {
        $schedule = [];
        $capitalRestant = $credit->capital_initial;
        $tauxMensuel = $credit->taux_interet / 100 / 12;
        $dateEcheance = new \DateTime($credit->date_debut);

        for ($i = 1; $i <= $credit->duree_total; $i++) {
            $dateEcheance->modify('+1 month');
            
            $interet = $capitalRestant * $tauxMensuel;
            $capital = $credit->mensualite - $interet;
            $capitalRestant = max(0, $capitalRestant - $capital);

            $existingPayment = $credit->payments()->where('echeance', $i)->first();

            $schedule[] = [
                'echeance' => $i,
                'date' => $dateEcheance->format('d/m/Y'),
                'mensualite' => round($credit->mensualite, 0),
                'capital' => round($capital, 0),
                'interet' => round($interet, 0),
                'capital_restant' => round($capitalRestant, 0),
                'status' => $existingPayment ? 'paid' : ($i <= $credit->echeances_payees ? 'paid' : 'pending'),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $schedule,
        ]);
    }

    /**
     * Crédits en retard
     */
    public function overdue()
    {
        $credits = Credit::where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'active')
                  ->where('prochain_paiement', '<', now());
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $credits,
        ]);
    }

    /**
     * Paiements à venir
     */
    public function upcomingPayments()
    {
        $in7Days = now()->addDays(7);

        $credits = Credit::where('status', 'active')
            ->where('prochain_paiement', '>=', now())
            ->where('prochain_paiement', '<=', $in7Days)
            ->get();

        $payments = $credits->map(function ($credit) {
            return [
                'credit_id' => $credit->id,
                'credit_ref' => $credit->reference,
                'bank' => $credit->bank,
                'date' => $credit->prochain_paiement,
                'montant' => $credit->mensualite,
                'echeance' => $credit->echeances_payees + 1,
                'status' => 'pending',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Statistiques
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_capital' => Credit::sum('capital_initial'),
                'total_restant' => Credit::where('status', '!=', 'completed')->sum('capital_restant'),
                'total_mensualites' => Credit::where('status', 'active')->sum('mensualite'),
                'overdue_count' => Credit::where('status', 'overdue')->count(),
                'active_count' => Credit::where('status', 'active')->count(),
            ],
        ]);
    }
}
