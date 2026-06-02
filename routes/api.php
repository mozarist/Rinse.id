<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'role:customer'])
->group(function () {

    Route::get('/me', [ProfileController::class, 'me']);

    Route::get(
        '/transactions',
        [TransactionController::class, 'index']
    );

    Route::get(
        '/transactions/{transaction}',
        [TransactionController::class, 'show']
    );

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );
});
