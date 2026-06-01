<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            ['service_name' => 'Cuci Lipat', 'price' => 17000, 'unit' => 'kg'],
            ['service_name' => 'Dry Cleaning', 'price' => 35000, 'unit' => 'pcs'],
            ['service_name' => 'Cuci Sepatu', 'price' => 30000, 'unit' => 'pcs'],
            ['service_name' => 'Setrika Saja', 'price' => 12000, 'unit' => 'kg'],
            ['service_name' => 'Cuci Bed Cover', 'price' => 45000, 'unit' => 'pcs'],
            ['service_name' => 'Cuci Jaket Kulit', 'price' => 60000, 'unit' => 'pcs'],
            ['service_name' => 'Laundry kilat', 'price' => 25000, 'unit' => 'kg'],
        ];

        foreach ($services as $service) {
            Service::factory()->create($service);
        }
    }
}
