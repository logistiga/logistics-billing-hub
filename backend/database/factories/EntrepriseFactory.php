<?php

namespace Database\Factories;

use App\Models\Entreprise;
use Illuminate\Database\Eloquent\Factories\Factory;

class EntrepriseFactory extends Factory
{
    protected $model = Entreprise::class;

    public function definition(): array
    {
        return [
            'name' => 'LogistiGa',
            'legal_name' => fake()->company() . ' SARL',
            'legal_form' => fake()->randomElement(['SARL', 'SA', 'SAS', 'EURL', 'SNC']),
            'nif' => fake()->numerify('NIF-########'),
            'nis' => fake()->numerify('NIS-########'),
            'rc' => fake()->numerify('RC-########'),
            'ai' => fake()->optional()->numerify('AI-########'),
            'capital' => fake()->randomFloat(2, 100000, 5000000),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'country' => 'Guinée',
            'phone' => fake()->phoneNumber(),
            'fax' => fake()->optional()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website' => fake()->optional()->domainName(),
            'bank_name' => fake()->company() . ' Bank',
            'bank_account' => fake()->numerify('################'),
            'iban' => fake()->iban('GN'),
            'swift' => fake()->swiftBicNumber(),
            'invoice_prefix' => 'FAC',
            'invoice_footer' => fake()->sentence(),
            'invoice_terms' => fake()->paragraph(),
            'default_payment_terms' => fake()->randomElement([15, 30, 45, 60]),
            'default_tax_rate' => 18.00,
            'currency' => 'GNF',
            'fiscal_year_start' => 1,
        ];
    }
}
