<?php

namespace Database\Seeders;

use App\Models\Entreprise;
use Illuminate\Database\Seeder;

class EntrepriseSeeder extends Seeder
{
    public function run(): void
    {
        Entreprise::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Maritime Services SARL',
                'legal_form' => 'SARL',
                'siret' => '12345678901234',
                'tva_number' => 'FR12345678901',
                'capital' => '1000000',
                'address' => '123 Boulevard Mohammed V',
                'postal_code' => '20000',
                'city' => 'Casablanca',
                'country' => 'Maroc',
                'phone' => '+212 522 000 000',
                'email' => 'contact@maritimeservices.ma',
                'website' => 'https://maritimeservices.ma',
                'logo' => null,
                'iban' => 'MA64 0071 0810 0001 2345 6789 0123',
                'bic' => 'BCMAMAMC',
                'bank_name' => 'Attijariwafa Bank',
                'default_tva_rate' => 20.00,
                'invoice_footer' => 'Merci pour votre confiance. Paiement à réception de facture.',
                'devis_footer' => 'Devis valable 30 jours. Prix HT.',
                'invoice_prefix' => 'FAC',
                'devis_prefix' => 'DEV',
                'avoir_prefix' => 'AV',
                'ordre_prefix' => 'OT',
                'next_invoice_number' => 1,
                'next_devis_number' => 1,
                'next_avoir_number' => 1,
                'next_ordre_number' => 1,
            ]
        );
    }
}
