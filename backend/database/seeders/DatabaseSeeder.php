<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Core seeders - run first
            RolesAndPermissionsSeeder::class,
            UsersSeeder::class,
            EntrepriseSeeder::class,

            // Reference data
            BanquesSeeder::class,
            CaissesSeeder::class,
            PartenairesSeeder::class,
            CompagniesMaritimesSeeder::class,
            TransitairesSeeder::class,
            RepresentantsSeeder::class,

            // Business data
            ClientsSeeder::class,
        ]);

        $this->command->info('Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('Test Users Created:');
        $this->command->info('-------------------');
        $this->command->info('Super Admin: superadmin@example.com / password');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Manager: manager@example.com / password');
        $this->command->info('Comptable: comptable@example.com / password');
        $this->command->info('Commercial: commercial@example.com / password');
        $this->command->info('Opérateur: operateur@example.com / password');
    }
}
