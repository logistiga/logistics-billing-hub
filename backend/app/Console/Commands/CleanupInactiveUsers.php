<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupInactiveUsers extends Command
{
    protected $signature = 'users:cleanup-inactive 
                            {--days=90 : Days of inactivity threshold}
                            {--dry-run : Show what would be done without actually doing it}';

    protected $description = 'Deactivate users who have not logged in for a specified period';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');

        $this->info("Checking for users inactive for more than {$days} days...");

        $inactiveUsers = User::where('is_active', true)
            ->where(function ($query) use ($days) {
                $query->whereNull('last_login_at')
                    ->where('created_at', '<', now()->subDays($days))
                    ->orWhere('last_login_at', '<', now()->subDays($days));
            })
            ->where('role', '!=', 'admin') // Never deactivate admins
            ->get();

        if ($inactiveUsers->isEmpty()) {
            $this->info('No inactive users found.');
            return Command::SUCCESS;
        }

        $this->warn("Found {$inactiveUsers->count()} inactive user(s):");
        $this->newLine();

        foreach ($inactiveUsers as $user) {
            $lastLogin = $user->last_login_at 
                ? $user->last_login_at->format('d/m/Y') 
                : 'Never';
            
            $this->line("  - {$user->name} ({$user->email}) - Last login: {$lastLogin}");
        }

        if ($dryRun) {
            $this->newLine();
            $this->info('Dry run - no changes made.');
            return Command::SUCCESS;
        }

        if (!$this->confirm('Do you want to deactivate these users?')) {
            $this->info('Operation cancelled.');
            return Command::SUCCESS;
        }

        $count = User::whereIn('id', $inactiveUsers->pluck('id'))
            ->update(['is_active' => false]);

        $this->newLine();
        $this->info("{$count} user(s) have been deactivated.");

        return Command::SUCCESS;
    }
}
