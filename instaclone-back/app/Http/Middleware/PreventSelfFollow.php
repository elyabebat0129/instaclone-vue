<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventSelfFollow
{
    public function handle(Request $request, Closure $next): Response
    {
        $target = $request->route('user');
        $targetId = $target instanceof User ? $target->getKey() : (int) $target;

        if ($request->user()?->getKey() === $targetId) {
            return response()->json(
                ['message' => 'You cannot follow yourself.'],
                422,
            );
        }

        return $next($request);
    }
}
