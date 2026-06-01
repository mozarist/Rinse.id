<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            ['name' => 'Andi Pratama', 'email' => 'andi.pratama@cleanlab.id'],
            ['name' => 'Siti Rahmawati', 'email' => 'siti.rahmawati@cleanlab.id'],
            ['name' => 'Budi Santoso', 'email' => 'budi.santoso@cleanlab.id'],
            ['name' => 'Raka Maulana', 'email' => 'raka.maulana@cleanlab.id'],
            ['name' => 'Dewi Nuraini', 'email' => 'dewi.nuraini@cleanlab.id'],
        ];

        foreach ($admins as $admin) {
            User::factory()->create([
                'name' => $admin['name'],
                'email' => $admin['email'],
                'password' => 'password',
            ])->assignRole('admin');
        }

        $customers = [
            ['name' => 'Ahmad Fikri', 'email' => 'ahmad.fikri@gmail.com'],
            ['name' => 'Nadia Putri', 'email' => 'nadia.putri@gmail.com'],
            ['name' => 'Rizky Aditya', 'email' => 'rizky.aditya@gmail.com'],
            ['name' => 'Lestari Wulandari', 'email' => 'lestari.wulandari@gmail.com'],
            ['name' => 'Farhan Hakim', 'email' => 'farhan.hakim@gmail.com'],
            ['name' => 'Maya Sari', 'email' => 'maya.sari@gmail.com'],
            ['name' => 'Ilham Prakoso', 'email' => 'ilham.prakoso@gmail.com'],
            ['name' => 'Putri Amelia', 'email' => 'putri.amelia@gmail.com'],
            ['name' => 'Hendra Wijaya', 'email' => 'hendra.wijaya@gmail.com'],
            ['name' => 'Ayu Septiani', 'email' => 'ayu.septiani@gmail.com'],
            ['name' => 'Fajar Nugroho', 'email' => 'fajar.nugroho@gmail.com'],
            ['name' => 'Salma Azzahra', 'email' => 'salma.azzahra@gmail.com'],
            ['name' => 'Dimas Saputra', 'email' => 'dimas.saputra@gmail.com'],
            ['name' => 'Nabila Ramadhani', 'email' => 'nabila.ramadhani@gmail.com'],
            ['name' => 'Bagas Firmansyah', 'email' => 'bagas.firmansyah@gmail.com'],
        ];

        foreach ($customers as $customer) {
            User::factory()->create([
                'name' => $customer['name'],
                'email' => $customer['email'],
                'password' => 'password',
            ])->assignRole('customer');
        }
    }
}
