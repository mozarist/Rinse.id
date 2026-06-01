<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('database seeder creates realistic laundry demo data', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::role('admin')->count())->toBe(5);
    expect(User::role('customer')->count())->toBe(15);
    expect(Customer::count())->toBe(15);
    expect(Service::count())->toBe(7);
    expect(Transactions::count())->toBe(20);

    expect(Service::whereNotIn('unit', ['kg', 'pcs'])->exists())->toBeFalse();
    expect(Service::pluck('service_name')->sort()->values()->all())->toBe([
        'Cuci Bed Cover',
        'Cuci Jaket Kulit',
        'Cuci Lipat',
        'Cuci Sepatu',
        'Dry Cleaning',
        'Laundry kilat',
        'Setrika Saja',
    ]);

    foreach (Customer::with('user')->get() as $customer) {
        expect($customer->user)->not->toBeNull();
        expect($customer->user->hasRole('customer'))->toBeTrue();
        expect($customer->phone)->not->toBeEmpty();
        expect($customer->address)->not->toBeEmpty();
    }

    foreach (Transactions::with(['customer.user', 'service', 'admin'])->get() as $transaction) {
        expect($transaction->customer)->not->toBeNull();
        expect($transaction->service)->not->toBeNull();
        expect($transaction->admin)->not->toBeNull();

        expect((float) $transaction->total_price)->toBe((float) ($transaction->service->price * $transaction->quantity));

        if ($transaction->service->unit === 'kg') {
            expect($transaction->quantity)->toBeGreaterThanOrEqual(2);
            expect($transaction->quantity)->toBeLessThanOrEqual(10);
        } else {
            expect($transaction->quantity)->toBeGreaterThanOrEqual(1);
            expect($transaction->quantity)->toBeLessThanOrEqual(5);
        }

        if ($transaction->payment_method === 'cash') {
            expect($transaction->payment_proof)->toBeNull();
        }

        if ($transaction->created_at->isSameDay(now()) || $transaction->created_at->isYesterday()) {
            expect(in_array($transaction->status, ['antrian', 'dicuci', 'disetrika', 'siap_diambil'], true))->toBeTrue();
        } else {
            expect($transaction->payment_status)->toBe('paid');
            expect($transaction->status)->toBe('diambil');
        }
    }

    expect(Transactions::whereDate('created_at', now()->toDateString())->count())->toBe(4);
    expect(Transactions::whereDate('created_at', now()->subDay()->toDateString())->count())->toBe(4);
    expect(Transactions::where('created_at', '<', now()->subDays(2)->startOfDay())->count())->toBe(12);
    expect(Transactions::where('payment_method', 'transfer')->whereNotNull('payment_proof')->count())->toBeGreaterThan(0);
    expect(Transactions::where('payment_method', 'cash')->whereNotNull('payment_proof')->exists())->toBeFalse();
});
