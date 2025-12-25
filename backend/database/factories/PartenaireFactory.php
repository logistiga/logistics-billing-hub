<?php

namespace Database\Factories;

use App\Models\Partenaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartenaireFactory extends Factory
{
    protected $model = Partenaire::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'type' => fake()->randomElement(['supplier', 'transporter', 'other']),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'nif' => fake()->optional()->numerify('NIF-########'),
            'rc' => fake()->optional()->numerify('RC-########'),
            'bank_name' => fake()->optional()->company() . ' Bank',
            'bank_account' => fake()->optional()->numerify('################'),
            'iban' => fake()->optional()->iban('FR'),
            'contact_name' => fake()->name(),
            'contact_phone' => fake()->phoneNumber(),
            'contact_email' => fake()->safeEmail(),
            'notes' => fake()->optional()->paragraph(),
            'is_active' => true,
        ];
    }

    public function supplier(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'supplier',
        ]);
    }

    public function transporter(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'transporter',
        ]);
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
            PartenaireTransactionFactory::new()->count($count),
            'transactions'
        );
    }
}
