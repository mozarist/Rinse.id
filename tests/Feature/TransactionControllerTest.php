<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
});

function transactionTestAdminUser(): User
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    return $admin;
}

function transactionTestPayload(array $overrides = []): array
{
    $customer = Customer::factory()->create();
    $service = Service::factory()->create([
        'price' => 75000,
    ]);

    return array_merge([
        'customer_id' => $customer->id,
        'service_id' => $service->id,
        'quantity' => 2,
        'payment_method' => 'transfer',
        'payment_status' => 'paid',
    ], $overrides);
}

function transactionTestImage(string $name): UploadedFile
{
    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9i5aQAAAAASUVORK5CYII=');

    return UploadedFile::fake()->createWithContent($name, $png);
}

test('admin must upload payment proof for paid transfer transactions', function () {
    $response = $this->actingAs(transactionTestAdminUser())->post(route('transactions.store'), transactionTestPayload([
        'payment_proof' => null,
    ]));

    $response->assertSessionHasErrors('payment_proof');
});

test('admin can store a payment proof when creating a transfer transaction', function () {
    $proof = transactionTestImage('proof.png');

    $response = $this->actingAs(transactionTestAdminUser())->post(route('transactions.store'), transactionTestPayload([
        'payment_proof' => $proof,
    ]));

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction = Transactions::query()->latest('id')->firstOrFail();

    expect($transaction->payment_proof)->not->toBeNull();
    expect(Storage::disk('public')->exists($transaction->payment_proof))->toBeTrue();
    expect($transaction->payment_proof)->toStartWith('payment-proofs/');
});

test('admin can replace payment proof during transaction update', function () {
    $admin = transactionTestAdminUser();
    $customer = Customer::factory()->create();
    $service = Service::factory()->create([
        'price' => 75000,
    ]);

    $oldProof = transactionTestImage('old-proof.png')->store('payment-proofs', 'public');

    $transaction = Transactions::create([
        'invoice_code' => 'INV-20260601-AAAAAA',
        'admin_id' => $admin->id,
        'customer_id' => $customer->id,
        'service_id' => $service->id,
        'quantity' => 1,
        'total_price' => 75000,
        'status' => 'antrian',
        'payment_method' => 'transfer',
        'payment_status' => 'paid',
        'payment_proof' => $oldProof,
    ]);

    $newProof = transactionTestImage('new-proof-2.png');

    $response = $this->actingAs($admin)->put(route('transactions.update', $transaction), array_merge(transactionTestPayload([
        'payment_proof' => $newProof,
    ]), [
        'status' => 'dicuci',
    ]));

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction->refresh();

    expect($transaction->payment_proof)->not->toBe($oldProof);
    expect($transaction->payment_proof)->toStartWith('payment-proofs/');
    expect(Storage::disk('public')->exists($oldProof))->toBeFalse();
    expect(Storage::disk('public')->exists($transaction->payment_proof))->toBeTrue();
});

test('admin can keep the existing payment proof when updating a paid transfer transaction', function () {
    $admin = transactionTestAdminUser();
    $customer = Customer::factory()->create();
    $service = Service::factory()->create([
        'price' => 75000,
    ]);

    $existingProof = transactionTestImage('existing-proof.png')->store('payment-proofs', 'public');

    $transaction = Transactions::create([
        'invoice_code' => 'INV-20260601-CCCCCC',
        'admin_id' => $admin->id,
        'customer_id' => $customer->id,
        'service_id' => $service->id,
        'quantity' => 1,
        'total_price' => 75000,
        'status' => 'antrian',
        'payment_method' => 'transfer',
        'payment_status' => 'paid',
        'payment_proof' => $existingProof,
    ]);

    $response = $this->actingAs($admin)->put(route('transactions.update', $transaction), array_merge(transactionTestPayload([
        'payment_method' => 'transfer',
        'payment_status' => 'paid',
        'payment_proof' => null,
    ]), [
        'status' => 'dicuci',
    ]));

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction->refresh();

    expect($transaction->payment_proof)->toBe($existingProof);
    expect(Storage::disk('public')->exists($existingProof))->toBeTrue();
});

test('admin can clear payment proof when switching payment method to cash', function () {
    $admin = transactionTestAdminUser();
    $customer = Customer::factory()->create();
    $service = Service::factory()->create([
        'price' => 75000,
    ]);

    $oldProof = transactionTestImage('old-proof-3.png')->store('payment-proofs', 'public');

    $transaction = Transactions::create([
        'invoice_code' => 'INV-20260601-BBBBBB',
        'admin_id' => $admin->id,
        'customer_id' => $customer->id,
        'service_id' => $service->id,
        'quantity' => 1,
        'total_price' => 75000,
        'status' => 'antrian',
        'payment_method' => 'transfer',
        'payment_status' => 'paid',
        'payment_proof' => $oldProof,
    ]);

    $response = $this->actingAs($admin)->put(route('transactions.update', $transaction), array_merge(transactionTestPayload([
        'payment_method' => 'cash',
        'payment_status' => 'pending',
        'payment_proof' => null,
    ]), [
        'status' => 'dicuci',
    ]));

    $response->assertSessionHasNoErrors()->assertRedirect(route('transactions.index'));

    $transaction->refresh();

    expect($transaction->payment_proof)->toBeNull();
    expect(Storage::disk('public')->exists($oldProof))->toBeFalse();
});
