<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CampaignPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Campaign $campaign)
    {
        return $user->role === 'admin' || $user->id === $campaign->organizer_id;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['sponsor', 'admin']);
    }

    public function update(User $user, Campaign $campaign)
    {
        return $user->role === 'admin' || $user->id === $campaign->organizer_id;
    }

    public function delete(User $user, Campaign $campaign)
    {
        return $user->role === 'admin' || $user->id === $campaign->organizer_id;
    }
}