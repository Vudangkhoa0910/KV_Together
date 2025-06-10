<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\FundraiserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Register request received', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:user,fundraiser',
            'address' => 'nullable|string|max:255',
            'id_card' => 'nullable|string|max:50',
            'registration_reason' => 'nullable|string',
            'fundraiser_type' => 'required_if:role,fundraiser|in:personal,organization',
            'organization_name' => 'required_if:fundraiser_type,organization|string|max:255',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            Log::info('Starting user creation with data:', [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->role === 'fundraiser' ? 'pending' : 'active',
                'address' => $request->address,
                'id_card' => $request->id_card,
                'registration_reason' => $request->registration_reason,
                'fundraiser_type' => $request->fundraiser_type,
            ]);

            if ($request->role === 'fundraiser' && $request->fundraiser_type === 'organization') {
                FundraiserProfile::create([
                    'user_id' => $user->id,
                    'organization_name' => $request->organization_name,
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Registration successful', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Registration successful',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'sql' => $e instanceof \Illuminate\Database\QueryException ? $e->getSql() : null,
                'bindings' => $e instanceof \Illuminate\Database\QueryException ? $e->getBindings() : null,
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'exception_class' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
                'details' => env('APP_DEBUG') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'sql_error' => $e instanceof \Illuminate\Database\QueryException ? $e->getMessage() : null
                ] : null
            ], 500);
        }
    }
}
