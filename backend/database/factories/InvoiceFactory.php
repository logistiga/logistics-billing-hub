<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 1000, 50000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        return [
            'numero' => 'FAC-' . fake()->unique()->numerify('######'),
            'client_id' => Client::factory(),
            'date' => fake()->dateTimeBetween('-3 months', 'now'),
            'due_date' => fake()->dateTimeBetween('now', '+3 months'),
            'reference' => fake()->optional()->bothify('REF-????-####'),
            'subject' => fake()->sentence(4),
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'discount' => 0,
            'discount_type' => 'amount',
            'discount_amount' => 0,
            'total' => $total,
            'amount_paid' => 0,
            'status' => 'draft',
            'type' => fake()->randomElement(['standard', 'proforma', 'avoir']),
            'notes' => fake()->optional()->paragraph(),
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

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'amount_paid' => $attributes['total'],
            'paid_at' => now(),
        ]);
    }

    public function partiallyPaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'partial',
            'amount_paid' => $attributes['total'] * 0.5,
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
            'due_date' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }

    public function withItems(int $count = 3): static
    {
        return $this->has(
            InvoiceItemFactory::new()->count($count),
            'items'
        );
    }
}
