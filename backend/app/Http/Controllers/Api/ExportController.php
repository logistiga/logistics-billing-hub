<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exports\AvoirsExport;
use App\Exports\BanquesExport;
use App\Exports\ClientsExport;
use App\Exports\ComptabiliteExport;
use App\Exports\CreditsExport;
use App\Exports\DevisExport;
use App\Exports\InvoicesExport;
use App\Exports\MouvementsCaisseExport;
use App\Exports\NotesDebutExport;
use App\Exports\OrdresTravailExport;
use App\Exports\PartenairesExport;
use App\Exports\PaymentsExport;
use App\Exports\TransactionsExport;
use App\Exports\UsersExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    /**
     * Export clients to Excel
     */
    public function clients(Request $request)
    {
        $filters = $request->only(['search', 'city']);
        $filename = 'clients_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new ClientsExport($filters), $filename);
    }

    /**
     * Export invoices to Excel
     */
    public function invoices(Request $request)
    {
        $filters = $request->only(['status', 'client_id', 'date_from', 'date_to', 'type']);
        $filename = 'factures_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new InvoicesExport($filters), $filename);
    }

    /**
     * Export devis to Excel
     */
    public function devis(Request $request)
    {
        $filters = $request->only(['status', 'client_id', 'date_from', 'date_to']);
        $filename = 'devis_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new DevisExport($filters), $filename);
    }

    /**
     * Export ordres de travail to Excel
     */
    public function ordresTravail(Request $request)
    {
        $filters = $request->only(['status', 'client_id', 'type_operation', 'date_from', 'date_to']);
        $filename = 'ordres_travail_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new OrdresTravailExport($filters), $filename);
    }

    /**
     * Export bank transactions to Excel
     */
    public function transactions(Request $request)
    {
        $filters = $request->only(['banque_id', 'type', 'category', 'is_reconciled', 'date_from', 'date_to']);
        $filename = 'transactions_bancaires_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new TransactionsExport($filters), $filename);
    }

    /**
     * Export cash movements to Excel
     */
    public function mouvementsCaisse(Request $request)
    {
        $filters = $request->only(['caisse_id', 'type', 'category', 'date_from', 'date_to', 'include_cancelled']);
        $filename = 'mouvements_caisse_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new MouvementsCaisseExport($filters), $filename);
    }

    /**
     * Export payments to Excel
     */
    public function payments(Request $request)
    {
        $filters = $request->only(['payment_method', 'invoice_id', 'date_from', 'date_to']);
        $filename = 'paiements_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new PaymentsExport($filters), $filename);
    }

    /**
     * Export partenaires to Excel
     */
    public function partenaires(Request $request)
    {
        $filters = $request->only(['type', 'is_active', 'search']);
        $filename = 'partenaires_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new PartenairesExport($filters), $filename);
    }

    /**
     * Export credits to Excel
     */
    public function credits(Request $request)
    {
        $filters = $request->only(['status', 'banque_id']);
        $filename = 'credits_bancaires_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new CreditsExport($filters), $filename);
    }

    /**
     * Export avoirs to Excel
     */
    public function avoirs(Request $request)
    {
        $filters = $request->only(['status', 'client_id', 'date_from', 'date_to']);
        $filename = 'avoirs_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new AvoirsExport($filters), $filename);
    }

    /**
     * Export notes de début to Excel
     */
    public function notesDebut(Request $request)
    {
        $filters = $request->only(['status', 'type', 'client_id', 'date_from', 'date_to']);
        $filename = 'notes_debut_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new NotesDebutExport($filters), $filename);
    }

    /**
     * Export users to Excel (Admin only)
     */
    public function users(Request $request)
    {
        $filters = $request->only(['role', 'is_active', 'search']);
        $filename = 'utilisateurs_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new UsersExport($filters), $filename);
    }

    /**
     * Export banques to Excel
     */
    public function banques(Request $request)
    {
        $filters = $request->only(['is_active', 'currency']);
        $filename = 'banques_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new BanquesExport($filters), $filename);
    }

    /**
     * Export comptabilité générale (multi-sheet) to Excel
     */
    public function comptabilite(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to']);
        $filename = 'comptabilite_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new ComptabiliteExport($filters), $filename);
    }
}
