<?php

namespace Database\Factories;

use App\Models\Avoir;
use App\Models\AvoirCompensation;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class AvoirCompensationFactory extends Factory
{
    protected $model = AvoirCompensation::class;

    public function definition(): array
    {
        return [
            'avoir_id' => Avoir::factory(),
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
