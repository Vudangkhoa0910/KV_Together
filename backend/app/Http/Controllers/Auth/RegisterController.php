<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\FundraiserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:user,fundraiser',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->role === 'fundraiser' ? 'pending' : 'active',
        ]);

        if ($request->role === 'fundraiser') {
            $fundraiserValidator = Validator::make($request->all(), [
                'organization_name' => 'required|string|max:255',
                'organization_type' => 'required|string|max:255',
                'tax_id' => 'nullable|string|max:50',
                'verification_documents' => 'required|array',
                'website' => 'nullable|url',
                'description' => 'required|string',
            ]);

            if ($fundraiserValidator->fails()) {
                $user->delete();
                return response()->json(['errors' => $fundraiserValidator->errors()], 422);
            }

            FundraiserProfile::create([
                'user_id' => $user->id,
                'organization_name' => $request->organization_name,
                'organization_type' => $request->organization_type,
                'tax_id' => $request->tax_id,
                'verification_documents' => $request->verification_documents,
                'website' => $request->website,
                'description' => $request->description,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token,
        ], 201);
    }
}
