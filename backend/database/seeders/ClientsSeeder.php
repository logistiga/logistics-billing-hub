<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\ClientContact;
use Illuminate\Database\Seeder;

class ClientsSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'code' => 'CLI-001',
                'name' => 'SARL Maroc Transport',
                'type' => 'company',
                'email' => 'contact@maroctransport.ma',
                'phone' => '+212 522 123 456',
                'address' => '123 Avenue Hassan II',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '001234567000089',
                'rc' => 'RC-12345',
                'if' => '12345678',
                'cnss' => 'CNSS-123456',
                'payment_terms' => 30,
                'credit_limit' => 500000,
                'contacts' => [
                    ['name' => 'Mohamed Alami', 'position' => 'Directeur', 'email' => 'alami@maroctransport.ma', 'phone' => '+212 661 123 456', 'is_primary' => true],
                    ['name' => 'Rachid Bennani', 'position' => 'Comptable', 'email' => 'bennani@maroctransport.ma', 'phone' => '+212 662 234 567', 'is_primary' => false],
                ],
            ],
            [
                'code' => 'CLI-002',
                'name' => 'Atlas Shipping SA',
                'type' => 'company',
                'email' => 'info@atlasshipping.ma',
                'phone' => '+212 522 234 567',
                'address' => '45 Boulevard Zerktouni',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '002345678000090',
                'rc' => 'RC-23456',
                'if' => '23456789',
                'cnss' => 'CNSS-234567',
                'payment_terms' => 45,
                'credit_limit' => 750000,
                'contacts' => [
                    ['name' => 'Karim El Fassi', 'position' => 'Gérant', 'email' => 'elfassi@atlasshipping.ma', 'phone' => '+212 663 345 678', 'is_primary' => true],
                ],
            ],
            [
                'code' => 'CLI-003',
                'name' => 'Global Logistics SARL',
                'type' => 'company',
                'email' => 'contact@globallogistics.ma',
                'phone' => '+212 537 345 678',
                'address' => '78 Rue Mohammed V',
                'city' => 'Rabat',
                'country' => 'Maroc',
                'ice' => '003456789000091',
                'rc' => 'RC-34567',
                'if' => '34567890',
                'cnss' => 'CNSS-345678',
                'payment_terms' => 30,
                'credit_limit' => 300000,
                'contacts' => [
                    ['name' => 'Amina Tazi', 'position' => 'Responsable Commercial', 'email' => 'tazi@globallogistics.ma', 'phone' => '+212 664 456 789', 'is_primary' => true],
                ],
            ],
            [
                'code' => 'CLI-004',
                'name' => 'Maghreb Freight Services',
                'type' => 'company',
                'email' => 'info@maghrebfreight.ma',
                'phone' => '+212 539 456 789',
                'address' => '12 Zone Industrielle',
                'city' => 'Tanger',
                'country' => 'Maroc',
                'ice' => '004567890000092',
                'rc' => 'RC-45678',
                'if' => '45678901',
                'cnss' => 'CNSS-456789',
                'payment_terms' => 60,
                'credit_limit' => 1000000,
                'contacts' => [
                    ['name' => 'Hassan Berrada', 'position' => 'PDG', 'email' => 'berrada@maghrebfreight.ma', 'phone' => '+212 665 567 890', 'is_primary' => true],
                    ['name' => 'Nadia Chraibi', 'position' => 'DAF', 'email' => 'chraibi@maghrebfreight.ma', 'phone' => '+212 666 678 901', 'is_primary' => false],
                ],
            ],
            [
                'code' => 'CLI-005',
                'name' => 'Omar El Mansouri',
                'type' => 'individual',
                'email' => 'omar.elmansouri@gmail.com',
                'phone' => '+212 667 789 012',
                'address' => '34 Rue des Orangers',
                'city' => 'Marrakech',
                'country' => 'Maroc',
                'ice' => null,
                'rc' => null,
                'if' => null,
                'cnss' => null,
                'payment_terms' => 0,
                'credit_limit' => 50000,
                'contacts' => [],
            ],
            [
                'code' => 'CLI-006',
                'name' => 'Mediterranean Trade Co',
                'type' => 'company',
                'email' => 'contact@medtrade.ma',
                'phone' => '+212 522 567 890',
                'address' => '89 Avenue FAR',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '005678901000093',
                'rc' => 'RC-56789',
                'if' => '56789012',
                'cnss' => 'CNSS-567890',
                'payment_terms' => 30,
                'credit_limit' => 600000,
                'contacts' => [
                    ['name' => 'Youssef Lahlou', 'position' => 'Directeur Commercial', 'email' => 'lahlou@medtrade.ma', 'phone' => '+212 668 890 123', 'is_primary' => true],
                ],
            ],
            [
                'code' => 'CLI-007',
                'name' => 'Atlantic Cargo SARL',
                'type' => 'company',
                'email' => 'info@atlanticcargo.ma',
                'phone' => '+212 523 678 901',
                'address' => '56 Zone Portuaire',
                'city' => 'Agadir',
                'country' => 'Maroc',
                'ice' => '006789012000094',
                'rc' => 'RC-67890',
                'if' => '67890123',
                'cnss' => 'CNSS-678901',
                'payment_terms' => 45,
                'credit_limit' => 400000,
                'contacts' => [
                    ['name' => 'Mehdi Bouazza', 'position' => 'Gérant', 'email' => 'bouazza@atlanticcargo.ma', 'phone' => '+212 669 901 234', 'is_primary' => true],
                ],
            ],
            [
                'code' => 'CLI-008',
                'name' => 'Royal Shipping International',
                'type' => 'company',
                'email' => 'contact@royalshipping.ma',
                'phone' => '+212 522 789 012',
                'address' => '123 Port de Casablanca',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '007890123000095',
                'rc' => 'RC-78901',
                'if' => '78901234',
                'cnss' => 'CNSS-789012',
                'payment_terms' => 30,
                'credit_limit' => 2000000,
                'contacts' => [
                    ['name' => 'Fatima Benjelloun', 'position' => 'DG', 'email' => 'benjelloun@royalshipping.ma', 'phone' => '+212 670 012 345', 'is_primary' => true],
                    ['name' => 'Samir Kettani', 'position' => 'Responsable Opérations', 'email' => 'kettani@royalshipping.ma', 'phone' => '+212 671 123 456', 'is_primary' => false],
                    ['name' => 'Leila Sqalli', 'position' => 'Comptable', 'email' => 'sqalli@royalshipping.ma', 'phone' => '+212 672 234 567', 'is_primary' => false],
                ],
            ],
            [
                'code' => 'CLI-009',
                'name' => 'North Africa Logistics',
                'type' => 'company',
                'email' => 'info@nalogistics.ma',
                'phone' => '+212 536 890 123',
                'address' => '67 Zone Franche',
                'city' => 'Fès',
                'country' => 'Maroc',
                'ice' => '008901234000096',
                'rc' => 'RC-89012',
                'if' => '89012345',
                'cnss' => 'CNSS-890123',
                'payment_terms' => 30,
                'credit_limit' => 350000,
                'contacts' => [
                    ['name' => 'Ahmed Filali', 'position' => 'Directeur', 'email' => 'filali@nalogistics.ma', 'phone' => '+212 673 345 678', 'is_primary' => true],
                ],
            ],
            [
                'code' => 'CLI-010',
                'name' => 'Express Maritime Services',
                'type' => 'company',
                'email' => 'contact@expressmaritime.ma',
                'phone' => '+212 522 901 234',
                'address' => '45 Boulevard Bir Anzarane',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'ice' => '009012345000097',
                'rc' => 'RC-90123',
                'if' => '90123456',
                'cnss' => 'CNSS-901234',
                'payment_terms' => 45,
                'credit_limit' => 800000,
                'contacts' => [
                    ['name' => 'Rachida Mouline', 'position' => 'PDG', 'email' => 'mouline@expressmaritime.ma', 'phone' => '+212 674 456 789', 'is_primary' => true],
                ],
            ],
        ];

        foreach ($clients as $clientData) {
            $contacts = $clientData['contacts'];
            unset($clientData['contacts']);

            $client = Client::firstOrCreate(
                ['code' => $clientData['code']],
                array_merge($clientData, [
                    'is_active' => true,
                    'balance' => rand(0, 100000),
                ])
            );

            foreach ($contacts as $contactData) {
                ClientContact::firstOrCreate(
                    ['client_id' => $client->id, 'email' => $contactData['email']],
                    $contactData
                );
            }
        }
    }
}
