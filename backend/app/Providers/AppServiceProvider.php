<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share default layout with all views
        View::composer(['auth.login', 'auth.register'], function ($view) {
            if (!$view->hasAttribute('layout')) {
                $view->with('layout', 'layouts.auth');
            }
        });

        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
