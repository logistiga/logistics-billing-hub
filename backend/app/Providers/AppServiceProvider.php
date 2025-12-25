<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ClientService;
use App\Services\InvoiceService;
use App\Services\DevisService;
use App\Services\AvoirService;
use App\Services\OrdreTravailService;
use App\Services\BanqueService;
use App\Services\TransactionService;
use App\Services\CaisseService;
use App\Services\PartenaireService;
use App\Services\CreditService;
use App\Services\NoteDebutService;
use App\Services\PaymentService;
use App\Services\UserService;
use App\Services\RoleService;
use App\Services\EntrepriseService;
use App\Services\DashboardService;
use App\Services\RapportService;
use App\Services\AuthService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register services as singletons
        $this->app->singleton(ClientService::class);
        $this->app->singleton(InvoiceService::class);
        $this->app->singleton(DevisService::class);
        $this->app->singleton(AvoirService::class);
        $this->app->singleton(OrdreTravailService::class);
        $this->app->singleton(BanqueService::class);
        $this->app->singleton(TransactionService::class);
        $this->app->singleton(CaisseService::class);
        $this->app->singleton(PartenaireService::class);
        $this->app->singleton(CreditService::class);
        $this->app->singleton(NoteDebutService::class);
        $this->app->singleton(PaymentService::class);
        $this->app->singleton(UserService::class);
        $this->app->singleton(RoleService::class);
        $this->app->singleton(EntrepriseService::class);
        $this->app->singleton(DashboardService::class);
        $this->app->singleton(RapportService::class);
        $this->app->singleton(AuthService::class);
    }

    public function boot(): void
    {
        //
    }
}
