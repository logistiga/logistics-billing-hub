<?php

namespace Database\Seeders;

use App\Models\Caisse;
use Illuminate\Database\Seeder;

class CaissesSeeder extends Seeder
{
    public function run(): void
    {
        $caisses = [
            [
                'name' => 'Caisse Principale',
                'code' => 'CAI-001',
                'currency' => 'MAD',
                'initial_balance' => 50000.00,
                'current_balance' => 75000.00,
                'max_balance' => 100000.00,
                'is_default' => true,
                'is_active' => true,
                'location' => 'Siège - Casablanca',
            ],
            [
                'name' => 'Caisse Secondaire',
                'code' => 'CAI-002',
                'currency' => 'MAD',
                'initial_balance' => 10000.00,
                'current_balance' => 25000.00,
                'max_balance' => 50000.00,
                'is_default' => false,
                'is_active' => true,
                'location' => 'Bureau Tanger',
            ],
            [
                'name' => 'Petite Caisse',
                'code' => 'CAI-003',
                'currency' => 'MAD',
                'initial_balance' => 5000.00,
                'current_balance' => 3500.00,
                'max_balance' => 10000.00,
                'is_default' => false,
                'is_active' => true,
                'location' => 'Réception',
            ],
        ];

        foreach ($caisses as $caisseData) {
            Caisse::firstOrCreate(
                ['code' => $caisseData['code']],
                $caisseData
            );
        }
    }
}
