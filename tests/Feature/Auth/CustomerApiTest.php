<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('customer can login and receives a token and customer data', function () {
    $password = 'secret-password';
    $user = User::factory()->create([
        'password' => bcrypt($password),
    ]);
    $user->assignRole('customer');
    Customer::factory()->create(['user_id' => $user->id]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => $password,
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'customer' => [
                        'id',
                        'phone',
                        'address',
                    ],
                ],
            ],
        ]);
});

test('me endpoint returns authenticated user with customer relation loaded', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');
    $customer = Customer::factory()->create(['user_id' => $user->id]);

    Sanctum::actingAs($user, [], 'sanctum');

    $this->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.customer.id', $customer->id)
        ->assertJsonPath('data.customer.phone', $customer->phone);
});

test('transactions index returns only the authenticated customer transactions', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    $otherCustomer = Customer::factory()->create();
    $service = Service::factory()->create();

    Transactions::factory()->create([
        'customer_id' => $customer->id,
        'service_id' => $service->id,
    ]);

    Transactions::factory()->create([
        'customer_id' => $otherCustomer->id,
        'service_id' => $service->id,
    ]);

    Sanctum::actingAs($user, [], 'sanctum');

    $this->getJson('/api/transactions')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.service.id', $service->id);
});

test('logout deletes the current access token', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');
    Customer::factory()->create(['user_id' => $user->id]);
    $token = $user->createToken('mobile')->plainTextToken;

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/logout')
        ->assertOk()
        ->assertJsonPath('data.message', 'Logged out');

    $this->assertDatabaseCount('personal_access_tokens', 0);
});
