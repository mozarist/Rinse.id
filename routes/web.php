<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Customers
    Route::resource('customers', CustomerController::class)->only(['index', 'store', 'update', 'destroy']);

    // Services
    Route::resource('services', ServiceController::class)->only(['index', 'store', 'update', 'destroy']);

    // Transactions
    Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
