<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Devis;
use Illuminate\Database\Eloquent\Factories\Factory;

class DevisFactory extends Factory
{
    protected $model = Devis::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 1000, 50000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        return [
            'numero' => 'DEV-' . fake()->unique()->numerify('######'),
            'client_id' => Client::factory(),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'validity_date' => fake()->dateTimeBetween('now', '+1 month'),
            'reference' => fake()->optional()->bothify('REF-????-####'),
            'subject' => fake()->sentence(4),
            'introduction' => fake()->optional()->paragraph(),
            'conditions' => fake()->optional()->paragraph(),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount' => 0,
            'discount_type' => 'amount',
            'discount_amount' => 0,
            'total' => $total,
            'status' => 'draft',
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'validity_date' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }

    public function withItems(int $count = 3): static
    {
        return $this->has(
            DevisItemFactory::new()->count($count),
            'items'
        );
    }
}
