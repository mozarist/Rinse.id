<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceNames = [
            'Cuci Lipat',
            'Dry Cleaning',
            'Cuci Sepatu',
            'Setrika Saja',
            'Cuci Bed Cover',
            'Cuci Jaket Kulit',
            'Laundry kilat',
        ];

        return [
            'service_name' => fake()->randomElement($serviceNames),
            'price' => $this->faker->numberBetween(15000, 60000),
            'unit' => $this->faker->randomElement(['kg', 'pcs']),
        ];
    }
}
