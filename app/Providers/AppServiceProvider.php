<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

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
    }
}
