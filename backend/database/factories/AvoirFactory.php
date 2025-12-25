<?php

namespace Database\Factories;

use App\Models\Avoir;
use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class AvoirFactory extends Factory
{
    protected $model = Avoir::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 500, 20000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        return [
            'numero' => 'AV-' . fake()->unique()->numerify('######'),
            'invoice_id' => Invoice::factory(),
            'client_id' => Client::factory(),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'reason' => fake()->randomElement(['retour', 'remise', 'erreur_facturation', 'annulation']),
            'description' => fake()->sentence(6),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'status' => 'pending',
            'amount_used' => 0,
            'amount_remaining' => $total,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'amount_used' => 0,
            'amount_remaining' => $attributes['total'],
        ]);
    }

    public function used(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'used',
            'amount_used' => $attributes['total'],
            'amount_remaining' => 0,
        ]);
    }

    public function partiallyUsed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'partial',
            'amount_used' => $attributes['total'] * 0.5,
            'amount_remaining' => $attributes['total'] * 0.5,
        ]);
    }

    public function withItems(int $count = 2): static
    {
        return $this->has(
            AvoirItemFactory::new()->count($count),
            'items'
        );
    }
}
