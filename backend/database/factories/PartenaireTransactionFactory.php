<?php

namespace Database\Factories;

use App\Models\Partenaire;
use App\Models\PartenaireTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartenaireTransactionFactory extends Factory
{
    protected $model = PartenaireTransaction::class;

    public function definition(): array
    {
        $isCredit = fake()->boolean();

        return [
            'partenaire_id' => Partenaire::factory(),
            'date' => fake()->dateTimeBetween('-3 months', 'now'),
            'description' => fake()->sentence(4),
            'reference' => fake()->optional()->bothify('PTX-????-####'),
            'credit' => $isCredit ? fake()->randomFloat(2, 100, 20000) : 0,
            'debit' => !$isCredit ? fake()->randomFloat(2, 100, 20000) : 0,
            'type' => fake()->randomElement(['facture', 'paiement', 'avoir', 'autre']),
            'status' => fake()->randomElement(['pending', 'completed', 'cancelled']),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function credit(float $amount = null): static
    {
        return $this->state(fn (array $attributes) => [
            'credit' => $amount ?? fake()->randomFloat(2, 100, 20000),
            'debit' => 0,
        ]);
    }

    public function debit(float $amount = null): static
    {
        return $this->state(fn (array $attributes) => [
            'credit' => 0,
            'debit' => $amount ?? fake()->randomFloat(2, 100, 20000),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
