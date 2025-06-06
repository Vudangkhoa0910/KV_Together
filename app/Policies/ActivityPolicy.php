<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ActivityPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Activity $activity)
    {
        return true;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['sponsor', 'admin']);
    }

    public function update(User $user, Activity $activity)
    {
        return $user->role === 'admin' || $user->id === $activity->organizer_id;
    }

    public function delete(User $user, Activity $activity)
    {
        return $user->role === 'admin' || $user->id === $activity->organizer_id;
    }
}