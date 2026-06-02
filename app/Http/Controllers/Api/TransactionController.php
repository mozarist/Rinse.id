<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transactions;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $transactions =
            Transactions::with([
                'service',
                'customer.user'
            ])
                ->where(
                    'customer_id',
                    $request->user()->customer->id
                )
                ->latest()
                ->get();

        return response()->json([
            'data' => $transactions
        ]);
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
    public function show(Request $request, Transactions $transaction) {
        if (
            $transaction->customer_id !==
            $request->user()->customer->id
        ) {
            abort(403);
        }

        return response()->json([
            'data' => $transaction->load([
                'service',
                'customer.user'
            ]),
        ]);
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
