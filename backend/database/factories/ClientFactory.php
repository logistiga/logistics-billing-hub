<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'nif' => fake()->unique()->numerify('NIF-########'),
            'rccm' => fake()->unique()->numerify('RCCM-########'),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->companyEmail(),
        ];
    }

    public function withContacts(int $count = 2): static
    {
        return $this->has(
            ClientContactFactory::new()->count($count),
            'contacts'
        );
    }
}
