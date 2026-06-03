<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

class ProfileController extends ApiController
{
    public function me(Request $request)
    {
        $user = $request->user();

        if (! $user->relationLoaded('customer')) {
            $user->load('customer');
        }

        if (! $user->customer) {
            return $this->error('Customer profile not found.', 404);
        }

        return $this->success($user);
    }
}
