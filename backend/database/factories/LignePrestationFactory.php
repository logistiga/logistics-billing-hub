<?php

namespace Database\Factories;

use App\Models\LignePrestation;
use App\Models\OrdreTravail;
use Illuminate\Database\Eloquent\Factories\Factory;

class LignePrestationFactory extends Factory
{
    protected $model = LignePrestation::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 10);
        $unitPrice = fake()->randomFloat(2, 50, 2000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $amount = $quantity * $unitPrice;

        return [
            'ordre_travail_id' => OrdreTravail::factory(),
            'designation' => fake()->randomElement([
                'Manutention conteneur',
                'Dédouanement',
                'Frais de port',
                'Transit',
                'Magasinage',
                'Transport routier',
                'Assurance marchandise',
                'Frais administratifs',
            ]),
            'description' => fake()->optional()->sentence(),
            'quantity' => $quantity,
            'unit' => fake()->randomElement(['unité', 'tonne', 'conteneur', 'jour', 'forfait']),
            'unit_price' => $unitPrice,
            'tax_rate' => $taxRate,
            'amount' => $amount,
        ];
    }
}
