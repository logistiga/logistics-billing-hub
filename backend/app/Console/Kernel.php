<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Daily tasks - Run every day at 8:00 AM
        $schedule->command('invoices:update-statuses')
            ->dailyAt('08:00')
            ->description('Update invoice statuses based on payments and due dates');

        $schedule->command('devis:check-expired --notify')
            ->dailyAt('08:00')
            ->description('Check and mark expired devis');

        $schedule->command('credits:check-payments --days-before=7 --update-status')
            ->dailyAt('08:00')
            ->description('Check credit payment schedules');

        // Payment reminders - Run every weekday at 9:00 AM
        $schedule->command('invoices:send-reminders --days=7')
            ->weekdays()
            ->at('09:00')
            ->description('Send payment reminders for invoices due within 7 days');

        $schedule->command('invoices:send-reminders --overdue')
            ->weekdays()
            ->at('09:00')
            ->description('Send reminders for overdue invoices');

        // Balance checks - Run twice daily
        $schedule->command('treasury:check-balances')
            ->twiceDaily(9, 17)
            ->description('Check for low bank and cash balances');

        // Bank balance recalculation - Run weekly on Sunday at midnight
        $schedule->command('banks:recalculate-balances')
            ->weekly()
            ->sundays()
            ->at('00:00')
            ->description('Recalculate all bank balances');

        // Daily report - Run every day at 7:00 AM (for previous day)
        $schedule->command('reports:daily')
            ->dailyAt('07:00')
            ->description('Generate daily activity report');

        // Monthly stats - Run on the 1st of each month at 8:00 AM
        $schedule->command('reports:monthly-stats --month=' . now()->subMonth()->month)
            ->monthlyOn(1, '08:00')
            ->description('Generate monthly statistics report');

        // Cleanup old drafts - Run weekly on Sunday at 2:00 AM
        $schedule->command('cleanup:old-drafts --days=30')
            ->weekly()
            ->sundays()
            ->at('02:00')
            ->description('Clean up old draft documents');

        // Database pruning/maintenance
        $schedule->command('model:prune')
            ->daily()
            ->description('Prune stale model records');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
