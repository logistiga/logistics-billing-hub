<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\NoteDebut;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoteDebutFactory extends Factory
{
    protected $model = NoteDebut::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 1000, 30000);
        $taxRate = fake()->randomElement([0, 18, 19]);
        $taxAmount = $subtotal * ($taxRate / 100);
        $total = $subtotal + $taxAmount;

        return [
            'numero' => 'ND-' . fake()->unique()->numerify('######'),
            'client_id' => Client::factory(),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'type' => fake()->randomElement(['debut', 'detention', 'ouverture_port', 'reparation']),
            'bl_numero' => fake()->optional()->numerify('BL-######'),
            'conteneur_numero' => fake()->optional()->bothify('????#######'),
            'navire' => fake()->optional()->lastName() . ' ' . fake()->randomElement(['Express', 'Cargo', 'Star']),
            'reference' => fake()->optional()->bothify('REF-????-####'),
            'description' => fake()->paragraph(),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'status' => fake()->randomElement(['draft', 'pending', 'validated', 'invoiced', 'cancelled']),
            'notes' => fake()->optional()->paragraph(),
            'created_by' => User::factory(),
            'validated_by' => null,
        ];
    }

    public function debut(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debut',
        ]);
    }

    public function detention(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'detention',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function validated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'validated',
            'validated_by' => User::factory(),
        ]);
    }

    public function invoiced(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'invoiced',
        ]);
    }
}
