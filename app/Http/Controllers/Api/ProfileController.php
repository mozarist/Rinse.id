<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request)
{
    $user = $request->user()->load('customer');

    return response()->json([
        'data' => $user,
    ]);
}
}
