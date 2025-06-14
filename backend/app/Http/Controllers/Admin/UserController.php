<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Notifications\FundraiserApproved;
use App\Notifications\FundraiserRejected;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role');

        // Filter by role
        if ($request->has('role') && $request->role !== 'all') {
            $role = Role::where('slug', $request->role)->first();
            if ($role) {
                $query->where('role_id', $role->id);
            }
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['users' => $users]);
    }

    public function approve(User $user)
    {
        if ($user->status !== 'pending') {
            return response()->json(['message' => 'User is not in pending status'], 422);
        }

        $user->update(['status' => 'active']);
        
        // Send notification
        $user->notify(new FundraiserApproved());

        return response()->json(['message' => 'User approved successfully']);
    }

    public function reject(Request $request, User $user)
    {
        if ($user->status !== 'pending') {
            return response()->json(['message' => 'User is not in pending status'], 422);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        // Send notification
        $user->notify(new FundraiserRejected($request->reason));

        return response()->json(['message' => 'User rejected successfully']);
    }
} 