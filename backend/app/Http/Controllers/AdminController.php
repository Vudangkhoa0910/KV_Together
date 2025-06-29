<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\News;
use App\Models\Activity;
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
     * Get recent activities for dashboard
     */
    public function getRecentActivities(): JsonResponse
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
            $query = Campaign::with('organizer', 'categories');

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('category') && $request->category !== 'all') {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
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
            $range = $request->input('range', 'year'); // year, month, week
            $startDate = match($range) {
                'week' => Carbon::now()->startOfWeek()->subWeeks(11),
                'month' => Carbon::now()->startOfMonth()->subMonths(11),
                'year' => Carbon::now()->startOfYear()->subYears(4),
                default => Carbon::now()->startOfYear()->subYears(4),
            };

            // Donation Analytics
            $donationStats = [
                'totalAmount' => Donation::where('status', 'completed')->sum('amount'),
                'totalCount' => Donation::where('status', 'completed')->count(),
                'averageAmount' => Donation::where('status', 'completed')->avg('amount'),
                'monthlyDonations' => $this->getMonthlyDonations($startDate, $range),
                'topDonors' => $this->getTopDonors(),
                'paymentMethodDistribution' => $this->getPaymentMethodDistribution(),
            ];

            // Campaign Analytics
            $campaignStats = [
                'totalCampaigns' => Campaign::count(),
                'activeCampaigns' => Campaign::where('status', 'active')->count(),
                'completedCampaigns' => Campaign::where('status', 'completed')->count(),
                'successRate' => $this->getCampaignSuccessRate(),
                'categoryDistribution' => $this->getCategoryDistribution(),
                'monthlyCreated' => $this->getMonthlyCampaigns($startDate, $range),
                'averageGoalAmount' => Campaign::avg('target_amount'),
                'averageRaisedAmount' => Campaign::avg('current_amount'),
            ];

            // User Analytics
            $userStats = [
                'totalUsers' => User::count(),
                'totalFundraisers' => User::whereHas('role', function($q) {
                    $q->where('slug', 'fundraiser');
                })->count(),
                'totalDonors' => User::whereHas('donations')->count(),
                'monthlyRegistrations' => $this->getMonthlyUserRegistrations($startDate, $range),
                'usersByRole' => $this->getUsersByRole(),
                'verificationStatus' => $this->getUserVerificationStatus(),
            ];

            // Platform Performance
            $platformStats = [
                'totalFundsRaised' => Donation::where('status', 'completed')->sum('amount'),
                'platformGrowth' => $this->getPlatformGrowthRate($range),
                'engagementMetrics' => $this->getEngagementMetrics(),
                'conversionRate' => $this->getConversionRate(),
            ];

            return response()->json([
                'donations' => $donationStats,
                'campaigns' => $campaignStats,
                'users' => $userStats,
                'platform' => $platformStats,
                'timeRange' => $range,
                'lastUpdated' => Carbon::now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch analytics data'], 500);
        }
    }

    private function getMonthlyDonations($startDate, $range)
    {
        $format = match($range) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            'year' => '%Y',
            default => '%Y-%m',
        };

        return Donation::selectRaw("
            DATE_FORMAT(created_at, '$format') as period,
            SUM(amount) as amount,
            COUNT(*) as count
        ")
        ->where('created_at', '>=', $startDate)
        ->where('status', 'completed')
        ->groupBy('period')
        ->orderBy('period')
        ->get()
        ->map(function ($item) use ($range) {
            return [
                'period' => $item->period,
                'amount' => (float) $item->amount,
                'count' => (int) $item->count,
                'label' => $this->formatPeriodLabel($item->period, $range)
            ];
        });
    }

    private function getMonthlyCampaigns($startDate, $range)
    {
        $format = match($range) {
            'week' => '%Y-%u',
            'month' => '%Y-%m', 
            'year' => '%Y',
            default => '%Y-%m',
        };

        return Campaign::selectRaw("
            DATE_FORMAT(created_at, '$format') as period,
            COUNT(*) as count
        ")
        ->where('created_at', '>=', $startDate)
        ->groupBy('period')
        ->orderBy('period')
        ->get()
        ->map(function ($item) use ($range) {
            return [
                'period' => $item->period,
                'count' => (int) $item->count,
                'label' => $this->formatPeriodLabel($item->period, $range)
            ];
        });
    }

    private function getMonthlyUserRegistrations($startDate, $range)
    {
        $format = match($range) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            'year' => '%Y', 
            default => '%Y-%m',
        };

        return User::selectRaw("
            DATE_FORMAT(created_at, '$format') as period,
            COUNT(*) as users,
            COUNT(CASE WHEN roles.slug = 'fundraiser' THEN 1 END) as fundraisers
        ")
        ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
        ->where('users.created_at', '>=', $startDate)
        ->groupBy('period')
        ->orderBy('period')
        ->get()
        ->map(function ($item) use ($range) {
            return [
                'period' => $item->period,
                'users' => (int) $item->users,
                'fundraisers' => (int) $item->fundraisers,
                'label' => $this->formatPeriodLabel($item->period, $range)
            ];
        });
    }

    private function getTopDonors()
    {
        return User::selectRaw('
            users.id,
            users.name,
            users.email,
            COUNT(donations.id) as donation_count,
            SUM(donations.amount) as total_donated
        ')
        ->join('donations', 'users.id', '=', 'donations.user_id')
        ->where('donations.status', 'completed')
        ->groupBy('users.id', 'users.name', 'users.email')
        ->orderByDesc('total_donated')
        ->limit(10)
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'donation_count' => (int) $user->donation_count,
                'total_donated' => (float) $user->total_donated,
            ];
        });
    }

    private function getPaymentMethodDistribution()
    {
        return Donation::selectRaw('
            payment_method,
            COUNT(*) as count,
            SUM(amount) as total_amount
        ')
        ->where('status', 'completed')
        ->groupBy('payment_method')
        ->get()
        ->map(function ($item) {
            return [
                'method' => $item->payment_method,
                'count' => (int) $item->count,
                'total_amount' => (float) $item->total_amount,
                'label' => ucfirst(str_replace('_', ' ', $item->payment_method))
            ];
        });
    }

    private function getCampaignSuccessRate()
    {
        $total = Campaign::count();
        if ($total === 0) return 0;
        
        $successful = Campaign::where('status', 'completed')->count();
        return round(($successful / $total) * 100, 2);
    }

    private function getCategoryDistribution()
    {
        return Campaign::selectRaw('
            categories.name,
            categories.slug,
            COUNT(campaigns.id) as count,
            SUM(campaigns.current_amount) as total_raised
        ')
        ->leftJoin('categories', 'campaigns.category_id', '=', 'categories.id')
        ->groupBy('categories.id', 'categories.name', 'categories.slug')
        ->orderByDesc('count')
        ->get()
        ->map(function ($item) {
            return [
                'name' => $item->name ?? 'Không phân loại',
                'slug' => $item->slug ?? 'uncategorized',
                'count' => (int) $item->count,
                'total_raised' => (float) $item->total_raised,
            ];
        });
    }

    private function getUsersByRole()
    {
        return User::selectRaw('
            roles.name as role_name,
            roles.slug as role_slug,
            COUNT(users.id) as count
        ')
        ->join('roles', 'users.role_id', '=', 'roles.id')
        ->groupBy('roles.id', 'roles.name', 'roles.slug')
        ->get()
        ->map(function ($item) {
            return [
                'role' => $item->role_name,
                'slug' => $item->role_slug,
                'count' => (int) $item->count,
            ];
        });
    }

    private function getUserVerificationStatus()
    {
        return [
            'verified' => User::whereNotNull('email_verified_at')->count(),
            'unverified' => User::whereNull('email_verified_at')->count(),
            'pending' => User::where('status', 'pending')->count(),
            'active' => User::where('status', 'active')->count(),
            'suspended' => User::where('status', 'suspended')->count(),
        ];
    }

    private function getPlatformGrowthRate($range)
    {
        $currentPeriod = match($range) {
            'week' => Carbon::now()->startOfWeek(),
            'month' => Carbon::now()->startOfMonth(),
            'year' => Carbon::now()->startOfYear(),
            default => Carbon::now()->startOfMonth(),
        };
        
        $previousPeriod = match($range) {
            'week' => $currentPeriod->copy()->subWeek(),
            'month' => $currentPeriod->copy()->subMonth(),
            'year' => $currentPeriod->copy()->subYear(),
            default => $currentPeriod->copy()->subMonth(),
        };

        $currentUsers = User::where('created_at', '>=', $currentPeriod)->count();
        $previousUsers = User::where('created_at', '>=', $previousPeriod)
                             ->where('created_at', '<', $currentPeriod)->count();

        $userGrowth = $previousUsers > 0 ? (($currentUsers - $previousUsers) / $previousUsers) * 100 : 0;

        $currentDonations = Donation::where('created_at', '>=', $currentPeriod)
                                   ->where('status', 'completed')->sum('amount');
        $previousDonations = Donation::where('created_at', '>=', $previousPeriod)
                                    ->where('created_at', '<', $currentPeriod)
                                    ->where('status', 'completed')->sum('amount');

        $donationGrowth = $previousDonations > 0 ? (($currentDonations - $previousDonations) / $previousDonations) * 100 : 0;

        return [
            'userGrowth' => round($userGrowth, 2),
            'donationGrowth' => round($donationGrowth, 2),
            'period' => $range,
        ];
    }

    private function getEngagementMetrics()
    {
        $totalUsers = User::count();
        $activeUsers = User::whereHas('donations', function($q) {
            $q->where('created_at', '>=', Carbon::now()->subDays(30));
        })->count();

        $totalCampaigns = Campaign::count();
        $campaignsWithDonations = Campaign::whereHas('donations')->count();

        return [
            'userEngagementRate' => $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100, 2) : 0,
            'campaignEngagementRate' => $totalCampaigns > 0 ? round(($campaignsWithDonations / $totalCampaigns) * 100, 2) : 0,
            'averageDonationsPerUser' => $totalUsers > 0 ? round(Donation::count() / $totalUsers, 2) : 0,
            'averageDonationsPerCampaign' => $totalCampaigns > 0 ? round(Donation::count() / $totalCampaigns, 2) : 0,
        ];
    }

    private function getConversionRate()
    {
        $totalVisitors = User::count(); // This would ideally be from analytics
        $totalDonors = User::whereHas('donations')->count();
        
        return $totalVisitors > 0 ? round(($totalDonors / $totalVisitors) * 100, 2) : 0;
    }

    private function formatPeriodLabel($period, $range)
    {
        switch ($range) {
            case 'week':
                [$year, $week] = explode('-', $period);
                $date = Carbon::now()->setISODate($year, $week);
                return $date->format('d/m/Y');
            case 'month':
                [$year, $month] = explode('-', $period);
                return Carbon::createFromFormat('Y-m', $period)->format('m/Y');
            case 'year':
                return $period;
            default:
                return $period;
        }
    }

    /**
     * Get news with filters
     */
    public function getNews(Request $request): JsonResponse
    {
        try {
            $query = News::with('author');

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
                      ->orWhere('summary', 'like', '%' . $request->search . '%');
                });
            }

            $news = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($news);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch news'], 500);
        }
    }

    /**
     * Create news
     */
    public function createNews(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'summary' => 'required|string|max:500',
                'content' => 'required|string',
                'category' => 'required|in:community,event,story,announcement',
                'image' => 'nullable|string',
                'status' => 'in:draft,published,archived'
            ]);

            $validated['author_id'] = auth()->user()->id;
            $validated['status'] = $validated['status'] ?? 'draft';
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);

            $news = News::create($validated);
            $news->load('author');

            return response()->json([
                'message' => 'News created successfully',
                'news' => $news
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create news'], 500);
        }
    }

    /**
     * Update news
     */
    public function updateNews(Request $request, $id): JsonResponse
    {
        try {
            $news = News::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'summary' => 'sometimes|required|string|max:500',
                'content' => 'sometimes|required|string',
                'category' => 'sometimes|required|in:community,event,story,announcement',
                'image' => 'nullable|string',
                'status' => 'sometimes|in:draft,published,archived'
            ]);

            if (isset($validated['title'])) {
                $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
            }

            $news->update($validated);
            $news->load('author');

            return response()->json([
                'message' => 'News updated successfully',
                'news' => $news
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update news'], 500);
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
     * Get activities with filters
     */
    public function getActivities(Request $request): JsonResponse
    {
        try {
            $query = Activity::with('organizer');

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
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            $activities = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json($activities);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch activities'], 500);
        }
    }

    /**
     * Create activity
     */
    public function createActivity(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'content' => 'required|string',
                'category' => 'required|in:community,event,volunteer,workshop',
                'start_date' => 'required|date|after:now',
                'end_date' => 'required|date|after:start_date',
                'location' => 'required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'image' => 'nullable|string',
                'status' => 'in:draft,published,archived'
            ]);

            $validated['organizer_id'] = auth()->user()->id;
            $validated['status'] = $validated['status'] ?? 'draft';
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);

            $activity = Activity::create($validated);
            $activity->load('organizer');

            return response()->json([
                'message' => 'Activity created successfully',
                'activity' => $activity
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create activity'], 500);
        }
    }

    /**
     * Update activity
     */
    public function updateActivity(Request $request, $id): JsonResponse
    {
        try {
            $activity = Activity::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'content' => 'sometimes|required|string',
                'category' => 'sometimes|required|in:community,event,volunteer,workshop',
                'start_date' => 'sometimes|required|date|after:now',
                'end_date' => 'sometimes|required|date|after:start_date',
                'location' => 'sometimes|required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'image' => 'nullable|string',
                'status' => 'sometimes|in:draft,published,archived'
            ]);

            if (isset($validated['title'])) {
                $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
            }

            $activity->update($validated);
            $activity->load('organizer');

            return response()->json([
                'message' => 'Activity updated successfully',
                'activity' => $activity
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update activity'], 500);
        }
    }

    /**
     * Delete activity
     */
    public function deleteActivity(Request $request, $id): JsonResponse
    {
        try {
            $activity = Activity::findOrFail($id);
            
            // Check if activity has registrations
            $registrationsCount = $activity->registrations()->count();
            if ($registrationsCount > 0) {
                return response()->json([
                    'error' => 'Cannot delete activity with existing registrations'
                ], 400);
            }

            $activity->delete();

            return response()->json(['message' => 'Activity deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete activity'], 500);
        }
    }

    /**
     * Approve activity
     */
    public function approveActivity(Request $request, $id): JsonResponse
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->update(['status' => 'published']);

            return response()->json(['message' => 'Activity approved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to approve activity'], 500);
        }
    }

    /**
     * Reject activity
     */
    public function rejectActivity(Request $request, $id): JsonResponse
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->update([
                'status' => 'archived',
                'rejection_reason' => $request->input('reason', 'No reason provided')
            ]);

            return response()->json(['message' => 'Activity rejected successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to reject activity'], 500);
        }
    }

    /**
     * Create campaign
     */
    public function createCampaign(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:1000',
                'content' => 'required|string',
                'target_amount' => 'required|numeric|min:1',
                'start_date' => 'required|date|after:now',
                'end_date' => 'required|date|after:start_date',
                'image' => 'nullable|string',
                'category_ids' => 'required|array',
                'category_ids.*' => 'exists:categories,id',
                'organizer_id' => 'required|exists:users,id',
                'status' => 'in:draft,pending,active,rejected'
            ]);

            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
            $validated['status'] = $validated['status'] ?? 'pending';
            $validated['current_amount'] = 0;

            $campaign = Campaign::create($validated);
            
            // Attach categories
            $campaign->categories()->attach($validated['category_ids']);
            $campaign->load('categories', 'organizer');

            return response()->json([
                'message' => 'Campaign created successfully',
                'campaign' => $campaign
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create campaign'], 500);
        }
    }

    /**
     * Update campaign
     */
    public function updateCampaign(Request $request, $id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string|max:1000',
                'content' => 'sometimes|required|string',
                'target_amount' => 'sometimes|required|numeric|min:1',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after:start_date',
                'image' => 'nullable|string',
                'category_ids' => 'sometimes|array',
                'category_ids.*' => 'exists:categories,id',
                'status' => 'sometimes|in:draft,pending,active,rejected,completed,cancelled'
            ]);

            if (isset($validated['title'])) {
                $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
            }

            $campaign->update($validated);
            
            // Update categories if provided
            if (isset($validated['category_ids'])) {
                $campaign->categories()->sync($validated['category_ids']);
            }
            
            $campaign->load('categories', 'organizer');

            return response()->json([
                'message' => 'Campaign updated successfully',
                'campaign' => $campaign
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update campaign'], 500);
        }
    }

    /**
     * Delete campaign
     */
    public function deleteCampaign(Request $request, $id): JsonResponse
    {
        try {
            $campaign = Campaign::findOrFail($id);
            
            // Check if campaign has donations
            $donationsCount = $campaign->donations()->count();
            if ($donationsCount > 0) {
                return response()->json([
                    'error' => 'Cannot delete campaign with existing donations'
                ], 400);
            }

            $campaign->delete();

            return response()->json(['message' => 'Campaign deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete campaign'], 500);
        }
    }

    /**
     * Update donation status
     */
    public function updateDonationStatus(Request $request, $id): JsonResponse
    {
        try {
            $donation = Donation::findOrFail($id);
            
            $validated = $request->validate([
                'status' => 'required|in:pending,completed,failed,cancelled'
            ]);

            $donation->update(['status' => $validated['status']]);
            $donation->load('campaign', 'user');

            return response()->json([
                'message' => 'Donation status updated successfully',
                'donation' => $donation
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update donation status'], 500);
        }
    }

    /**
     * Get pending approvals
     */
    public function getPendingApprovals(): JsonResponse
    {
        try {
            $pendingUsers = User::whereHas('role', function ($query) {
                $query->where('slug', 'fundraiser');
            })->where('status', 'pending')->count();

            $pendingCampaigns = Campaign::where('status', 'pending')->count();
            $pendingActivities = Activity::where('status', 'draft')->count();
            $pendingNews = News::where('status', 'draft')->count();

            return response()->json([
                'users' => $pendingUsers,
                'campaigns' => $pendingCampaigns,
                'activities' => $pendingActivities,
                'news' => $pendingNews,
                'total' => $pendingUsers + $pendingCampaigns + $pendingActivities + $pendingNews
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch pending approvals'], 500);
        }
    }

    /**
     * Quick approve fundraiser
     */
    public function quickApproveFundraiser(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            if ($user->role->slug !== 'fundraiser') {
                return response()->json(['error' => 'User is not a fundraiser'], 400);
            }

            $user->update(['status' => 'active']);

            return response()->json(['message' => 'Fundraiser approved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to approve fundraiser'], 500);
        }
    }

    /**
     * Quick approve campaign
     */
    public function quickApproveCampaign(Request $request, $id): JsonResponse
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
     * Refund donation
     */
    public function refundDonation(Request $request, $id): JsonResponse
    {
        try {
            $donation = Donation::findOrFail($id);
            
            // Check if donation is refundable
            if ($donation->status !== 'completed') {
                return response()->json(['error' => 'Donation is not refundable'], 400);
            }

            // Begin transaction
            DB::beginTransaction();

            // Update donation status
            $donation->update(['status' => 'refunded']);

            // Update campaign raised amount
            $campaign = $donation->campaign;
            $campaign->update([
                'current_amount' => $campaign->current_amount - $donation->amount
            ]);

            // Refund logic here (e.g. payment gateway API)

            // Commit transaction
            DB::commit();

            return response()->json(['message' => 'Donation refunded successfully']);
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            return response()->json(['error' => 'Failed to refund donation'], 500);
        }
    }

    /**
     * Get system settings
     */
    public function getSettings(): JsonResponse
    {
        try {
            // For now, return default settings since we don't have a settings table
            // In production, these would be stored in a database table
            $settings = [
                'site' => [
                    'name' => config('app.name', 'KV Together'),
                    'description' => 'Nền tảng gây quỹ từ thiện hàng đầu Việt Nam',
                    'logo' => '/logo.svg',
                    'favicon' => '/favicon.svg',
                    'contact_email' => 'contact@kvtogether.com',
                    'contact_phone' => '1900-xxxx',
                    'address' => 'TP. Hồ Chí Minh, Việt Nam',
                    'facebook' => 'https://facebook.com/kvtogether',
                    'twitter' => 'https://twitter.com/kvtogether',
                    'instagram' => 'https://instagram.com/kvtogether',
                ],
                'platform' => [
                    'platform_fee_percentage' => 0,
                    'min_donation_amount' => 10000,
                    'max_donation_amount' => 100000000,
                    'default_campaign_duration' => 90,
                    'require_verification' => true,
                    'auto_approve_campaigns' => false,
                    'auto_approve_fundraisers' => false,
                ],
                'notification' => [
                    'email_notifications' => true,
                    'sms_notifications' => false,
                    'admin_notifications' => true,
                    'donor_notifications' => true,
                    'fundraiser_notifications' => true,
                ],
                'security' => [
                    'max_login_attempts' => 5,
                    'session_timeout' => 3600,
                    'require_email_verification' => true,
                    'require_phone_verification' => false,
                    'enable_2fa' => false,
                ],
                'payment' => [
                    'momo_enabled' => true,
                    'vnpay_enabled' => true,
                    'bank_transfer_enabled' => true,
                    'credits_enabled' => true,
                    'momo_api_key' => env('MOMO_API_KEY', ''),
                    'vnpay_api_key' => env('VNPAY_API_KEY', ''),
                ],
            ];

            return response()->json(['data' => $settings]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get settings'], 500);
        }
    }

    /**
     * Update system settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            // Validate settings
            $request->validate([
                'site.name' => 'sometimes|string|max:255',
                'site.description' => 'sometimes|string|max:1000',
                'site.contact_email' => 'sometimes|email|max:255',
                'site.contact_phone' => 'sometimes|string|max:20',
                'site.address' => 'sometimes|string|max:500',
                'platform.platform_fee_percentage' => 'sometimes|numeric|min:0|max:100',
                'platform.min_donation_amount' => 'sometimes|numeric|min:1000',
                'platform.max_donation_amount' => 'sometimes|numeric|min:1000000',
                'platform.default_campaign_duration' => 'sometimes|integer|min:1|max:365',
                'platform.require_verification' => 'sometimes|boolean',
                'platform.auto_approve_campaigns' => 'sometimes|boolean',
                'platform.auto_approve_fundraisers' => 'sometimes|boolean',
                'notification.email_notifications' => 'sometimes|boolean',
                'notification.sms_notifications' => 'sometimes|boolean',
                'notification.admin_notifications' => 'sometimes|boolean',
                'notification.donor_notifications' => 'sometimes|boolean',
                'notification.fundraiser_notifications' => 'sometimes|boolean',
                'security.max_login_attempts' => 'sometimes|integer|min:3|max:10',
                'security.session_timeout' => 'sometimes|integer|min:300|max:86400',
                'security.require_email_verification' => 'sometimes|boolean',
                'security.require_phone_verification' => 'sometimes|boolean',
                'security.enable_2fa' => 'sometimes|boolean',
                'payment.momo_enabled' => 'sometimes|boolean',
                'payment.vnpay_enabled' => 'sometimes|boolean',
                'payment.bank_transfer_enabled' => 'sometimes|boolean',
                'payment.credits_enabled' => 'sometimes|boolean',
            ]);

            // In production, save to database settings table
            // For now, just return success
            
            return response()->json(['message' => 'Settings updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update settings'], 500);
        }
    }
}
