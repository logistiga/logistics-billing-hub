<?php

namespace App\Providers;

use App\Models\Avoir;
use App\Models\Banque;
use App\Models\Caisse;
use App\Models\Client;
use App\Models\Credit;
use App\Models\Devis;
use App\Models\Entreprise;
use App\Models\Invoice;
use App\Models\NoteDebut;
use App\Models\OrdreTravail;
use App\Models\Partenaire;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use App\Policies\AvoirPolicy;
use App\Policies\BanquePolicy;
use App\Policies\CaissePolicy;
use App\Policies\ClientPolicy;
use App\Policies\CreditPolicy;
use App\Policies\DevisPolicy;
use App\Policies\EntreprisePolicy;
use App\Policies\InvoicePolicy;
use App\Policies\NoteDebutPolicy;
use App\Policies\OrdreTravailPolicy;
use App\Policies\PartenairePolicy;
use App\Policies\RolePolicy;
use App\Policies\TransactionPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Client::class => ClientPolicy::class,
        Invoice::class => InvoicePolicy::class,
        Devis::class => DevisPolicy::class,
        Avoir::class => AvoirPolicy::class,
        OrdreTravail::class => OrdreTravailPolicy::class,
        NoteDebut::class => NoteDebutPolicy::class,
        Credit::class => CreditPolicy::class,
        Banque::class => BanquePolicy::class,
        Transaction::class => TransactionPolicy::class,
        Partenaire::class => PartenairePolicy::class,
        Caisse::class => CaissePolicy::class,
        User::class => UserPolicy::class,
        Role::class => RolePolicy::class,
        Entreprise::class => EntreprisePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates for dashboard access
        Gate::define('view-dashboard', function (User $user) {
            return $user->hasPermission('dashboard.view');
        });

        Gate::define('view-reports', function (User $user) {
            return $user->hasPermission('reports.view');
        });

        Gate::define('generate-reports', function (User $user) {
            return $user->hasPermission('reports.generate');
        });

        Gate::define('export-reports', function (User $user) {
            return $user->hasPermission('reports.export');
        });

        // Super admin bypass
        Gate::before(function (User $user, string $ability) {
            if ($user->hasRole('super-admin')) {
                return true;
            }
            return null;
        });
    }
}
