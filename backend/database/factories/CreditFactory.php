<?php

namespace Database\Factories;

use App\Models\Banque;
use App\Models\Credit;
use Illuminate\Database\Eloquent\Factories\Factory;

class CreditFactory extends Factory
{
    protected $model = Credit::class;

    public function definition(): array
    {
        $montant = fake()->randomFloat(2, 50000, 500000);
        $duree = fake()->randomElement([12, 24, 36, 48, 60]);
        $tauxInteret = fake()->randomFloat(2, 3, 12);

        return [
            'banque_id' => Banque::factory(),
            'reference' => 'CRD-' . fake()->unique()->numerify('######'),
            'montant' => $montant,
            'taux_interet' => $tauxInteret,
            'duree_mois' => $duree,
            'date_debut' => fake()->dateTimeBetween('-6 months', 'now'),
            'date_fin' => fake()->dateTimeBetween('+1 year', '+5 years'),
            'mensualite' => $montant / $duree * (1 + $tauxInteret / 100),
            'objet' => fake()->sentence(4),
            'echeances_payees' => fake()->numberBetween(0, $duree / 2),
            'status' => 'active',
            'notes' => fake()->optional()->paragraph(),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'echeances_payees' => $attributes['duree_mois'],
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
        ]);
    }

    public function withPayments(int $count = 3): static
    {
        return $this->has(
            CreditPaymentFactory::new()->count($count),
            'payments'
        );
    }
}
