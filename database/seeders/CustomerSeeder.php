<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $profiles = [
            ['phone' => '0812-3456-7890', 'address' => 'Jl. Melati No. 12, Bandung, Jawa Barat'],
            ['phone' => '0813-4567-8901', 'address' => 'Jl. Merdeka No. 8, Depok, Jawa Barat'],
            ['phone' => '0815-6789-0123', 'address' => 'Jl. Sawo No. 45, Jakarta Selatan, DKI Jakarta'],
            ['phone' => '0812-9876-5432', 'address' => 'Jl. Kenanga No. 21, Surabaya, Jawa Timur'],
            ['phone' => '0813-2222-3344', 'address' => 'Jl. Anggrek No. 17, Tangerang, Banten'],
            ['phone' => '0815-3333-4455', 'address' => 'Jl. Cendana No. 3, Bekasi, Jawa Barat'],
            ['phone' => '0812-5555-6677', 'address' => 'Jl. Diponegoro No. 19, Yogyakarta, DI Yogyakarta'],
            ['phone' => '0813-6666-7788', 'address' => 'Jl. Pahlawan No. 27, Semarang, Jawa Tengah'],
            ['phone' => '0815-7777-8899', 'address' => 'Jl. Gajah Mada No. 10, Malang, Jawa Timur'],
            ['phone' => '0812-8888-9900', 'address' => 'Jl. Asia Afrika No. 56, Bandung, Jawa Barat'],
            ['phone' => '0813-9090-1212', 'address' => 'Jl. Sudirman No. 14, Medan, Sumatera Utara'],
            ['phone' => '0815-1010-2323', 'address' => 'Jl. Sunset Road No. 6, Denpasar, Bali'],
            ['phone' => '0812-4545-5656', 'address' => 'Jl. Ahmad Yani No. 31, Makassar, Sulawesi Selatan'],
            ['phone' => '0813-6767-7878', 'address' => 'Jl. Taman Sari No. 9, Bogor, Jawa Barat'],
            ['phone' => '0815-8989-9090', 'address' => 'Jl. Soekarno Hatta No. 74, Palembang, Sumatera Selatan'],
        ];

        $customerUsers = User::role('customer')->orderBy('id')->get();

        foreach ($customerUsers as $index => $user) {
            Customer::factory()
                ->for($user)
                ->create($profiles[$index]);
        }
    }
}
