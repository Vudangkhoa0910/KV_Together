<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        'App\Models\Campaign' => 'App\Policies\CampaignPolicy',
        'App\Models\Activity' => 'App\Policies\ActivityPolicy',
        'App\Models\News' => 'App\Policies\NewsPolicy',
        'App\Models\Blog' => 'App\Policies\BlogPolicy',
        'App\Models\Notification' => 'App\Policies\NotificationPolicy',
        'App\Models\Category' => 'App\Policies\CategoryPolicy',
    ];

    public function boot()
    {
        $this->registerPolicies();

        // Định nghĩa view path cho auth
        view()->addLocation(resource_path('views/auth'));
    }
}