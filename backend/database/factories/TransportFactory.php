<?php

namespace Database\Factories;

use App\Models\OrdreTravail;
use App\Models\Partenaire;
use App\Models\Transport;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransportFactory extends Factory
{
    protected $model = Transport::class;

    public function definition(): array
    {
        return [
            'ordre_travail_id' => OrdreTravail::factory(),
            'partenaire_id' => Partenaire::factory()->transporter(),
            'type' => fake()->randomElement(['routier', 'maritime', 'aerien', 'ferroviaire']),
            'vehicule' => fake()->optional()->bothify('??-####-??'),
            'chauffeur' => fake()->optional()->name(),
            'chauffeur_phone' => fake()->optional()->phoneNumber(),
            'date_depart' => fake()->dateTimeBetween('now', '+1 week'),
            'date_arrivee' => fake()->optional()->dateTimeBetween('+1 week', '+2 weeks'),
            'lieu_depart' => fake()->city(),
            'lieu_arrivee' => fake()->city(),
            'distance_km' => fake()->optional()->numberBetween(50, 2000),
            'cout' => fake()->randomFloat(2, 500, 10000),
            'status' => fake()->randomElement(['planned', 'in_transit', 'delivered', 'cancelled']),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function planned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'planned',
        ]);
    }

    public function inTransit(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_transit',
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'date_arrivee' => now(),
        ]);
    }
}
