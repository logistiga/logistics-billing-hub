<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrdreTravailController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\NoteDebutController;
use App\Http\Controllers\Api\BanqueController;
use App\Http\Controllers\Api\AvoirController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\DevisController;
use App\Http\Controllers\Api\PartenaireController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\EntrepriseController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\CaisseController;

/*
|--------------------------------------------------------------------------
| API Routes - Laravel 11
|--------------------------------------------------------------------------
*/

// Health check (public)
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Routes publiques (authentification)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
});

// Routes protégées (nécessitent authentification)
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    
    // ==========================================
    // AUTH
    // ==========================================
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    });

    // ==========================================
    // DASHBOARD
    // ==========================================
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/revenue-chart', [DashboardController::class, 'revenueChart']);
        Route::get('/top-clients', [DashboardController::class, 'topClients']);
        Route::get('/overdue-invoices', [DashboardController::class, 'overdueInvoices']);
        Route::get('/recent-activity', [DashboardController::class, 'recentActivity']);
        Route::get('/cash-flow-forecast', [DashboardController::class, 'cashFlowForecast']);
        Route::get('/invoices-by-status', [DashboardController::class, 'invoicesByStatus']);
        Route::get('/revenue-by-type', [DashboardController::class, 'revenueByType']);
    });

    // ==========================================
    // CLIENTS
    // ==========================================
    Route::prefix('clients')->group(function () {
        Route::get('/search', [ClientController::class, 'search']);
        Route::get('/export', [ClientController::class, 'export']);
        Route::get('/stats', [ClientController::class, 'stats']);
        Route::get('/{client}/balance', [ClientController::class, 'balance']);
        Route::get('/{client}/invoices', [ClientController::class, 'invoices']);
        Route::get('/{client}/contacts', [ClientController::class, 'contacts']);
        Route::post('/{client}/contacts', [ClientController::class, 'addContact']);
        Route::put('/{client}/contacts/{contact}', [ClientController::class, 'updateContact']);
        Route::delete('/{client}/contacts/{contact}', [ClientController::class, 'deleteContact']);
        Route::get('/{client}/stats', [ClientController::class, 'clientStats']);
    });
    Route::apiResource('clients', ClientController::class);

    // ==========================================
    // FACTURES
    // ==========================================
    Route::prefix('invoices')->group(function () {
        Route::get('/stats', [InvoiceController::class, 'stats']);
        Route::get('/overdue', [InvoiceController::class, 'overdue']);
        Route::get('/export', [InvoiceController::class, 'export']);
        Route::get('/search', [InvoiceController::class, 'search']);
        Route::post('/bulk-delete', [InvoiceController::class, 'bulkDelete']);
        Route::post('/bulk-status', [InvoiceController::class, 'bulkStatus']);
        Route::post('/group-payment', [InvoiceController::class, 'groupPayment']);
        Route::get('/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);
        Route::post('/{invoice}/send', [InvoiceController::class, 'sendByEmail']);
        Route::post('/{invoice}/payments', [InvoiceController::class, 'recordPayment']);
        Route::get('/{invoice}/payments', [InvoiceController::class, 'payments']);
        Route::post('/{invoice}/duplicate', [InvoiceController::class, 'duplicate']);
        Route::post('/{invoice}/validate', [InvoiceController::class, 'validateInvoice']);
        Route::post('/{invoice}/cancel', [InvoiceController::class, 'cancel']);
        Route::post('/{invoice}/mark-sent', [InvoiceController::class, 'markSent']);
        Route::post('/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
    });
    Route::apiResource('invoices', InvoiceController::class);

    // ==========================================
    // DEVIS
    // ==========================================
    Route::prefix('devis')->group(function () {
        Route::get('/stats', [DevisController::class, 'stats']);
        Route::get('/search', [DevisController::class, 'search']);
        Route::get('/expired', [DevisController::class, 'expired']);
        Route::post('/bulk-delete', [DevisController::class, 'bulkDelete']);
        Route::get('/{devi}/pdf', [DevisController::class, 'generatePdf']);
        Route::post('/{devi}/send', [DevisController::class, 'send']);
        Route::post('/{devi}/accept', [DevisController::class, 'accept']);
        Route::post('/{devi}/reject', [DevisController::class, 'reject']);
        Route::post('/{devi}/convert-to-invoice', [DevisController::class, 'convertToInvoice']);
        Route::post('/{devi}/duplicate', [DevisController::class, 'duplicate']);
        Route::post('/{devi}/mark-sent', [DevisController::class, 'markSent']);
    });
    Route::apiResource('devis', DevisController::class);

    // ==========================================
    // ORDRES DE TRAVAIL
    // ==========================================
    Route::prefix('ordres-travail')->group(function () {
        Route::get('/stats', [OrdreTravailController::class, 'stats']);
        Route::get('/pending', [OrdreTravailController::class, 'pending']);
        Route::get('/search', [OrdreTravailController::class, 'search']);
        Route::post('/bulk-delete', [OrdreTravailController::class, 'bulkDelete']);
        Route::get('/{ordreTravail}/pdf', [OrdreTravailController::class, 'generatePdf']);
        Route::post('/{ordreTravail}/validate', [OrdreTravailController::class, 'validate']);
        Route::post('/{ordreTravail}/start', [OrdreTravailController::class, 'start']);
        Route::post('/{ordreTravail}/complete', [OrdreTravailController::class, 'complete']);
        Route::post('/{ordreTravail}/cancel', [OrdreTravailController::class, 'cancel']);
        Route::post('/{ordreTravail}/convert-to-invoice', [OrdreTravailController::class, 'convertToInvoice']);
        Route::get('/{ordreTravail}/lignes', [OrdreTravailController::class, 'lignes']);
        Route::post('/{ordreTravail}/lignes', [OrdreTravailController::class, 'addLigne']);
        Route::put('/{ordreTravail}/lignes/{ligne}', [OrdreTravailController::class, 'updateLigne']);
        Route::delete('/{ordreTravail}/lignes/{ligne}', [OrdreTravailController::class, 'deleteLigne']);
        Route::get('/{ordreTravail}/transports', [OrdreTravailController::class, 'transports']);
        Route::post('/{ordreTravail}/transports', [OrdreTravailController::class, 'addTransport']);
        Route::put('/{ordreTravail}/transports/{transport}', [OrdreTravailController::class, 'updateTransport']);
        Route::delete('/{ordreTravail}/transports/{transport}', [OrdreTravailController::class, 'deleteTransport']);
    });
    Route::apiResource('ordres-travail', OrdreTravailController::class)->parameters([
        'ordres-travail' => 'ordreTravail'
    ]);

    // ==========================================
    // NOTES DE DÉBUT
    // ==========================================
    Route::prefix('notes-debut')->group(function () {
        Route::get('/stats', [NoteDebutController::class, 'stats']);
        Route::get('/by-type/{type}', [NoteDebutController::class, 'byType']);
        Route::get('/search', [NoteDebutController::class, 'search']);
        Route::get('/{noteDebut}/pdf', [NoteDebutController::class, 'generatePdf']);
        Route::post('/{noteDebut}/validate', [NoteDebutController::class, 'validate']);
    });
    Route::apiResource('notes-debut', NoteDebutController::class)->parameters([
        'notes-debut' => 'noteDebut'
    ]);

    // ==========================================
    // CRÉDITS BANCAIRES
    // ==========================================
    Route::prefix('credits')->group(function () {
        Route::get('/stats', [CreditController::class, 'stats']);
        Route::get('/overdue', [CreditController::class, 'overdue']);
        Route::get('/upcoming-payments', [CreditController::class, 'upcomingPayments']);
        Route::get('/{credit}/payments', [CreditController::class, 'payments']);
        Route::post('/{credit}/payments', [CreditController::class, 'recordPayment']);
        Route::get('/{credit}/schedule', [CreditController::class, 'schedule']);
        Route::post('/{credit}/recalculate', [CreditController::class, 'recalculate']);
    });
    Route::apiResource('credits', CreditController::class);

    // ==========================================
    // BANQUES
    // ==========================================
    Route::prefix('banques')->group(function () {
        Route::get('/stats', [BanqueController::class, 'stats']);
        Route::get('/all', [BanqueController::class, 'all']);
        Route::get('/{banque}/balance', [BanqueController::class, 'balance']);
        Route::get('/{banque}/transactions', [BanqueController::class, 'transactions']);
        Route::post('/{banque}/transactions', [BanqueController::class, 'addTransaction']);
        Route::put('/{banque}/transactions/{transaction}', [BanqueController::class, 'updateTransaction']);
        Route::delete('/{banque}/transactions/{transaction}', [BanqueController::class, 'deleteTransaction']);
        Route::post('/{banque}/reconcile', [BanqueController::class, 'reconcile']);
        Route::get('/{banque}/export', [BanqueController::class, 'export']);
        Route::post('/{banque}/import', [BanqueController::class, 'import']);
        Route::get('/{banque}/stats', [BanqueController::class, 'banqueStats']);
        Route::post('/{banque}/set-default', [BanqueController::class, 'setDefault']);
    });
    Route::apiResource('banques', BanqueController::class);

    // ==========================================
    // TRANSACTIONS
    // ==========================================
    Route::prefix('transactions')->group(function () {
        Route::get('/stats', [TransactionController::class, 'stats']);
        Route::get('/categories', [TransactionController::class, 'categories']);
        Route::get('/search', [TransactionController::class, 'search']);
        Route::post('/bulk-reconcile', [TransactionController::class, 'bulkReconcile']);
        Route::post('/reconcile', [TransactionController::class, 'reconcile']);
        Route::post('/unreconcile', [TransactionController::class, 'unreconcile']);
        Route::post('/{transaction}/categorize', [TransactionController::class, 'categorize']);
        Route::post('/{transaction}/cancel', [TransactionController::class, 'cancel']);
    });
    Route::apiResource('transactions', TransactionController::class);

    // ==========================================
    // AVOIRS
    // ==========================================
    Route::prefix('avoirs')->group(function () {
        Route::get('/stats', [AvoirController::class, 'stats']);
        Route::get('/search', [AvoirController::class, 'search']);
        Route::get('/active', [AvoirController::class, 'active']);
        Route::get('/{avoir}/pdf', [AvoirController::class, 'generatePdf']);
        Route::post('/{avoir}/validate', [AvoirController::class, 'validate']);
        Route::post('/{avoir}/compensate', [AvoirController::class, 'compensate']);
        Route::get('/{avoir}/compensations', [AvoirController::class, 'compensations']);
        Route::post('/{avoir}/cancel', [AvoirController::class, 'cancel']);
    });
    Route::apiResource('avoirs', AvoirController::class);

    // ==========================================
    // PARTENAIRES
    // ==========================================
    Route::prefix('partenaires')->group(function () {
        Route::get('/search', [PartenaireController::class, 'search']);
        Route::get('/stats', [PartenaireController::class, 'stats']);
        Route::get('/by-type/{type}', [PartenaireController::class, 'byType']);
        Route::get('/{partenaire}/balance', [PartenaireController::class, 'balance']);
        Route::get('/{partenaire}/transactions', [PartenaireController::class, 'transactions']);
        Route::post('/{partenaire}/transactions', [PartenaireController::class, 'addTransaction']);
        Route::put('/{partenaire}/transactions/{transaction}', [PartenaireController::class, 'updateTransaction']);
        Route::delete('/{partenaire}/transactions/{transaction}', [PartenaireController::class, 'deleteTransaction']);
        Route::post('/{partenaire}/toggle-active', [PartenaireController::class, 'toggleActive']);
    });
    Route::apiResource('partenaires', PartenaireController::class);

    // ==========================================
    // CAISSE
    // ==========================================
    Route::prefix('caisse')->group(function () {
        Route::get('/', [CaisseController::class, 'index']);
        Route::get('/all', [CaisseController::class, 'all']);
        Route::post('/', [CaisseController::class, 'store']);
        Route::get('/{caisse}', [CaisseController::class, 'show']);
        Route::put('/{caisse}', [CaisseController::class, 'update']);
        Route::delete('/{caisse}', [CaisseController::class, 'destroy']);
        Route::get('/{caisse}/mouvements', [CaisseController::class, 'mouvements']);
        Route::post('/{caisse}/encaissement', [CaisseController::class, 'encaissement']);
        Route::post('/{caisse}/decaissement', [CaisseController::class, 'decaissement']);
        Route::post('/mouvements/{mouvement}/cancel', [CaisseController::class, 'cancel']);
        Route::post('/{caisse}/cloture', [CaisseController::class, 'clotureJournaliere']);
        Route::get('/{caisse}/stats', [CaisseController::class, 'stats']);
        Route::get('/{caisse}/daily-report', [CaisseController::class, 'dailyReport']);
    });

    // ==========================================
    // RAPPORTS
    // ==========================================
    Route::prefix('rapports')->group(function () {
        Route::get('/revenue', [RapportController::class, 'revenue']);
        Route::get('/receivables', [RapportController::class, 'receivables']);
        Route::get('/treasury', [RapportController::class, 'treasury']);
        Route::get('/activity', [RapportController::class, 'activity']);
        Route::get('/balance', [RapportController::class, 'balance']);
        Route::get('/profitability', [RapportController::class, 'profitability']);
        Route::get('/export/pdf', [RapportController::class, 'exportPdf']);
        Route::get('/export/excel', [RapportController::class, 'exportExcel']);
    });

    // ==========================================
    // ENTREPRISE
    // ==========================================
    Route::prefix('entreprise')->group(function () {
        Route::get('/', [EntrepriseController::class, 'show']);
        Route::put('/', [EntrepriseController::class, 'update']);
        Route::post('/logo', [EntrepriseController::class, 'updateLogo']);
        Route::delete('/logo', [EntrepriseController::class, 'deleteLogo']);
        Route::get('/taxes', [EntrepriseController::class, 'taxes']);
        Route::put('/taxes', [EntrepriseController::class, 'updateTaxes']);
        Route::get('/numbering', [EntrepriseController::class, 'numbering']);
        Route::put('/numbering', [EntrepriseController::class, 'updateNumbering']);
    });

    // ==========================================
    // UTILISATEURS (Admin only)
    // ==========================================
    Route::middleware('role:admin')->group(function () {
        Route::prefix('users')->group(function () {
            Route::get('/stats', [UserController::class, 'stats']);
            Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
            Route::post('/{user}/reset-password', [UserController::class, 'resetPassword']);
            Route::get('/{user}/permissions', [UserController::class, 'permissions']);
            Route::put('/{user}/permissions', [UserController::class, 'updatePermissions']);
            Route::post('/{user}/assign-role', [UserController::class, 'assignRole']);
            Route::post('/{user}/remove-role', [UserController::class, 'removeRole']);
        });
        Route::apiResource('users', UserController::class);

        // ==========================================
        // RÔLES & PERMISSIONS (Admin only)
        // ==========================================
        Route::prefix('roles')->group(function () {
            Route::get('/all', [RoleController::class, 'all']);
            Route::get('/permissions', [RoleController::class, 'permissions']);
            Route::get('/permissions-by-group', [RoleController::class, 'permissionsByGroup']);
            Route::post('/permissions', [RoleController::class, 'createPermission']);
            Route::delete('/permissions/{permission}', [RoleController::class, 'deletePermission']);
            Route::post('/{role}/sync-permissions', [RoleController::class, 'syncPermissions']);
        });
        Route::apiResource('roles', RoleController::class);
    });

    // ==========================================
    // RECHERCHE GLOBALE
    // ==========================================
    Route::get('/search', function (Request $request) {
        $query = $request->get('q');
        $type = $request->get('type', 'all');
        
        $results = [];
        
        if ($type === 'all' || $type === 'clients') {
            $results['clients'] = \App\Models\Client::where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->limit(5)->get(['id', 'name', 'email']);
        }
        
        if ($type === 'all' || $type === 'invoices') {
            $results['invoices'] = \App\Models\Invoice::where('numero', 'like', "%{$query}%")
                ->orWhere('reference', 'like', "%{$query}%")
                ->limit(5)->get(['id', 'numero', 'total', 'status']);
        }
        
        if ($type === 'all' || $type === 'devis') {
            $results['devis'] = \App\Models\Devis::where('numero', 'like', "%{$query}%")
                ->orWhere('reference', 'like', "%{$query}%")
                ->limit(5)->get(['id', 'numero', 'total', 'status']);
        }
        
        if ($type === 'all' || $type === 'ordres') {
            $results['ordres'] = \App\Models\OrdreTravail::where('numero', 'like', "%{$query}%")
                ->orWhere('reference', 'like', "%{$query}%")
                ->limit(5)->get(['id', 'numero', 'status']);
        }
        
        return response()->json(['success' => true, 'data' => $results]);
    });
});
