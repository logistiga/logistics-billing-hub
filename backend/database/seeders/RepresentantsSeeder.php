<?php

namespace Database\Seeders;

use App\Models\Representant;
use Illuminate\Database\Seeder;

class RepresentantsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['compagnie' => 'MR. CHAOUKI', 'nom' => 'MR. CHAOUKI', 'tel' => '+241 65303809', 'email' => 'CHAOUKI@LOGISTIGA.COM', 'adresse' => 'libreville gabon'],
            ['compagnie' => 'JUDE MOUTENDY', 'nom' => 'JUDE MOUTENDY', 'tel' => '0100000', 'email' => 'Jude@logistiga.com', 'adresse' => 'oloumi'],
            ['compagnie' => 'AUCUN', 'nom' => 'AUCUN', 'tel' => '', 'email' => '', 'adresse' => ''],
            ['compagnie' => 'LSG', 'nom' => 'JUNIOR/PRAXED', 'tel' => '', 'email' => '', 'adresse' => ''],
            ['compagnie' => 'ABOU', 'nom' => 'ABOU', 'tel' => '+241 66329007', 'email' => '', 'adresse' => ''],
            ['compagnie' => 'CONDUCTEUR', 'nom' => 'CONDUCTEUR', 'tel' => '', 'email' => '', 'adresse' => ''],
            ['compagnie' => 'PRESTATAIRE', 'nom' => 'PRESTATAIRE', 'tel' => '', 'email' => '', 'adresse' => ''],
            ['compagnie' => 'SIGALLI', 'nom' => 'BOUCHARD', 'tel' => '+241 077570703', 'email' => 'admin@logistiga.com', 'adresse' => 'LIBREVILLE'],
        ];

        foreach ($data as $item) {
            Representant::firstOrCreate(
                ['compagnie' => $item['compagnie'], 'nom' => $item['nom']],
                $item
            );
        }
    }
}
