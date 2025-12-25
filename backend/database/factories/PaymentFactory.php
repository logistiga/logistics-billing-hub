<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'payment_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'check', 'card']),
            'reference' => fake()->optional()->bothify('PAY-????-####'),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'cash',
        ]);
    }

    public function bankTransfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'bank_transfer',
        ]);
    }

    public function check(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'check',
        ]);
    }
}
