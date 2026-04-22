<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

abstract class Controller
{
    use AuthorizesRequests;

    protected function perPage(Request $request, int $default = 15, int $max = 50): int
    {
        return max(1, min($request->integer('per_page', $default), $max));
    }
}
