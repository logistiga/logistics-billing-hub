<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\OrdreTravail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrdreTravailFactory extends Factory
{
    protected $model = OrdreTravail::class;

    public function definition(): array
    {
        return [
            'numero' => 'OT-' . fake()->unique()->numerify('######'),
            'client_id' => Client::factory(),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'date_execution' => fake()->optional()->dateTimeBetween('now', '+1 month'),
            'type_operation' => fake()->randomElement(['import', 'export', 'transit', 'stockage']),
            'description' => fake()->paragraph(),
            'reference_client' => fake()->optional()->bothify('REF-????-####'),
            'bl_numero' => fake()->optional()->numerify('BL-######'),
            'conteneur_numero' => fake()->optional()->bothify('????#######'),
            'navire' => fake()->optional()->lastName() . ' ' . fake()->randomElement(['Express', 'Cargo', 'Star', 'Line']),
            'port_origine' => fake()->city(),
            'port_destination' => fake()->city(),
            'status' => fake()->randomElement(['draft', 'pending', 'in_progress', 'completed', 'cancelled']),
            'notes' => fake()->optional()->paragraph(),
            'created_by' => User::factory(),
            'validated_by' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'validated_by' => User::factory(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function withPrestations(int $count = 3): static
    {
        return $this->has(
            LignePrestationFactory::new()->count($count),
            'lignesPrestations'
        );
    }

    public function withTransports(int $count = 2): static
    {
        return $this->has(
            TransportFactory::new()->count($count),
            'transports'
        );
    }
}
