<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityRegistration;
use App\Notifications\ActivityRegistrationConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;

class ActivityRegistrationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = Auth::user();
        
        $registrations = ActivityRegistration::with('activity')
            ->where('user_id', $user->id)
            ->orderBy('registered_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $registrations
        ]);
    }

    public function store(Request $request, Activity $activity)
    {
        $user = Auth::user();

        // Check if activity exists and is published
        if ($activity->status !== 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Hoạt động này không khả dụng để đăng ký.'
            ], 400);
        }

        // Check if registration deadline has passed
        if ($activity->registration_deadline && now() > $activity->registration_deadline) {
            return response()->json([
                'success' => false,
                'message' => 'Đã hết hạn đăng ký cho hoạt động này.'
            ], 400);
        }

        // Check if activity is full
        if ($activity->is_full) {
            return response()->json([
                'success' => false,
                'message' => 'Hoạt động này đã đủ số lượng người tham gia.'
            ], 400);
        }

        // Check if user already registered
        $existingRegistration = ActivityRegistration::where('activity_id', $activity->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã đăng ký hoạt động này rồi.',
                'registration' => $existingRegistration
            ], 400);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create registration
            $registration = ActivityRegistration::create([
                'activity_id' => $activity->id,
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'notes' => $request->notes,
                'amount_paid' => 0,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            // Update current participants count
            $activity->increment('current_participants');

            // Send email notification
            \Log::info('Attempting to send email notification to: ' . $registration->email);
            
            try {
                Notification::route('mail', $registration->email)
                    ->notify(new ActivityRegistrationConfirmation($registration));
                
                \Log::info('Email notification sent successfully to: ' . $registration->email);
            } catch (\Exception $emailError) {
                \Log::error('Failed to send email notification: ' . $emailError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký thành công! Kiểm tra email để xem thông tin chi tiết.',
                'data' => $registration->load('activity')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(ActivityRegistration $registration)
    {
        $user = Auth::user();

        if ($registration->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem đăng ký này.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $registration->load(['activity', 'user'])
        ]);
    }

    public function cancel(ActivityRegistration $registration)
    {
        $user = Auth::user();

        if ($registration->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền hủy đăng ký này.'
            ], 403);
        }

        if ($registration->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký này đã được hủy trước đó.'
            ], 400);
        }

        // Check if can still cancel (e.g., not too close to event date)
        $activity = $registration->activity;
        if ($activity->event_date && now()->addDays(1) > $activity->event_date) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy đăng ký trong vòng 24 giờ trước sự kiện.'
            ], 400);
        }

        try {
            $registration->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

            // Decrease current participants count
            $activity->decrement('current_participants');

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đăng ký thành công.',
                'data' => $registration
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi hủy đăng ký. Vui lòng thử lại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkRegistration(Activity $activity)
    {
        $user = Auth::user();
        
        $registration = ActivityRegistration::where('activity_id', $activity->id)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'is_registered' => !!$registration,
            'registration' => $registration
        ]);
    }
}
