<?php

namespace Database\Factories;

use App\Models\Avoir;
use App\Models\AvoirItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class AvoirItemFactory extends Factory
{
    protected $model = AvoirItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $unitPrice = fake()->randomFloat(2, 100, 2000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $amount = $quantity * $unitPrice;

        return [
            'avoir_id' => Avoir::factory(),
            'description' => fake()->sentence(6),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'tax_rate' => $taxRate,
            'amount' => $amount,
        ];
    }
}
