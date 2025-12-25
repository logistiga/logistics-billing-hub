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

// Routes publiques (authentification)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Routes protégées (nécessitent authentification)
Route::middleware('auth:sanctum')->group(function () {
    
    // ==========================================
    // AUTH
    // ==========================================
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // ==========================================
    // DASHBOARD
    // ==========================================
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/revenue-chart', [DashboardController::class, 'revenueChart']);
        Route::get('/top-clients', [DashboardController::class, 'topClients']);
        Route::get('/overdue-invoices', [DashboardController::class, 'overdueInvoices']);
        Route::get('/recent-activity', [DashboardController::class, 'recentActivity']);
        Route::get('/cash-flow-forecast', [DashboardController::class, 'cashFlowForecast']);
    });

    // ==========================================
    // CLIENTS
    // ==========================================
    Route::prefix('clients')->group(function () {
        Route::get('/search', [ClientController::class, 'search']);
        Route::get('/export', [ClientController::class, 'export']);
        Route::get('/{client}/balance', [ClientController::class, 'balance']);
        Route::get('/{client}/contacts', [ClientController::class, 'contacts']);
        Route::post('/{client}/contacts', [ClientController::class, 'addContact']);
        Route::delete('/{client}/contacts/{contact}', [ClientController::class, 'deleteContact']);
    });
    Route::apiResource('clients', ClientController::class);

    // ==========================================
    // FACTURES
    // ==========================================
    Route::prefix('invoices')->group(function () {
        Route::get('/stats', [InvoiceController::class, 'stats']);
        Route::get('/overdue', [InvoiceController::class, 'overdue']);
        Route::get('/export', [InvoiceController::class, 'export']);
        Route::post('/group-payment', [InvoiceController::class, 'groupPayment']);
        Route::get('/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);
        Route::post('/{invoice}/send', [InvoiceController::class, 'sendByEmail']);
        Route::post('/{invoice}/payments', [InvoiceController::class, 'recordPayment']);
        Route::get('/{invoice}/payments', [InvoiceController::class, 'payments']);
        Route::post('/{invoice}/duplicate', [InvoiceController::class, 'duplicate']);
        Route::post('/{invoice}/validate', [InvoiceController::class, 'validateInvoice']);
        Route::post('/{invoice}/cancel', [InvoiceController::class, 'cancel']);
    });
    Route::apiResource('invoices', InvoiceController::class);

    // ==========================================
    // DEVIS
    // ==========================================
    Route::prefix('devis')->group(function () {
        Route::get('/stats', [DevisController::class, 'stats']);
        Route::get('/{devi}/pdf', [DevisController::class, 'generatePdf']);
        Route::post('/{devi}/send', [DevisController::class, 'send']);
        Route::post('/{devi}/accept', [DevisController::class, 'accept']);
        Route::post('/{devi}/reject', [DevisController::class, 'reject']);
        Route::post('/{devi}/convert-to-invoice', [DevisController::class, 'convertToInvoice']);
        Route::post('/{devi}/duplicate', [DevisController::class, 'duplicate']);
    });
    Route::apiResource('devis', DevisController::class);

    // ==========================================
    // ORDRES DE TRAVAIL
    // ==========================================
    Route::prefix('ordres-travail')->group(function () {
        Route::get('/stats', [OrdreTravailController::class, 'stats']);
        Route::get('/pending', [OrdreTravailController::class, 'pending']);
        Route::get('/{ordreTravail}/pdf', [OrdreTravailController::class, 'generatePdf']);
        Route::post('/{ordreTravail}/validate', [OrdreTravailController::class, 'validate']);
        Route::post('/{ordreTravail}/convert-to-invoice', [OrdreTravailController::class, 'convertToInvoice']);
    });
    Route::apiResource('ordres-travail', OrdreTravailController::class)->parameters([
        'ordres-travail' => 'ordreTravail'
    ]);

    // ==========================================
    // NOTES DE DÉBUT
    // ==========================================
    Route::prefix('notes-debut')->group(function () {
        Route::get('/stats', [NoteDebutController::class, 'stats']);
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
    });
    Route::apiResource('credits', CreditController::class);

    // ==========================================
    // BANQUES
    // ==========================================
    Route::prefix('banques')->group(function () {
        Route::get('/stats', [BanqueController::class, 'stats']);
        Route::get('/{banque}/balance', [BanqueController::class, 'balance']);
        Route::get('/{banque}/transactions', [BanqueController::class, 'transactions']);
        Route::post('/{banque}/transactions', [BanqueController::class, 'addTransaction']);
        Route::put('/{banque}/transactions/{transaction}', [BanqueController::class, 'updateTransaction']);
        Route::delete('/{banque}/transactions/{transaction}', [BanqueController::class, 'deleteTransaction']);
        Route::post('/{banque}/reconcile', [BanqueController::class, 'reconcile']);
        Route::get('/{banque}/export', [BanqueController::class, 'export']);
    });
    Route::apiResource('banques', BanqueController::class);

    // ==========================================
    // TRANSACTIONS
    // ==========================================
    Route::prefix('transactions')->group(function () {
        Route::get('/stats', [TransactionController::class, 'stats']);
        Route::get('/categories', [TransactionController::class, 'categories']);
        Route::post('/reconcile', [TransactionController::class, 'reconcile']);
        Route::post('/unreconcile', [TransactionController::class, 'unreconcile']);
    });
    Route::apiResource('transactions', TransactionController::class);

    // ==========================================
    // AVOIRS
    // ==========================================
    Route::prefix('avoirs')->group(function () {
        Route::get('/stats', [AvoirController::class, 'stats']);
        Route::get('/{avoir}/pdf', [AvoirController::class, 'generatePdf']);
        Route::post('/{avoir}/validate', [AvoirController::class, 'validate']);
        Route::post('/{avoir}/compensate', [AvoirController::class, 'compensate']);
        Route::get('/{avoir}/compensations', [AvoirController::class, 'compensations']);
    });
    Route::apiResource('avoirs', AvoirController::class);

    // ==========================================
    // PARTENAIRES
    // ==========================================
    Route::prefix('partenaires')->group(function () {
        Route::get('/search', [PartenaireController::class, 'search']);
        Route::get('/stats', [PartenaireController::class, 'stats']);
        Route::get('/{partenaire}/balance', [PartenaireController::class, 'balance']);
    });
    Route::apiResource('partenaires', PartenaireController::class);

    // ==========================================
    // CAISSE
    // ==========================================
    Route::prefix('caisse')->group(function () {
        Route::get('/', [CaisseController::class, 'index']);
        Route::get('/mouvements', [CaisseController::class, 'mouvements']);
        Route::post('/encaissement', [CaisseController::class, 'encaissement']);
        Route::post('/decaissement', [CaisseController::class, 'decaissement']);
        Route::post('/mouvements/{mouvement}/cancel', [CaisseController::class, 'cancel']);
        Route::post('/cloture', [CaisseController::class, 'clotureJournaliere']);
        Route::get('/stats', [CaisseController::class, 'stats']);
    });

    // ==========================================
    // RAPPORTS
    // ==========================================
    Route::prefix('rapports')->group(function () {
        Route::get('/revenue', [RapportController::class, 'revenue']);
        Route::get('/receivables', [RapportController::class, 'receivables']);
        Route::get('/treasury', [RapportController::class, 'treasury']);
        Route::get('/activity', [RapportController::class, 'activity']);
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
    });

    // ==========================================
    // UTILISATEURS
    // ==========================================
    Route::prefix('users')->group(function () {
        Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::get('/{user}/permissions', [UserController::class, 'permissions']);
        Route::put('/{user}/permissions', [UserController::class, 'updatePermissions']);
    });
    Route::apiResource('users', UserController::class);

    // ==========================================
    // RÔLES & PERMISSIONS
    // ==========================================
    Route::prefix('roles')->group(function () {
        Route::get('/permissions', [RoleController::class, 'permissions']);
        Route::post('/permissions', [RoleController::class, 'createPermission']);
        Route::delete('/permissions/{permission}', [RoleController::class, 'deletePermission']);
    });
    Route::apiResource('roles', RoleController::class);
});
