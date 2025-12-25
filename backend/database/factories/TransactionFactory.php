<?php

namespace Database\Factories;

use App\Models\Banque;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $isCredit = fake()->boolean();

        return [
            'banque_id' => Banque::factory(),
            'date' => fake()->dateTimeBetween('-3 months', 'now'),
            'description' => fake()->sentence(4),
            'reference' => fake()->optional()->bothify('TRX-????-####'),
            'credit' => $isCredit ? fake()->randomFloat(2, 100, 50000) : 0,
            'debit' => !$isCredit ? fake()->randomFloat(2, 100, 50000) : 0,
            'type' => fake()->randomElement(['virement', 'cheque', 'prelevement', 'versement', 'retrait']),
            'category' => fake()->randomElement(['vente', 'achat', 'salaire', 'loyer', 'frais_bancaires', 'autre']),
            'is_reconciled' => fake()->boolean(30),
            'reconciled_at' => fake()->optional(0.3)->dateTimeThisMonth(),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function credit(float $amount = null): static
    {
        return $this->state(fn (array $attributes) => [
            'credit' => $amount ?? fake()->randomFloat(2, 100, 50000),
            'debit' => 0,
        ]);
    }

    public function debit(float $amount = null): static
    {
        return $this->state(fn (array $attributes) => [
            'credit' => 0,
            'debit' => $amount ?? fake()->randomFloat(2, 100, 50000),
        ]);
    }

    public function reconciled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_reconciled' => true,
            'reconciled_at' => now(),
        ]);
    }
}
