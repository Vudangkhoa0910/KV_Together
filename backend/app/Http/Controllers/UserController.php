<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Hiển thị dashboard của user
     */
    public function dashboard()
    {
        $user = Auth::user();
        $donations = $user->donations()
            ->with('campaign')
            ->latest()
            ->take(5)
            ->get();
            
        $totalDonated = $user->donations()->sum('amount');
        $activeCampaigns = Campaign::active()->latest()->take(4)->get();
        
        return response()->json([
            'user' => $user,
            'recent_donations' => $donations,
            'total_donated' => $totalDonated,
            'active_campaigns' => $activeCampaigns
        ]);
    }

    /**
     * Lấy danh sách donations của user
     */
    public function donations(Request $request)
    {
        $user = Auth::user();
        $donations = $user->donations()
            ->with('campaign')
            ->latest()
            ->paginate(10);
            
        return response()->json($donations);
    }

    /**
     * Cập nhật thông tin profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone,'.$user->id,
            'address' => 'nullable|string|max:255', 
            'bio' => 'nullable|string',
            'avatar' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user' => $user
        ]);
    }

    /**
     * Cập nhật cấu hình thông báo
     */
    public function updateNotificationSettings(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'email_notifications' => 'required|boolean',
            'push_notifications' => 'required|boolean'
        ]);

        $user->update([
            'notification_preferences' => $validated
        ]);

        return response()->json([
            'message' => 'Cập nhật cấu hình thông báo thành công',
            'settings' => $validated
        ]);
    }
}
