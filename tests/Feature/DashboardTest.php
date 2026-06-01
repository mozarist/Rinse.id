<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('admins can visit the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');
    $this->actingAs($user);

    $customers = Customer::factory()->count(3)->create();

    $dryCleaning = Service::factory()->create([
        'service_name' => 'Dry Cleaning',
        'price' => 50000,
        'unit' => 'pcs',
    ]);

    $washAndFold = Service::factory()->create([
        'service_name' => 'Wash and Fold',
        'price' => 25000,
        'unit' => 'kg',
    ]);

    $today = now()->startOfDay();
    $yesterday = now()->subDay()->startOfDay();

    $transactions = [
        [
            'invoice_code' => 'INV-001',
            'customer' => $customers[0],
            'service' => $washAndFold,
            'status' => 'antrian',
            'payment_status' => 'pending',
            'quantity' => 2,
            'total_price' => 50000,
            'created_at' => $today->copy()->subDays(3),
            'paid_at' => null,
        ],
        [
            'invoice_code' => 'INV-002',
            'customer' => $customers[1],
            'service' => $dryCleaning,
            'status' => 'dicuci',
            'payment_status' => 'paid',
            'quantity' => 3,
            'total_price' => 100000,
            'created_at' => $today->copy()->subDays(2),
            'paid_at' => $today->copy()->subDays(2),
        ],
        [
            'invoice_code' => 'INV-003',
            'customer' => $customers[2],
            'service' => $dryCleaning,
            'status' => 'siap_diambil',
            'payment_status' => 'paid',
            'quantity' => 2,
            'total_price' => 50000,
            'created_at' => $yesterday,
            'paid_at' => $yesterday,
        ],
        [
            'invoice_code' => 'INV-004',
            'customer' => $customers[0],
            'service' => $washAndFold,
            'status' => 'siap_diambil',
            'payment_status' => 'paid',
            'quantity' => 3,
            'total_price' => 75000,
            'created_at' => $yesterday,
            'paid_at' => $yesterday,
        ],
        [
            'invoice_code' => 'INV-005',
            'customer' => $customers[1],
            'service' => $dryCleaning,
            'status' => 'disetrika',
            'payment_status' => 'pending',
            'quantity' => 1,
            'total_price' => 125000,
            'created_at' => $today->copy()->subDay(),
            'paid_at' => null,
        ],
        [
            'invoice_code' => 'INV-006',
            'customer' => $customers[2],
            'service' => $washAndFold,
            'status' => 'diambil',
            'payment_status' => 'pending',
            'quantity' => 1,
            'total_price' => 90000,
            'created_at' => $today,
            'paid_at' => null,
        ],
    ];

    foreach ($transactions as $transactionData) {
        Transactions::query()->insert([
            'admin_id' => $user->id,
            'customer_id' => $transactionData['customer']->id,
            'service_id' => $transactionData['service']->id,
            'invoice_code' => $transactionData['invoice_code'],
            'status' => $transactionData['status'],
            'payment_status' => $transactionData['payment_status'],
            'quantity' => $transactionData['quantity'],
            'total_price' => $transactionData['total_price'],
            'created_at' => $transactionData['created_at']->toDateTimeString(),
            'updated_at' => $transactionData['created_at']->toDateTimeString(),
            'paid_at' => $transactionData['paid_at']?->toDateTimeString(),
        ]);
    }

    $response = $this->get(route('dashboard'));
    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('summary.totalTransactions', 6)
            ->where('summary.totalRevenue', 225000)
            ->where('summary.pendingPayments', 3)
            ->where('summary.activeCustomers', 3)
            ->has('recentTransactions', 5)
            ->where('recentTransactions.0.invoice_code', 'INV-006')
            ->where('recentTransactions.4.invoice_code', 'INV-002')
            ->has('revenueChart.categories', 2)
            ->has('revenueChart.data', 2)
            ->where('revenueChart.categories.0.label', 'Dry Cleaning')
            ->where('revenueChart.categories.1.label', 'Wash and Fold')
            ->where('revenueChart.data.0.date', $today->copy()->subDays(2)->toDateString())
            ->where('revenueChart.data.0.totalRevenue', 100000)
            ->where('revenueChart.data.0.service-'.$dryCleaning->id, 100000)
            ->where('revenueChart.data.0.service-'.$dryCleaning->id.'Transactions', 1)
            ->where('revenueChart.data.0.service-'.$washAndFold->id, 0)
            ->where('revenueChart.data.0.service-'.$washAndFold->id.'Transactions', 0)
            ->where('revenueChart.data.1.date', $yesterday->toDateString())
            ->where('revenueChart.data.1.totalRevenue', 125000)
            ->where('revenueChart.data.1.service-'.$dryCleaning->id, 50000)
            ->where('revenueChart.data.1.service-'.$dryCleaning->id.'Transactions', 1)
            ->where('revenueChart.data.1.service-'.$washAndFold->id, 75000)
            ->where('revenueChart.data.1.service-'.$washAndFold->id.'Transactions', 1)
            ->has('customers', 3)
            ->has('services', 2)
            ->where('customers.0.user.name', $customers[0]->user->name)
            ->where('services.0.service_name', 'Dry Cleaning')
        );
});

test('customers cannot visit the dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertForbidden();
});
