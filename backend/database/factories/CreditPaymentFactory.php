<?php

namespace Database\Factories;

use App\Models\Credit;
use App\Models\CreditPayment;
use Illuminate\Database\Eloquent\Factories\Factory;

class CreditPaymentFactory extends Factory
{
    protected $model = CreditPayment::class;

    public function definition(): array
    {
        $principal = fake()->randomFloat(2, 500, 5000);
        $interest = fake()->randomFloat(2, 50, 500);

        return [
            'credit_id' => Credit::factory(),
            'echeance_numero' => fake()->numberBetween(1, 60),
            'date_echeance' => fake()->dateTimeBetween('-1 month', '+1 month'),
            'date_paiement' => fake()->optional(0.7)->dateTimeThisMonth(),
            'montant_principal' => $principal,
            'montant_interet' => $interest,
            'montant_total' => $principal + $interest,
            'status' => fake()->randomElement(['pending', 'paid', 'overdue']),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'date_paiement' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'date_paiement' => null,
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
            'date_paiement' => null,
            'date_echeance' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }
}
