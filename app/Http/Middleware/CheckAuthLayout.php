<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class CheckAuthLayout
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('login') || $request->is('register') || $request->is('password/*')) {
            View::share('layout', 'layouts.auth');
            return $next($request)->withoutCookie('intended');
        }
        
        return $next($request);
    }
}
