<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        Log::info('Login attempt', ['email' => $request->email]);

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ], [
                'email.required' => 'Email là bắt buộc',
                'email.email' => 'Email không hợp lệ',
                'password.required' => 'Mật khẩu là bắt buộc',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Email hoặc mật khẩu không chính xác'],
                ]);
            }

            // Only block inactive and rejected users
            if ($user->status === 'inactive') {
                throw ValidationException::withMessages([
                    'email' => ['Tài khoản của bạn đã bị vô hiệu hóa'],
                ]);
            }

            if ($user->status === 'rejected') {
                throw ValidationException::withMessages([
                    'email' => ['Tài khoản của bạn đã bị từ chối'],
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Login successful', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Đăng nhập thành công',
                'user' => $user,
                'token' => $token,
            ]);

        } catch (ValidationException $e) {
            Log::error('Login validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Đăng nhập thất bại',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại sau',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ]);
    }
}
