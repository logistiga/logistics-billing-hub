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
                'email' => 'contact@maritimeservices.ma',
                'phone' => '+212 522 000 000',
                'fax' => '+212 522 000 001',
                'address' => '123 Boulevard Mohammed V',
                'city' => 'Casablanca',
                'postal_code' => '20000',
                'country' => 'Maroc',
                'ice' => '001234567890123',
                'rc' => 'RC-CAS-12345',
                'if' => '12345678',
                'cnss' => 'CNSS-1234567',
                'patent' => 'PAT-12345678',
                'capital' => 1000000,
                'bank_name' => 'Attijariwafa Bank',
                'bank_account' => '007 810 0001234567890123 45',
                'bank_rib' => '007 810 0001234567890123 45',
                'bank_swift' => 'BCMAMAMC',
                'logo' => null,
                'signature' => null,
                'stamp' => null,
                'invoice_prefix' => 'FAC',
                'devis_prefix' => 'DEV',
                'avoir_prefix' => 'AVO',
                'ordre_prefix' => 'OT',
                'note_prefix' => 'ND',
                'invoice_footer' => 'Merci pour votre confiance. Paiement à réception de facture.',
                'devis_footer' => 'Devis valable 30 jours. Prix HT.',
                'tva_rate' => 20.00,
                'currency' => 'MAD',
                'fiscal_year_start' => 1,
                'settings' => json_encode([
                    'auto_invoice_number' => true,
                    'send_invoice_email' => true,
                    'payment_reminder_days' => [7, 14, 30],
                    'default_payment_terms' => 30,
                ]),
            ]
        );
    }
}
