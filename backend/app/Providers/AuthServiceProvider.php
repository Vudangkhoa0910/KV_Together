<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        'App\Models\Campaign' => 'App\Policies\CampaignPolicy',
        'App\Models\Activity' => 'App\Policies\ActivityPolicy',
        'App\Models\News' => 'App\Policies\NewsPolicy',
        'App\Models\Blog' => 'App\Policies\BlogPolicy',
        'App\Models\Notification' => 'App\Policies\NotificationPolicy',
        'App\Models\Category' => 'App\Policies\CategoryPolicy',
        'App\Models\Donation' => 'App\Policies\DonationPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Định nghĩa view path cho auth
        view()->addLocation(resource_path('views/auth'));

        Gate::define('admin', function ($user) {
            return $user->isAdmin();
        });

        Gate::define('fundraiser', function ($user) {
            return $user->isFundraiser();
        });
    }
}