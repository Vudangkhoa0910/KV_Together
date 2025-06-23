<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if (!auth()->user() || auth()->user()->role->slug !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    /**
     * Get admin dashboard statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'totalUsers' => User::count(),
                'totalCampaigns' => Campaign::count(),
                'totalDonations' => Donation::count(),
                'totalAmount' => Donation::sum('amount'),
                'pendingFundraisers' => User::whereHas('role', function ($query) {
                    $query->where('slug', 'fundraiser');
                })->where('status', 'pending')->count(),
                'pendingCampaigns' => Campaign::where('status', 'pending')->count(),
                'todayStats' => [
                    'newUsers' => User::whereDate('created_at', Carbon::today())->count(),
                    'newDonations' => Donation::whereDate('created_at', Carbon::today())->count(),
                    'newCampaigns' => Campaign::whereDate('created_at', Carbon::today())->count(),
                    'donationAmount' => Donation::whereDate('created_at', Carbon::today())->sum('amount'),
                ],
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch stats'], 500);
        }
    }

    /**
     * Get recent activities
     */
    public function getActivities(): JsonResponse
    {
        try {
            $activities = [];

            // Recent users
            $recentUsers = User::latest()->take(5)->get();
            foreach ($recentUsers as $user) {
                $activities[] = [
                    'id' => 'user_' . $user->id,
                    'type' => 'user_registered',
                    'message' => $user->name . ' đã đăng ký tài khoản',
                    'timestamp' => $user->created_at->toISOString(),
                ];
            }

            // Recent campaigns
            $recentCampaigns = Campaign::latest()->take(5)->get();
            foreach ($recentCampaigns as $campaign) {
                $activities[] = [
                    'id' => 'campaign_' . $campaign->id,
                    'type' => 'campaign_created',
                    'message' => 'Chiến dịch "' . $campaign->title . '" đã được tạo',
                    'timestamp' => $campaign->created_at->toISOString(),
                ];
            }

            // Recent donations
            $recentDonations = Donation::with('campaign', 'user')->latest()->take(5)->get();
            foreach ($recentDonations as $donation) {
                $activities[] = [
                    'id' => 'donation_' . $donation->id,
                    'type' => 'donation_received',
                    'message' => 'Nhận được quyên góp ' . number_format($donation->amount) . ' VND cho chiến dịch "' . $donation->campaign->title . '"',
                    'timestamp' => $donation->created_at->toISOString(),
                ];
            }

            // Sort by timestamp desc
            usort($activities, function ($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });

            return response()->json(array_slice($activities, 0, 10));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch activities'], 500);
        }
    }

    /**
     * Get users with filters
     */
    public function getUsers(Request $request): JsonResponse
    {
        try {
            $query = User::with('role');

            // Apply filters
            if ($request->has('role') && $request->role !== 'all') {
                $query->whereHas('role', function ($q) use ($request) {
                    $q->where('slug', $request->role);
                });
            }

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('search') && !empty($request->search)) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            }

            $users = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }

    /**
     * Approve user
     */
    public function approveUser(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['status' => 'active']);

            return response()->json(['message' => 'User approved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to approve user'], 500);
        }
    }

    /**
     * Suspend user
     */
    public function suspendUser(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            // Don't allow suspending admin users
            if ($user->role->slug === 'admin') {
                return response()->json(['error' => 'Cannot suspend admin users'], 403);
            }

            $user->update(['status' => 'suspended']);

            return response()->json(['message' => 'User suspended successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to suspend user'], 500);
        }
    }

    /**
     * Get campaigns with filters
     */
    public function getCampaigns(Request $request): JsonResponse
    {
        try {
            $query = Campaign::with('user', 'category');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category_id', $request->category);
            }

            if ($request->has('search') && !empty($request->search)) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            $campaigns = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($campaigns);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch campaigns'], 500);
        }
    }

    /**
     * Approve campaign
     */
    public function approveCampaign(Request $request, $id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            $campaign->update(['status' => 'active']);

            return response()->json(['message' => 'Campaign approved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to approve campaign'], 500);
        }
    }

    /**
     * Reject campaign
     */
    public function rejectCampaign(Request $request, $id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            $campaign->update([
                'status' => 'rejected',
                'rejection_reason' => $request->input('reason', 'No reason provided')
            ]);

            return response()->json(['message' => 'Campaign rejected successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to reject campaign'], 500);
        }
    }

    /**
     * Get donations with filters
     */
    public function getDonations(Request $request): JsonResponse
    {
        try {
            $query = Donation::with('user', 'campaign');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('search') && !empty($request->search)) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                })->orWhereHas('campaign', function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%');
                });
            }

            $donations = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($donations);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch donations'], 500);
        }
    }

    /**
     * Get analytics data
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            // Get date range
            $startDate = $request->input('start_date', Carbon::now()->subMonth());
            $endDate = $request->input('end_date', Carbon::now());

            // Daily donations chart data
            $dailyDonations = Donation::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as total')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

            // Campaign categories statistics
            $categoryStats = Campaign::select('categories.name', DB::raw('COUNT(*) as count'))
                ->join('categories', 'campaigns.category_id', '=', 'categories.id')
                ->groupBy('categories.id', 'categories.name')
                ->get();

            // Top fundraisers
            $topFundraisers = User::select('users.*', DB::raw('COUNT(campaigns.id) as campaign_count'), DB::raw('SUM(donations.amount) as total_raised'))
                ->join('campaigns', 'users.id', '=', 'campaigns.user_id')
                ->join('donations', 'campaigns.id', '=', 'donations.campaign_id')
                ->whereHas('role', function ($query) {
                    $query->where('slug', 'fundraiser');
                })
                ->groupBy('users.id')
                ->orderBy('total_raised', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'daily_donations' => $dailyDonations,
                'category_stats' => $categoryStats,
                'top_fundraisers' => $topFundraisers,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch analytics'], 500);
        }
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'role_id' => 'required|exists:roles,id'
            ]);

            $user = User::findOrFail($id);
            
            // Don't allow changing admin role of current user
            if ($user->id === auth()->id() && $request->role_id != $user->role_id) {
                return response()->json(['error' => 'Cannot change your own role'], 403);
            }

            $user->update(['role_id' => $request->role_id]);

            return response()->json(['message' => 'User role updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update user role'], 500);
        }
    }

    /**
     * Get news with filters
     */
    public function getNews(Request $request): JsonResponse
    {
        try {
            $query = News::with('user');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            if ($request->has('search') && !empty($request->search)) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('content', 'like', '%' . $request->search . '%');
                });
            }

            $news = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($news);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch news'], 500);
        }
    }

    /**
     * Publish news
     */
    public function publishNews(Request $request, $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);
            $news->update(['status' => 'published']);

            return response()->json(['message' => 'News published successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to publish news'], 500);
        }
    }

    /**
     * Archive news
     */
    public function archiveNews(Request $request, $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);
            $news->update(['status' => 'archived']);

            return response()->json(['message' => 'News archived successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to archive news'], 500);
        }
    }

    /**
     * Delete news
     */
    public function deleteNews(Request $request, $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);
            $news->delete();

            return response()->json(['message' => 'News deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete news'], 500);
        }
    }
}
