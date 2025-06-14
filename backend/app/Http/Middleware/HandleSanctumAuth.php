<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\Sanctum;

class HandleSanctumAuth
{
    public function handle(Request $request, Closure $next)
    {
        // For API routes that require authentication
        if (!auth()->check() && $request->bearerToken()) {
            // Validate the token
            $model = Sanctum::$personalAccessTokenModel;
            $accessToken = $model::findToken($request->bearerToken());

            if (!$accessToken || $this->tokenExpired($accessToken)) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        }

        return $next($request);
    }

    private function tokenExpired($accessToken): bool
    {
        if (!$accessToken->expires_at) {
            return false;
        }

        return $accessToken->expires_at->isPast();
    }
}
