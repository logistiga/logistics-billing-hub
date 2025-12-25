<?php

namespace Database\Seeders;

use App\Models\Partenaire;
use Illuminate\Database\Seeder;

class PartenairesSeeder extends Seeder
{
    public function run(): void
    {
        $partenaires = [
            [
                'code' => 'PAR-001',
                'name' => 'Trans Maghreb SARL',
                'type' => 'transporteur',
                'email' => 'contact@transmaghreb.ma',
                'phone' => '+212 522 111 222',
                'address' => '45 Zone Industrielle Ain Sebaa',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '001122334455667',
                'rc' => 'RC-11111',
                'bank_name' => 'Attijariwafa Bank',
                'bank_account' => '007 810 0001111222233344 55',
                'commission_rate' => 5.00,
                'balance' => 25000.00,
                'is_active' => true,
            ],
            [
                'code' => 'PAR-002',
                'name' => 'Douane Express',
                'type' => 'transitaire',
                'email' => 'info@douaneexpress.ma',
                'phone' => '+212 522 222 333',
                'address' => '12 Rue du Port',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '002233445566778',
                'rc' => 'RC-22222',
                'bank_name' => 'BMCE Bank',
                'bank_account' => '011 780 0002222333344455 66',
                'commission_rate' => 3.50,
                'balance' => 15000.00,
                'is_active' => true,
            ],
            [
                'code' => 'PAR-003',
                'name' => 'Morocco Freight Forwarding',
                'type' => 'agent',
                'email' => 'contact@moroccofreight.ma',
                'phone' => '+212 522 333 444',
                'address' => '78 Avenue des FAR',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '003344556677889',
                'rc' => 'RC-33333',
                'bank_name' => 'Banque Populaire',
                'bank_account' => '101 150 0003333444455566 77',
                'commission_rate' => 4.00,
                'balance' => 50000.00,
                'is_active' => true,
            ],
            [
                'code' => 'PAR-004',
                'name' => 'Assurance Maritime Plus',
                'type' => 'assureur',
                'email' => 'info@assurancemaritime.ma',
                'phone' => '+212 522 444 555',
                'address' => '23 Boulevard Zerktouni',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '004455667788990',
                'rc' => 'RC-44444',
                'bank_name' => 'CIH Bank',
                'bank_account' => '230 810 0004444555566677 88',
                'commission_rate' => 2.00,
                'balance' => 0.00,
                'is_active' => true,
            ],
            [
                'code' => 'PAR-005',
                'name' => 'Port Services International',
                'type' => 'manutentionnaire',
                'email' => 'contact@portservices.ma',
                'phone' => '+212 522 555 666',
                'address' => 'Zone Portuaire Est',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '005566778899001',
                'rc' => 'RC-55555',
                'bank_name' => 'Attijariwafa Bank',
                'bank_account' => '007 810 0005555666677788 99',
                'commission_rate' => 0.00,
                'balance' => 35000.00,
                'is_active' => true,
            ],
            [
                'code' => 'PAR-006',
                'name' => 'Conteneurs Maroc SA',
                'type' => 'fournisseur',
                'email' => 'info@conteneursmaroc.ma',
                'phone' => '+212 522 666 777',
                'address' => '90 Zone Franche',
                'city' => 'Tanger',
                'country' => 'Maroc',
                'ice' => '006677889900112',
                'rc' => 'RC-66666',
                'bank_name' => 'BMCE Bank',
                'bank_account' => '011 780 0006666777788899 00',
                'commission_rate' => 0.00,
                'balance' => -20000.00,
                'is_active' => true,
            ],
        ];

        foreach ($partenaires as $partenaireData) {
            Partenaire::firstOrCreate(
                ['code' => $partenaireData['code']],
                $partenaireData
            );
        }
    }
}
