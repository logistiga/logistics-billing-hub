<?php

namespace Database\Factories;

use App\Models\Devis;
use App\Models\DevisItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class DevisItemFactory extends Factory
{
    protected $model = DevisItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 10);
        $unitPrice = fake()->randomFloat(2, 100, 5000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $amount = $quantity * $unitPrice;

        return [
            'devis_id' => Devis::factory(),
            'description' => fake()->sentence(6),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'tax_rate' => $taxRate,
            'amount' => $amount,
        ];
    }
}
