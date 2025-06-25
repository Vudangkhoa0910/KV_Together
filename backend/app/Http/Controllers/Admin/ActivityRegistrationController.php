<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityRegistration;
use App\Notifications\ActivityRegistrationConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class ActivityRegistrationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = ActivityRegistration::with(['activity', 'user']);

        // If not admin, only show registrations for user's activities
        if (!$user->role || $user->role->slug !== 'admin') {
            $userActivityIds = Activity::where('organizer_id', $user->id)->pluck('id');
            $query->whereIn('activity_id', $userActivityIds);
        }

        // Filters
        if ($request->has('activity_id')) {
            $query->where('activity_id', $request->activity_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $registrations = $query->orderBy('registered_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    public function show(ActivityRegistration $registration)
    {
        $user = Auth::user();
        
        // Check permission
        if (!$user->role || $user->role->slug !== 'admin') {
            if ($registration->activity->organizer_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xem đăng ký này.'
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $registration->load(['activity', 'user'])
        ]);
    }

    public function confirm(ActivityRegistration $registration)
    {
        $user = Auth::user();
        
        // Check permission
        if (!$user->role || $user->role->slug !== 'admin') {
            if ($registration->activity->organizer_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xác nhận đăng ký này.'
                ], 403);
            }
        }

        if ($registration->status === 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký này đã được xác nhận trước đó.'
            ], 400);
        }

        try {
            $registration->update([
                'status' => 'confirmed',
                'confirmed_at' => now()
            ]);

            // Send confirmation email
            Notification::route('mail', $registration->email)
                ->notify(new ActivityRegistrationConfirmation($registration));

            return response()->json([
                'success' => true,
                'message' => 'Đã xác nhận đăng ký và gửi email thông báo.',
                'data' => $registration
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xác nhận đăng ký.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancel(ActivityRegistration $registration)
    {
        $user = Auth::user();
        
        // Check permission
        if (!$user->role || $user->role->slug !== 'admin') {
            if ($registration->activity->organizer_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền hủy đăng ký này.'
                ], 403);
            }
        }

        if ($registration->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký này đã được hủy trước đó.'
            ], 400);
        }

        try {
            $registration->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

            // Decrease current participants count
            $registration->activity->decrement('current_participants');

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đăng ký thành công.',
                'data' => $registration
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi hủy đăng ký.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkConfirm(Request $request)
    {
        $user = Auth::user();
        $registrationIds = $request->input('registration_ids', []);

        if (empty($registrationIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Không có đăng ký nào được chọn.'
            ], 400);
        }

        $query = ActivityRegistration::whereIn('id', $registrationIds);

        // If not admin, only allow for user's activities
        if (!$user->role || $user->role->slug !== 'admin') {
            $userActivityIds = Activity::where('organizer_id', $user->id)->pluck('id');
            $query->whereIn('activity_id', $userActivityIds);
        }

        $registrations = $query->where('status', 'pending')->get();

        if ($registrations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Không có đăng ký nào phù hợp để xác nhận.'
            ], 400);
        }

        try {
            foreach ($registrations as $registration) {
                $registration->update([
                    'status' => 'confirmed',
                    'confirmed_at' => now()
                ]);

                // Send confirmation email
                Notification::route('mail', $registration->email)
                    ->notify(new ActivityRegistrationConfirmation($registration));
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã xác nhận ' . $registrations->count() . ' đăng ký và gửi email thông báo.',
                'confirmed_count' => $registrations->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xác nhận đăng ký.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStats(Request $request)
    {
        $user = Auth::user();
        
        $query = ActivityRegistration::query();

        // If not admin, only show stats for user's activities
        if (!$user->role || $user->role->slug !== 'admin') {
            $userActivityIds = Activity::where('organizer_id', $user->id)->pluck('id');
            $query->whereIn('activity_id', $userActivityIds);
        }

        if ($request->has('activity_id')) {
            $query->where('activity_id', $request->activity_id);
        }

        $stats = [
            'total' => $query->count(),
            'pending' => $query->clone()->where('status', 'pending')->count(),
            'confirmed' => $query->clone()->where('status', 'confirmed')->count(),
            'cancelled' => $query->clone()->where('status', 'cancelled')->count(),
            'completed' => $query->clone()->where('status', 'completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
