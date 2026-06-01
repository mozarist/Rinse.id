<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Service;
use App\Models\Transactions;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $paidTransactions = Transactions::query()
            ->with(['service'])
            ->where('payment_status', 'paid')
            ->orderBy('paid_at')
            ->get(['id', 'service_id', 'total_price', 'paid_at', 'created_at']);

        $recentTransactions = $this->mapTransactions(
            Transactions::query()
                ->with(['customer.user', 'service'])
                ->latest()
                ->take(5)
                ->get(),
        );

        return Inertia::render('dashboard', [
            'summary' => [
                'totalTransactions' => Transactions::count(),
                'totalRevenue' => (float) Transactions::where('payment_status', 'paid')->sum('total_price'),
                'pendingPayments' => Transactions::where('payment_status', 'pending')->count(),
                'activeCustomers' => Customer::count(),
            ],
            'recentTransactions' => $recentTransactions,
            'revenueChart' => $this->buildRevenueChart($paidTransactions),
            'customers' => Customer::select('id', 'user_id')->with('user:id,name')->get(),
            'services' => Service::select('id', 'service_name', 'price', 'unit')->get(),
        ]);
    }

    /**
     * @param  Collection<int, Transactions>  $transactions
     * @return array<int, array<string, mixed>>
     */
    private function mapTransactions(Collection $transactions): array
    {
        return $transactions->map(function (Transactions $transaction): array {
            return [
                'id' => $transaction->id,
                'invoice_code' => $transaction->invoice_code,
                'quantity' => $transaction->quantity,
                'total_price' => (float) $transaction->total_price,
                'payment_method' => $transaction->payment_method,
                'payment_status' => $transaction->payment_status,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at?->toIso8601String(),
                'customer' => [
                    'id' => $transaction->customer?->id,
                    'user' => [
                        'id' => $transaction->customer?->user?->id,
                        'name' => $transaction->customer?->user?->name,
                    ],
                ],
                'service' => [
                    'id' => $transaction->service?->id,
                    'service_name' => $transaction->service?->service_name,
                    'unit' => $transaction->service?->unit,
                ],
            ];
        })->all();
    }

    /**
     * @param  Collection<int, Transactions>  $transactions
     * @return array{
     *     categories: array<int, array{key: string, label: string}>,
     *     data: array<int, array<string, float|int|string>>
     * }
     */
    private function buildRevenueChart(Collection $transactions): array
    {
        if ($transactions->isEmpty()) {
            return [
                'categories' => [],
                'data' => [],
            ];
        }

        $categories = $transactions
            ->map(function (Transactions $transaction): ?array {
                $service = $transaction->service;

                if (! $service?->id) {
                    return null;
                }

                return [
                    'key' => $this->revenueCategoryKey($transaction),
                    'label' => $service->service_name ?? 'Unknown Service',
                ];
            })
            ->filter()
            ->unique('key')
            ->sortBy('label')
            ->values()
            ->all();

        $transactionsByDay = $transactions->groupBy(function (Transactions $transaction): string {
            return $transaction->paid_at?->toDateString()
                ?? $transaction->created_at?->toDateString()
                ?? now()->toDateString();
        });

        $periodStart = CarbonImmutable::parse($transactionsByDay->keys()->min());
        $periodEnd = CarbonImmutable::parse($transactionsByDay->keys()->max());
        $period = CarbonPeriod::create($periodStart, '1 day', $periodEnd);

        $data = [];

        foreach ($period as $date) {
            $dateKey = $date->toDateString();
            $row = [
                'date' => $dateKey,
            ];

            foreach ($categories as $category) {
                $row[$category['key']] = 0.0;
                $row[$category['key'].'Transactions'] = 0;
            }

            $dayTransactions = $transactionsByDay->get($dateKey, collect());
            $row['totalRevenue'] = (float) $dayTransactions->sum('total_price');

            foreach ($dayTransactions->groupBy(fn (Transactions $transaction): string => $this->revenueCategoryKey($transaction)) as $categoryKey => $categoryTransactions) {
                $row[$categoryKey] = (float) $categoryTransactions->sum('total_price');
                $row[$categoryKey.'Transactions'] = $categoryTransactions->count();
            }

            $data[] = $row;
        }

        return [
            'categories' => $categories,
            'data' => $data,
        ];
    }

    private function revenueCategoryKey(Transactions $transaction): string
    {
        return 'service-'.$transaction->service_id;
    }
}
