<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Donation;
use Illuminate\Auth\Access\HandlesAuthorization;

class DonationPolicy
{
    use HandlesAuthorization;

    /**
     * Xác định xem user có thể xem donation hay không
     */
    public function view(User $user, Donation $donation)
    {
        return $user->id === $donation->user_id || 
               $user->id === $donation->campaign->organizer_id ||
               $user->isAdmin();
    }

    /**
     * Xác định xem user có thể tạo donation hay không
     */
    public function create(User $user)
    {
        return $user->status === 'active';
    }

    /**
     * Xác định xem user có thể hủy donation hay không
     */
    public function cancel(User $user, Donation $donation)
    {
        return $user->id === $donation->user_id && 
               $donation->status === 'pending';
    }

    /**
     * Xác định xem user có thể tải xuống biên lai hay không
     */
    public function downloadReceipt(User $user, Donation $donation)
    {
        return $user->id === $donation->user_id && 
               $donation->status === 'completed';
    }

    /**
     * Xác định xem user có thể xác minh donation hay không
     */
    public function verify(User $user, Donation $donation)
    {
        return $user->isAdmin() && 
               $donation->status === 'pending' &&
               $donation->payment_method === 'bank_transfer';
    }
}
