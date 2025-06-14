<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Category;
use App\Notifications\CampaignApproved;
use App\Notifications\CampaignRejected;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = Campaign::with(['user', 'category']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $campaigns = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['campaigns' => $campaigns]);
    }

    public function approve(Campaign $campaign)
    {
        if ($campaign->status !== 'pending') {
            return response()->json(['message' => 'Campaign is not in pending status'], 422);
        }

        $campaign->update(['status' => 'active']);
        
        // Send notification
        $campaign->user->notify(new CampaignApproved($campaign));

        return response()->json(['message' => 'Campaign approved successfully']);
    }

    public function reject(Request $request, Campaign $campaign)
    {
        if ($campaign->status !== 'pending') {
            return response()->json(['message' => 'Campaign is not in pending status'], 422);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $campaign->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        // Send notification
        $campaign->user->notify(new CampaignRejected($campaign, $request->reason));

        return response()->json(['message' => 'Campaign rejected successfully']);
    }
} 