<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CampaignPolicy
{
    /**
     * Determine whether the user can view any campaigns.
     */
    public function viewAny(?User $user): bool
    {
        return true; // Everyone can view campaigns list
    }

    /**
     * Determine whether the user can view the campaign.
     */
    public function view(?User $user, Campaign $campaign): bool
    {
        return true; // Everyone can view campaign details
    }

    /**
     * Determine whether the user can create campaigns.
     */
    public function create(User $user): bool
    {
        // Only approved fundraisers can create campaigns
        return $user->role?->slug === 'fundraiser' && $user->status === 'active';
    }

    /**
     * Determine whether the user can update the campaign.
     */
    public function update(User $user, Campaign $campaign): bool
    {
        // Only campaign owner can update if they are still an active fundraiser
        return $user->id === $campaign->organizer_id 
            && $user->role?->slug === 'fundraiser' 
            && $user->status === 'active';
    }

    /**
     * Determine whether the user can delete the campaign.
     */
    public function delete(User $user, Campaign $campaign): bool
    {
        // Only campaign owner can delete if they are still an active fundraiser
        return $user->id === $campaign->organizer_id 
            && $user->role?->slug === 'fundraiser' 
            && $user->status === 'active';
    }

    /**
     * Determine whether the user can donate to the campaign.
     */
    public function donate(User $user, Campaign $campaign): bool
    {
        // Allow both active users and pending fundraisers to donate
        return $user->status === 'active' || 
               ($user->role?->slug === 'fundraiser' && $user->status === 'pending');
    }

    /**
     * Determine whether the user can approve the campaign.
     */
    public function approve(User $user, Campaign $campaign): bool
    {
        // Only admins can approve campaigns
        return $user->role?->slug === 'admin';
    }

    /**
     * Determine whether the user can reject the campaign.
     */
    public function reject(User $user, Campaign $campaign): bool
    {
        // Only admins can reject campaigns
        return $user->role?->slug === 'admin';
    }

    public function viewAnalytics(User $user, Campaign $campaign): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isFundraiser() && $campaign->organizer_id === $user->id;
    }
}