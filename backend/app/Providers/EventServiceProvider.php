<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

// Events
use App\Events\InvoiceCreated;
use App\Events\InvoiceSent;
use App\Events\InvoicePaid;
use App\Events\InvoiceOverdue;
use App\Events\PaymentReceived;
use App\Events\DevisCreated;
use App\Events\DevisAccepted;
use App\Events\DevisRejected;
use App\Events\DevisExpired;
use App\Events\OrdreTravailCreated;
use App\Events\OrdreTravailValidated;
use App\Events\OrdreTravailCompleted;
use App\Events\CreditPaymentDue;
use App\Events\CreditPaymentOverdue;
use App\Events\AvoirCreated;
use App\Events\LowCashBalance;
use App\Events\LowBankBalance;
use App\Events\UserCreated;
use App\Events\ClientCreated;

// Listeners
use App\Listeners\SendInvoiceCreatedNotification;
use App\Listeners\SendInvoiceSentNotification;
use App\Listeners\SendInvoicePaidNotification;
use App\Listeners\SendInvoiceOverdueNotification;
use App\Listeners\SendPaymentReceivedNotification;
use App\Listeners\SendDevisCreatedNotification;
use App\Listeners\SendDevisAcceptedNotification;
use App\Listeners\SendDevisRejectedNotification;
use App\Listeners\SendDevisExpiredNotification;
use App\Listeners\SendOrdreTravailCreatedNotification;
use App\Listeners\SendOrdreTravailValidatedNotification;
use App\Listeners\SendOrdreTravailCompletedNotification;
use App\Listeners\SendCreditPaymentDueNotification;
use App\Listeners\SendCreditPaymentOverdueNotification;
use App\Listeners\SendAvoirCreatedNotification;
use App\Listeners\SendLowBalanceNotification;
use App\Listeners\SendUserCreatedNotification;
use App\Listeners\LogClientCreated;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Auth events
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // Invoice events
        InvoiceCreated::class => [
            SendInvoiceCreatedNotification::class,
        ],
        InvoiceSent::class => [
            SendInvoiceSentNotification::class,
        ],
        InvoicePaid::class => [
            SendInvoicePaidNotification::class,
        ],
        InvoiceOverdue::class => [
            SendInvoiceOverdueNotification::class,
        ],

        // Payment events
        PaymentReceived::class => [
            SendPaymentReceivedNotification::class,
        ],

        // Devis events
        DevisCreated::class => [
            SendDevisCreatedNotification::class,
        ],
        DevisAccepted::class => [
            SendDevisAcceptedNotification::class,
        ],
        DevisRejected::class => [
            SendDevisRejectedNotification::class,
        ],
        DevisExpired::class => [
            SendDevisExpiredNotification::class,
        ],

        // Ordre de travail events
        OrdreTravailCreated::class => [
            SendOrdreTravailCreatedNotification::class,
        ],
        OrdreTravailValidated::class => [
            SendOrdreTravailValidatedNotification::class,
        ],
        OrdreTravailCompleted::class => [
            SendOrdreTravailCompletedNotification::class,
        ],

        // Credit events
        CreditPaymentDue::class => [
            SendCreditPaymentDueNotification::class,
        ],
        CreditPaymentOverdue::class => [
            SendCreditPaymentOverdueNotification::class,
        ],

        // Avoir events
        AvoirCreated::class => [
            SendAvoirCreatedNotification::class,
        ],

        // Balance alerts
        LowCashBalance::class => [
            [SendLowBalanceNotification::class, 'handleCash'],
        ],
        LowBankBalance::class => [
            [SendLowBalanceNotification::class, 'handleBank'],
        ],

        // User events
        UserCreated::class => [
            SendUserCreatedNotification::class,
        ],

        // Client events
        ClientCreated::class => [
            LogClientCreated::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
