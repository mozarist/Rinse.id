<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = User::role('admin')->orderBy('id')->get();
        $customers = Customer::with('user')->orderBy('id')->get();
        $services = Service::query()->get()->keyBy('service_name');

        $transactionSpecs = [
            ['days_ago' => 0, 'hour' => 8, 'status' => 'antrian', 'payment_status' => 'pending', 'payment_method' => 'cash', 'service' => 'Cuci Lipat', 'quantity' => 6],
            ['days_ago' => 0, 'hour' => 10, 'status' => 'dicuci', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-01.jpg', 'service' => 'Dry Cleaning', 'quantity' => 2],
            ['days_ago' => 0, 'hour' => 13, 'status' => 'disetrika', 'payment_status' => 'pending', 'payment_method' => 'transfer', 'service' => 'Cuci Sepatu', 'quantity' => 1],
            ['days_ago' => 0, 'hour' => 16, 'status' => 'siap_diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Laundry kilat', 'quantity' => 4],
            ['days_ago' => 1, 'hour' => 9, 'status' => 'dicuci', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-02.jpg', 'service' => 'Setrika Saja', 'quantity' => 5],
            ['days_ago' => 1, 'hour' => 11, 'status' => 'siap_diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Cuci Bed Cover', 'quantity' => 2],
            ['days_ago' => 1, 'hour' => 14, 'status' => 'antrian', 'payment_status' => 'pending', 'payment_method' => 'cash', 'service' => 'Cuci Lipat', 'quantity' => 8],
            ['days_ago' => 1, 'hour' => 17, 'status' => 'disetrika', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-03.jpg', 'service' => 'Cuci Jaket Kulit', 'quantity' => 1],
            ['days_ago' => 3, 'hour' => 9, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Laundry kilat', 'quantity' => 7],
            ['days_ago' => 4, 'hour' => 10, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-04.jpg', 'service' => 'Cuci Sepatu', 'quantity' => 3],
            ['days_ago' => 5, 'hour' => 8, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Setrika Saja', 'quantity' => 4],
            ['days_ago' => 6, 'hour' => 15, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-05.jpg', 'service' => 'Dry Cleaning', 'quantity' => 1],
            ['days_ago' => 8, 'hour' => 11, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Cuci Lipat', 'quantity' => 5],
            ['days_ago' => 10, 'hour' => 14, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-06.jpg', 'service' => 'Cuci Bed Cover', 'quantity' => 3],
            ['days_ago' => 12, 'hour' => 9, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Cuci Sepatu', 'quantity' => 2],
            ['days_ago' => 14, 'hour' => 16, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-07.jpg', 'service' => 'Laundry kilat', 'quantity' => 3],
            ['days_ago' => 16, 'hour' => 10, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Setrika Saja', 'quantity' => 6],
            ['days_ago' => 18, 'hour' => 13, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-08.jpg', 'service' => 'Cuci Jaket Kulit', 'quantity' => 2],
            ['days_ago' => 21, 'hour' => 8, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'cash', 'service' => 'Dry Cleaning', 'quantity' => 1],
            ['days_ago' => 24, 'hour' => 12, 'status' => 'diambil', 'payment_status' => 'paid', 'payment_method' => 'transfer', 'payment_proof' => 'payment-proofs/transfer-proof-09.jpg', 'service' => 'Cuci Lipat', 'quantity' => 9],
        ];

        foreach ($transactionSpecs as $index => $spec) {
            $service = $services[$spec['service']];
            $quantity = $spec['quantity'];

            $createdAt = Carbon::now()
                ->subDays($spec['days_ago'])
                ->setTime($spec['hour'], fake()->numberBetween(0, 5) * 10, 0);

            $paidAt = $spec['payment_status'] === 'paid'
                ? $createdAt->copy()->addHours(2)
                : null;

            Transactions::factory()
                ->for($admins[$index % $admins->count()], 'admin')
                ->for($customers[$index % $customers->count()], 'customer')
                ->for($service, 'service')
                ->state([
                    'quantity' => $quantity,
                    'status' => $spec['status'],
                    'payment_method' => $spec['payment_method'],
                    'payment_status' => $spec['payment_status'],
                    'payment_proof' => $spec['payment_method'] === 'transfer' ? ($spec['payment_proof'] ?? null) : null,
                    'paid_at' => $paidAt,
                ])
                ->occurredAt($createdAt)
                ->create();
        }
    }
}
