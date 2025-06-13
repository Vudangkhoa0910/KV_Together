<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\FundraiserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Register request received', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'user_type' => 'required|in:user,fundraiser',
            'address' => 'required_if:user_type,fundraiser|string|max:255',
            'id_card' => 'required_if:user_type,fundraiser|string|max:50',
            'registration_reason' => 'required_if:user_type,fundraiser|string',
            'fundraiser_type' => 'required_if:user_type,fundraiser|in:personal,organization',
            'organization_name' => 'required_if:fundraiser_type,organization|string|max:255',
        ], [
            'name.required' => 'Họ và tên là bắt buộc',
            'email.required' => 'Email là bắt buộc',
            'email.email' => 'Email không hợp lệ',
            'email.unique' => 'Email đã được sử dụng',
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.unique' => 'Số điện thoại đã được sử dụng',
            'password.required' => 'Mật khẩu là bắt buộc',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
            'password.confirmed' => 'Mật khẩu xác nhận không khớp',
            'address.required_if' => 'Địa chỉ là bắt buộc đối với người gây quỹ',
            'id_card.required_if' => 'CCCD/CMND là bắt buộc đối với người gây quỹ',
            'registration_reason.required_if' => 'Lý do đăng ký là bắt buộc đối với người gây quỹ',
            'organization_name.required_if' => 'Tên tổ chức là bắt buộc',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get appropriate role
            $role = Role::where('slug', $request->user_type)->firstOrFail();

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role_id' => $role->id,
                'status' => $request->user_type === 'fundraiser' ? 'pending' : 'active',
                'address' => $request->address,
                'id_card' => $request->id_card,
                'registration_reason' => $request->registration_reason,
                'fundraiser_type' => $request->fundraiser_type,
            ]);

            // Create fundraiser profile if needed
            if ($request->user_type === 'fundraiser' && $request->fundraiser_type === 'organization') {
                FundraiserProfile::create([
                    'user_id' => $user->id,
                    'organization_name' => $request->organization_name,
                ]);
            }

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            Log::info('Registration successful', ['user_id' => $user->id]);

            return response()->json([
                'message' => $request->user_type === 'fundraiser' 
                    ? 'Đăng ký thành công. Tài khoản của bạn đang chờ phê duyệt.' 
                    : 'Đăng ký thành công',
                'user' => $user,
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Đăng ký thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
