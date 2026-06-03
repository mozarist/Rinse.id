<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

abstract class ApiController extends Controller
{
    protected function success(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
        ], $status);
    }

    protected function error(array|string $errors, int $status = 400): JsonResponse
    {
        return response()->json([
            'errors' => is_array($errors) ? $errors : ['message' => $errors],
        ], $status);
    }
}
