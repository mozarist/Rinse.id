<?php

use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('customer api routes require the customer role', function () {
    $customer = User::factory()->create();
    $customer->assignRole('customer');
    Customer::factory()->create(['user_id' => $customer->id]);

    Sanctum::actingAs($customer);

    $this->getJson('/api/me')->assertOk();
    $this->getJson('/api/transactions')->assertOk();
});

test('non-customer api routes are forbidden for other roles', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/me')->assertForbidden();
    $this->getJson('/api/transactions')->assertForbidden();
});
