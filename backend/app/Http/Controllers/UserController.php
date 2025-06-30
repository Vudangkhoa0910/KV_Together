<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
            ->get()
            ->map(function ($donation) {
                return [
                    'id' => $donation->id,
                    'amount' => $donation->amount,
                    'status' => $donation->status,
                    'payment_method' => $donation->payment_method,
                    'created_at' => $donation->created_at,
                    'campaign' => $donation->campaign ? [
                        'id' => $donation->campaign->id,
                        'title' => $donation->campaign->title,
                        'slug' => $donation->campaign->slug,
                    ] : null
                ];
            });
            
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
        
        $query = $user->donations()->with('campaign');
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        $donations = $query->latest()->paginate(10);
        
        // Transform data để đảm bảo campaign luôn có giá trị hoặc null rõ ràng
        $donations->getCollection()->transform(function ($donation) {
            return [
                'id' => $donation->id,
                'amount' => $donation->amount,
                'message' => $donation->message,
                'status' => $donation->status,
                'payment_method' => $donation->payment_method,
                'transaction_id' => $donation->transaction_id,
                'is_anonymous' => $donation->is_anonymous,
                'created_at' => $donation->created_at,
                'updated_at' => $donation->updated_at,
                'campaign' => $donation->campaign ? [
                    'id' => $donation->campaign->id,
                    'title' => $donation->campaign->title,
                    'slug' => $donation->campaign->slug,
                    'status' => $donation->campaign->status,
                ] : null
            ];
        });
            
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
     * Đổi mật khẩu
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Kiểm tra mật khẩu hiện tại
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không chính xác'
            ], 403);
        }

        // Cập nhật mật khẩu mới
        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
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

    /**
     * Lấy danh sách donations cho admin
     */
    public function adminDonations(Request $request)
    {
        $query = Donation::with(['campaign', 'user']);
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by payment method if provided
        if ($request->has('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }
        
        // Search by campaign title or user name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('campaign', function($cq) use ($search) {
                    $cq->where('title', 'like', "%{$search}%");
                })->orWhereHas('user', function($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                });
            });
        }
        
        $donations = $query->latest()->paginate(15);
        
        // Transform data để đảm bảo campaign và user luôn có giá trị rõ ràng
        $donations->getCollection()->transform(function ($donation) {
            return [
                'id' => $donation->id,
                'amount' => $donation->amount,
                'message' => $donation->message,
                'status' => $donation->status,
                'payment_method' => $donation->payment_method,
                'transaction_id' => $donation->transaction_id,
                'is_anonymous' => $donation->is_anonymous,
                'created_at' => $donation->created_at,
                'updated_at' => $donation->updated_at,
                'campaign' => $donation->campaign ? [
                    'id' => $donation->campaign->id,
                    'title' => $donation->campaign->title,
                    'slug' => $donation->campaign->slug,
                    'status' => $donation->campaign->status,
                ] : null,
                'user' => $donation->user ? [
                    'id' => $donation->user->id,
                    'name' => $donation->user->name,
                    'email' => $donation->user->email,
                ] : null
            ];
        });
            
        return response()->json($donations);
    }
}
