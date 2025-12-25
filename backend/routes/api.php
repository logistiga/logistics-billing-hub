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
    
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // Clients
    Route::apiResource('clients', ClientController::class);
    Route::get('clients/search', [ClientController::class, 'search']);
    Route::get('clients/{client}/balance', [ClientController::class, 'balance']);
    Route::get('clients/{client}/contacts', [ClientController::class, 'contacts']);
    Route::post('clients/{client}/contacts', [ClientController::class, 'addContact']);
    Route::delete('clients/{client}/contacts/{contact}', [ClientController::class, 'deleteContact']);
    Route::get('clients/export', [ClientController::class, 'export']);

    // Factures
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/stats', [InvoiceController::class, 'stats']);
    Route::get('invoices/overdue', [InvoiceController::class, 'overdue']);
    Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment']);
    Route::post('invoices/group-payment', [InvoiceController::class, 'groupPayment']);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);
    Route::post('invoices/{invoice}/send', [InvoiceController::class, 'sendByEmail']);

    // Ordres de travail
    Route::apiResource('ordres-travail', OrdreTravailController::class);
    Route::get('ordres-travail/stats', [OrdreTravailController::class, 'stats']);
    Route::get('ordres-travail/pending', [OrdreTravailController::class, 'pending']);
    Route::patch('ordres-travail/{ordre}/status', [OrdreTravailController::class, 'updateStatus']);
    Route::post('ordres-travail/{ordre}/containers', [OrdreTravailController::class, 'addContainer']);
    Route::delete('ordres-travail/{ordre}/containers/{container}', [OrdreTravailController::class, 'removeContainer']);
    Route::post('ordres-travail/{ordre}/generate-invoice', [OrdreTravailController::class, 'generateInvoice']);
    Route::get('ordres-travail/{ordre}/pdf', [OrdreTravailController::class, 'downloadPdf']);

    // Crédits bancaires
    Route::apiResource('credits', CreditController::class);
    Route::get('credits/stats', [CreditController::class, 'stats']);
    Route::get('credits/overdue', [CreditController::class, 'overdue']);
    Route::get('credits/upcoming-payments', [CreditController::class, 'upcomingPayments']);
    Route::get('credits/{credit}/payments', [CreditController::class, 'payments']);
    Route::post('credits/{credit}/payments', [CreditController::class, 'recordPayment']);
    Route::get('credits/{credit}/schedule', [CreditController::class, 'schedule']);

    // Notes de début
    Route::apiResource('notes-debut', NoteDebutController::class);
    Route::get('notes-debut/stats', [NoteDebutController::class, 'stats']);
    Route::post('notes-debut/{note}/payments', [NoteDebutController::class, 'recordPayment']);
    Route::post('notes-debut/group-payment', [NoteDebutController::class, 'groupPayment']);
    Route::post('notes-debut/{note}/generate-invoice', [NoteDebutController::class, 'generateInvoice']);

    // Banques
    Route::apiResource('banques', BanqueController::class);
    Route::get('banques/total-balance', [BanqueController::class, 'totalBalance']);
    Route::get('banques/{banque}/transactions', [BanqueController::class, 'transactions']);
    Route::post('banques/{banque}/reconcile', [BanqueController::class, 'reconcile']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);

    // Avoirs
    Route::apiResource('avoirs', AvoirController::class);
    Route::get('avoirs/stats', [AvoirController::class, 'stats']);
    Route::get('avoirs/client/{client}', [AvoirController::class, 'byClient']);
    Route::post('avoirs/{avoir}/apply', [AvoirController::class, 'apply']);
    Route::post('avoirs/{avoir}/cancel', [AvoirController::class, 'cancel']);
    Route::get('avoirs/{avoir}/compensations', [AvoirController::class, 'compensations']);
});
