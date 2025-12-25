<?php

namespace Database\Factories;

use App\Models\Banque;
use Illuminate\Database\Eloquent\Factories\Factory;

class BanqueFactory extends Factory
{
    protected $model = Banque::class;

    public function definition(): array
    {
        $initialBalance = fake()->randomFloat(2, 10000, 500000);

        return [
            'name' => fake()->randomElement(['BNP Paribas', 'Société Générale', 'Crédit Agricole', 'BIAT', 'Attijari Bank', 'UIB']) . ' ' . fake()->city(),
            'account_number' => fake()->unique()->numerify('################'),
            'iban' => fake()->iban('FR'),
            'swift' => fake()->swiftBicNumber(),
            'initial_balance' => $initialBalance,
            'balance' => $initialBalance,
            'currency' => fake()->randomElement(['EUR', 'USD', 'GNF', 'XOF']),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withTransactions(int $count = 5): static
    {
        return $this->has(
            TransactionFactory::new()->count($count),
            'transactions'
        );
    }
}
