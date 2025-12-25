<?php

namespace Database\Seeders;

use App\Models\CompagnieMaritime;
use Illuminate\Database\Seeder;

class CompagniesMaritimesSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nom' => 'MSC', 'num_tc' => '40', 'prix' => 1200, 'jours' => 14],
            ['nom' => 'MSC', 'num_tc' => '20', 'prix' => 1200, 'jours' => 14],
            ['nom' => 'MSC', 'num_tc' => 'Frigo', 'prix' => 1200, 'jours' => 14],
            ['nom' => 'TSR', 'num_tc' => '20', 'prix' => 18500, 'jours' => 7],
            ['nom' => 'TSR', 'num_tc' => '40', 'prix' => 18500, 'jours' => 7],
            ['nom' => 'CMA CGM', 'num_tc' => '20', 'prix' => 7500, 'jours' => 3],
            ['nom' => 'CMA CGM', 'num_tc' => 'FRIGO 20', 'prix' => 17500, 'jours' => 3],
            ['nom' => 'CMA-CGM', 'num_tc' => '40', 'prix' => 17200, 'jours' => 3],
            ['nom' => 'MAERSK', 'num_tc' => '20', 'prix' => 11800, 'jours' => 7],
            ['nom' => 'MAERSK', 'num_tc' => '40', 'prix' => 23600, 'jours' => 7],
            ['nom' => 'MAERSK FRIGO', 'num_tc' => '20', 'prix' => 5900, 'jours' => 3],
            ['nom' => 'MAERSK FRIGO', 'num_tc' => '40', 'prix' => 118000, 'jours' => 3],
            ['nom' => 'HAPAG-LLOYD', 'num_tc' => '20', 'prix' => 0, 'jours' => 0],
            ['nom' => 'HAPAG-LLOYD', 'num_tc' => '40', 'prix' => 0, 'jours' => 0],
            ['nom' => 'AUCUN', 'num_tc' => 'AUCUN', 'prix' => 0, 'jours' => 0],
        ];

        foreach ($data as $item) {
            CompagnieMaritime::firstOrCreate(
                ['nom' => $item['nom'], 'num_tc' => $item['num_tc']],
                $item
            );
        }
    }
}
