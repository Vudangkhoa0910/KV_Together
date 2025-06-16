<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ActivityPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user)
    {
        // Anyone can view published activities
        return true;
    }

    public function view(?User $user, Activity $activity)
    {
        // Anyone can view published activities
        if ($activity->status === 'published') {
            return true;
        }

        // Only author and admin can view draft activities
        return $user && ($user->isAdmin() || $user->id === $activity->organizer_id);
    }

    public function create(User $user)
    {
        // Users, fundraisers and admin can create activities
        return in_array($user->role->slug, ['user', 'fundraiser', 'admin']);
    }

    public function update(User $user, Activity $activity)
    {
        // Admin or the organizer can update
        return $user->isAdmin() || $user->id === $activity->organizer_id;
    }

    public function delete(User $user, Activity $activity)
    {
        // Admin or the organizer can delete
        return $user->isAdmin() || $user->id === $activity->organizer_id;
    }

    public function setFeatured(User $user, Activity $activity)
    {
        // Only admin and fundraiser can set featured
        return in_array($user->role->slug, ['admin', 'fundraiser']);
    }

    public function publish(User $user, Activity $activity)
    {
        // Admin, fundraiser or the organizer can publish
        return $user->isAdmin() || 
               $user->role->slug === 'fundraiser' || 
               $user->id === $activity->organizer_id;
    }

    public function moderate(User $user)
    {
        // Only admin and fundraiser can moderate
        return in_array($user->role->slug, ['admin', 'fundraiser']);
    }
}