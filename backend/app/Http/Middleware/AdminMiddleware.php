<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role->slug !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}