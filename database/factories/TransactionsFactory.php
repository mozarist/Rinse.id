<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @extends Factory<Transactions>
 */
class TransactionsFactory extends Factory
{
    public function configure(): static
    {
        return $this->afterCreating(function (Transactions $transaction): void {
            $service = $transaction->service;

            if ($service === null) {
                return;
            }

            $transaction->forceFill([
                'total_price' => round($service->price * $transaction->quantity, 2),
            ])->saveQuietly();
        });
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_code' => 'INV-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'admin_id' => User::factory(),
            'customer_id' => Customer::factory(),
            'service_id' => Service::factory(),
            'quantity' => 1,
            'total_price' => 0,
            'status' => $this->faker->randomElement(['antrian', 'dicuci', 'disetrika', 'siap_diambil', 'diambil']),
            'payment_method' => $this->faker->randomElement(['cash', 'transfer']),
            'payment_status' => $this->faker->randomElement(['pending', 'paid']),
            'payment_proof' => null,
            'paid_at' => null,
        ];
    }

    public function occurredAt(Carbon $dateTime): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $dateTime,
            'updated_at' => $dateTime,
        ]);
    }

    public function withStatus(string $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }

    public function withPaymentMethod(string $paymentMethod, ?string $paymentProof = null): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => $paymentMethod,
            'payment_proof' => $paymentProof,
        ]);
    }

    public function withPaymentStatus(string $paymentStatus, ?Carbon $paidAt = null): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => $paymentStatus,
            'paid_at' => $paymentStatus === 'paid' ? ($paidAt ?? now()) : null,
        ]);
    }

    public function forLaundryService(Service $service, ?int $quantity = null): static
    {
        $quantity ??= $service->unit === 'kg'
            ? $this->faker->numberBetween(2, 10)
            : $this->faker->numberBetween(1, 5);

        return $this->state(fn (array $attributes) => [
            'service_id' => $service->id,
            'quantity' => $quantity,
        ]);
    }
}
