<?php

namespace Database\Factories;

use App\Models\Caisse;
use App\Models\MouvementCaisse;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MouvementCaisseFactory extends Factory
{
    protected $model = MouvementCaisse::class;

    public function definition(): array
    {
        return [
            'caisse_id' => Caisse::factory(),
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['encaissement', 'decaissement']),
            'amount' => fake()->randomFloat(2, 100, 10000),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'description' => fake()->sentence(4),
            'reference' => fake()->optional()->bothify('MOV-????-####'),
            'category' => fake()->randomElement(['vente', 'achat', 'salaire', 'frais', 'autre']),
            'is_cancelled' => false,
        ];
    }

    public function encaissement(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'encaissement',
        ]);
    }

    public function decaissement(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'decaissement',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_cancelled' => true,
            'cancelled_at' => now(),
            'cancelled_reason' => fake()->sentence(),
        ]);
    }
}
