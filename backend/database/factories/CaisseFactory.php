<?php

namespace Database\Factories;

use App\Models\Caisse;
use Illuminate\Database\Eloquent\Factories\Factory;

class CaisseFactory extends Factory
{
    protected $model = Caisse::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Caisse Principale', 'Caisse Secondaire', 'Caisse Dépenses', 'Petite Caisse']) . ' ' . fake()->numberBetween(1, 10),
            'balance' => fake()->randomFloat(2, 1000, 100000),
        ];
    }

    public function withMouvements(int $count = 5): static
    {
        return $this->has(
            MouvementCaisseFactory::new()->count($count),
            'mouvements'
        );
    }
}
