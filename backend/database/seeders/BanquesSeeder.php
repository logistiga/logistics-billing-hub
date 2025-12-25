<?php

namespace Database\Seeders;

use App\Models\Banque;
use Illuminate\Database\Seeder;

class BanquesSeeder extends Seeder
{
    public function run(): void
    {
        $banques = [
            [
                'name' => 'Attijariwafa Bank - Compte Principal',
                'code' => 'AWB-001',
                'account_number' => '007 810 0001234567890123 45',
                'rib' => '007 810 0001234567890123 45',
                'swift' => 'BCMAMAMC',
                'iban' => 'MA64007810000123456789012345',
                'currency' => 'MAD',
                'initial_balance' => 500000.00,
                'current_balance' => 750000.00,
                'is_default' => true,
                'is_active' => true,
            ],
            [
                'name' => 'BMCE Bank - Compte Secondaire',
                'code' => 'BMCE-001',
                'account_number' => '011 780 0009876543210987 65',
                'rib' => '011 780 0009876543210987 65',
                'swift' => 'BMCEMAMC',
                'iban' => 'MA64011780000987654321098765',
                'currency' => 'MAD',
                'initial_balance' => 200000.00,
                'current_balance' => 350000.00,
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Banque Populaire - Compte Épargne',
                'code' => 'BP-001',
                'account_number' => '101 150 0001122334455667 89',
                'rib' => '101 150 0001122334455667 89',
                'swift' => 'BCPOMAMC',
                'iban' => 'MA64101150000112233445566789',
                'currency' => 'MAD',
                'initial_balance' => 1000000.00,
                'current_balance' => 1200000.00,
                'is_default' => false,
                'is_active' => true,
            ],
            [
                'name' => 'CIH Bank - Compte EUR',
                'code' => 'CIH-EUR',
                'account_number' => '230 810 0005566778899001 23',
                'rib' => '230 810 0005566778899001 23',
                'swift' => 'CIABORMC',
                'iban' => 'MA64230810000556677889900123',
                'currency' => 'EUR',
                'initial_balance' => 50000.00,
                'current_balance' => 75000.00,
                'is_default' => false,
                'is_active' => true,
            ],
        ];

        foreach ($banques as $banqueData) {
            Banque::firstOrCreate(
                ['code' => $banqueData['code']],
                $banqueData
            );
        }
    }
}
