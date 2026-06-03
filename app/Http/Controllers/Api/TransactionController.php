<?php

namespace App\Http\Controllers\Api;

use App\Models\Transactions;
use Illuminate\Http\Request;

class TransactionController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return $this->error('Authenticated customer not found.', 404);
        }

        $transactions = $customer
            ->transactions()
            ->with('service')
            ->latest()
            ->get();

        return $this->success($transactions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Transactions $transaction)
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return $this->error('Authenticated customer not found.', 404);
        }

        if ($transaction->customer_id !== $customer->id) {
            return $this->error('Transaction does not belong to authenticated customer.', 403);
        }

        return $this->success($transaction->load([
            'service',
            'customer.user',
        ]));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
