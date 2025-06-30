<?php

namespace App\Http\Controllers;

<<<<<<< HEAD
use Illuminate\Http\Request;
use App\Models\Campaign;
use App\Models\Activity;
use App\Models\News;
use App\Models\Notification;
use App\Models\VirtualWallet;
use App\Models\CreditTransaction;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
=======
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\CampaignUpdate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
>>>>>>> origin/main

class FundraiserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }
<<<<<<< HEAD

    public function dashboard()
    {
        $user = Auth::user();
        
        // Thống kê cơ bản
        $totalCampaigns = Campaign::where('organizer_id', $user->id)->count();
        $activeCampaigns = Campaign::where('organizer_id', $user->id)->where('status', 'active')->count();
        $completedCampaigns = Campaign::where('organizer_id', $user->id)->where('status', 'completed')->count();
        
        $totalActivities = Activity::where('organizer_id', $user->id)->count();
        $totalNews = News::where('author_id', $user->id)->count();
        
        // Tổng tiền quyên góp
        $totalRaised = Campaign::where('organizer_id', $user->id)->sum('current_amount');
        
        // Thống kê ví
        $wallet = VirtualWallet::where('user_id', $user->id)->first();
        $walletBalance = $wallet ? $wallet->balance : 0;
        $totalEarned = $wallet ? $wallet->total_earned : 0;
        
        // Hoạt động gần đây
        $recentCampaigns = Campaign::where('organizer_id', $user->id)
            ->with('categories')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        $recentActivities = Activity::where('organizer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        $recentNews = News::where('author_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        // Thông báo chưa đọc
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'stats' => [
                'total_campaigns' => $totalCampaigns,
                'active_campaigns' => $activeCampaigns,
                'completed_campaigns' => $completedCampaigns,
                'total_activities' => $totalActivities,
                'total_news' => $totalNews,
                'total_raised' => $totalRaised,
                'wallet_balance' => $walletBalance,
                'total_earned' => $totalEarned,
                'unread_notifications' => $unreadNotifications,
            ],
            'recent_campaigns' => $recentCampaigns,
            'recent_activities' => $recentActivities,
            'recent_news' => $recentNews,
        ]);
    }

    public function getCampaigns(Request $request)
    {
        $user = Auth::user();
        $query = Campaign::where('organizer_id', $user->id)
            ->with(['categories']);
            
        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Tìm kiếm
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $campaigns = $query->paginate($request->get('per_page', 10));
        
        return response()->json($campaigns);
    }

    public function getCampaignsStats()
    {
        $user = Auth::user();
        
        $stats = [
            'total' => Campaign::where('organizer_id', $user->id)->count(),
            'active' => Campaign::where('organizer_id', $user->id)->where('status', 'active')->count(),
            'completed' => Campaign::where('organizer_id', $user->id)->where('status', 'completed')->count(),
            'pending' => Campaign::where('organizer_id', $user->id)->where('status', 'pending')->count(),
            'ended_partial' => Campaign::where('organizer_id', $user->id)->where('status', 'ended_partial')->count(),
            'total_raised' => Campaign::where('organizer_id', $user->id)->sum('current_amount'),
            'total_target' => Campaign::where('organizer_id', $user->id)->sum('target_amount'),
        ];
        
        return response()->json($stats);
    }

    public function getActivities(Request $request)
    {
        $user = Auth::user();
        $query = Activity::where('organizer_id', $user->id);
            
        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Tìm kiếm
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $activities = $query->paginate($request->get('per_page', 10));
        
        return response()->json($activities);
    }

    public function getActivitiesStats()
    {
        $user = Auth::user();
        
        $stats = [
            'total' => Activity::where('organizer_id', $user->id)->count(),
            'published' => Activity::where('organizer_id', $user->id)->where('status', 'published')->count(),
            'draft' => Activity::where('organizer_id', $user->id)->where('status', 'draft')->count(),
            'completed' => Activity::where('organizer_id', $user->id)->where('status', 'completed')->count(),
            'total_participants' => Activity::where('organizer_id', $user->id)->sum('current_participants'),
        ];
        
        return response()->json($stats);
    }

    public function getNews(Request $request)
    {
        $user = Auth::user();
        $query = News::where('author_id', $user->id);
            
        // Lọc theo status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Tìm kiếm
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $news = $query->paginate($request->get('per_page', 10));
        
        return response()->json($news);
    }

    public function getNewsStats()
    {
        $user = Auth::user();
        
        $stats = [
            'total' => News::where('author_id', $user->id)->count(),
            'published' => News::where('author_id', $user->id)->where('status', 'published')->count(),
            'draft' => News::where('author_id', $user->id)->where('status', 'draft')->count(),
            'total_views' => News::where('author_id', $user->id)->sum('views_count'),
        ];
        
        return response()->json($stats);
    }

    public function getReports()
    {
        $user = Auth::user();
        
        // Báo cáo tổng quan
        $totalCampaigns = Campaign::where('organizer_id', $user->id)->count();
        $totalRaised = Campaign::where('organizer_id', $user->id)->sum('current_amount');
        $totalDonors = Donation::whereHas('campaign', function($q) use ($user) {
            $q->where('organizer_id', $user->id);
        })->distinct('user_id')->count();
        
        // Top campaigns
        $topCampaigns = Campaign::where('organizer_id', $user->id)
            ->orderBy('current_amount', 'desc')
            ->limit(5)
            ->get();
            
        // Thống kê theo tháng
        $monthlyReport = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();
            
            $monthlyRaised = Donation::whereHas('campaign', function($q) use ($user) {
                $q->where('organizer_id', $user->id);
            })->whereBetween('created_at', [$startOfMonth, $endOfMonth])
              ->sum('amount');
              
            $monthlyDonors = Donation::whereHas('campaign', function($q) use ($user) {
                $q->where('organizer_id', $user->id);
            })->whereBetween('created_at', [$startOfMonth, $endOfMonth])
              ->distinct('user_id')->count();
            
            $monthlyReport[] = [
                'month' => $date->format('Y-m'),
                'total_raised' => $monthlyRaised,
                'total_donors' => $monthlyDonors,
            ];
        }
        
        return response()->json([
            'summary' => [
                'total_campaigns' => $totalCampaigns,
                'total_raised' => $totalRaised,
                'total_donors' => $totalDonors,
            ],
            'top_campaigns' => $topCampaigns,
            'monthly_report' => $monthlyReport,
        ]);
    }

    public function getNotifications(Request $request)
    {
        $user = Auth::user();
        
        $query = Notification::where('user_id', $user->id);
        
        // Lọc theo loại
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }
        
        // Lọc theo trạng thái đọc
        if ($request->has('unread_only') && $request->unread_only) {
            $query->whereNull('read_at');
        }
        
        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($notifications);
    }

    public function markNotificationAsRead($id)
    {
        $user = Auth::user();
        
        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->first();
            
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }
        
        $notification->update(['read_at' => now()]);
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function getWallet()
    {
        $user = Auth::user();
        
        $wallet = VirtualWallet::where('user_id', $user->id)->first();
        
        if (!$wallet) {
            return response()->json([
                'balance' => 0,
                'total_earned' => 0,
                'total_spent' => 0,
                'tier' => 'bronze',
            ]);
        }
        
        return response()->json($wallet);
    }

    public function getWalletTransactions(Request $request)
    {
        $user = Auth::user();
        
        $wallet = VirtualWallet::where('user_id', $user->id)->first();
        
        if (!$wallet) {
            return response()->json(['data' => []]);
        }
        
        $query = CreditTransaction::where('wallet_id', $wallet->id);
        
        // Lọc theo loại giao dịch
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }
        
        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($transactions);
    }
=======
    
    /**
     * Get statistics for the fundraiser dashboard
     */
    public function getStats()
    {
        // Get user's campaigns
        $userId = Auth::id();
        
        // Count total campaigns
        $totalCampaigns = Campaign::where('organizer_id', $userId)->count();
        
        // Count active campaigns
        $activeCampaigns = Campaign::where('organizer_id', $userId)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->count();
            
        // Count total posts (updates)
        $totalPosts = CampaignUpdate::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })->count();
        
        // Count total donors (unique donors across all campaigns)
        $totalDonors = Donation::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->where('status', 'completed')
        ->distinct('user_id')
        ->count();
        
        // Calculate total raised
        $totalRaised = Donation::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->where('status', 'completed')
        ->sum('amount');
        
        // Calculate donations this week
        $donationsThisWeek = Donation::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->where('status', 'completed')
        ->where('created_at', '>=', now()->subDays(7))
        ->count();
        
        // Calculate success rate (completed campaigns / total completed + expired campaigns)
        $completedCampaigns = Campaign::where('organizer_id', $userId)
            ->where(function($query) {
                $query->where('status', 'completed')
                      ->orWhere(function($q) {
                          $q->where('status', 'active')
                            ->where('end_date', '<', now());
                      });
            })
            ->count();
            
        $successRate = $completedCampaigns > 0
            ? Campaign::where('organizer_id', $userId)
                ->where(function($query) {
                    $query->where('status', 'completed')
                          ->orWhere('current_amount', '>=', DB::raw('target_amount'));
                })
                ->count() / $completedCampaigns * 100
            : 0;
            
        // Count featured items
        $featuredItems = Campaign::where('organizer_id', $userId)
            ->where('is_featured', true)
            ->count();
            
        return response()->json([
            'totalCampaigns' => $totalCampaigns,
            'totalPosts' => $totalPosts,
            'totalDonors' => $totalDonors,
            'totalRaised' => $totalRaised,
            'activeActivities' => $activeCampaigns,
            'featuredItems' => $featuredItems,
            'donationsThisWeek' => $donationsThisWeek,
            'successRate' => round($successRate)
        ]);
    }
    
    /**
     * Get recent activities for the fundraiser dashboard
     */
    public function getRecentActivities()
    {
        $userId = Auth::id();
        
        // Get recent donations
        $recentDonations = Donation::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->with(['user:id,name,avatar', 'campaign:id,title,slug'])
        ->latest()
        ->limit(5)
        ->get()
        ->map(function($donation) {
            return [
                'id' => $donation->id,
                'type' => 'donation',
                'content' => ($donation->is_anonymous ? 'Nhà hảo tâm ẩn danh' : $donation->user->name) . 
                            ' đã quyên góp ' . number_format($donation->amount) . 'đ cho chiến dịch "' . 
                            $donation->campaign->title . '"',
                'timestamp' => $donation->created_at,
                'user' => [
                    'name' => $donation->is_anonymous ? 'Ẩn danh' : $donation->user->name,
                    'avatar' => $donation->is_anonymous ? '/images/avatars/anonymous.jpg' : $donation->user->avatar
                ]
            ];
        });
        
        // Get recent updates
        $recentUpdates = CampaignUpdate::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->with(['campaign:id,title,slug'])
        ->latest()
        ->limit(5)
        ->get()
        ->map(function($update) {
            return [
                'id' => $update->id,
                'type' => 'update',
                'content' => 'Bạn đã đăng cập nhật mới "' . $update->title . '" cho chiến dịch "' . $update->campaign->title . '"',
                'timestamp' => $update->created_at,
                'user' => [
                    'name' => 'Cập nhật',
                    'avatar' => '/images/avatars/update.jpg'
                ]
            ];
        });
        
        // Combine and sort activities
        $activities = $recentDonations->merge($recentUpdates)
            ->sortByDesc('timestamp')
            ->values()
            ->all();
            
        return response()->json(['activities' => $activities]);
    }
    
    /**
     * Get performance data for the fundraiser dashboard
     */
    public function getPerformanceData(Request $request)
    {
        $userId = Auth::id();
        $days = $request->input('days', 30);
        $startDate = now()->subDays($days)->startOfDay();
        
        // Prepare date range
        $dateRange = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dateRange[$date] = [
                'campaigns' => 0,
                'donations' => 0,
                'raised' => 0
            ];
        }
        
        // Get new campaigns per day
        $newCampaigns = Campaign::where('organizer_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->get();
            
        foreach ($newCampaigns as $campaign) {
            if (isset($dateRange[$campaign->date])) {
                $dateRange[$campaign->date]['campaigns'] = $campaign->count;
            }
        }
        
        // Get donations per day
        $donations = Donation::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->where('created_at', '>=', $startDate)
        ->where('status', 'completed')
        ->select(
            DB::raw('DATE(created_at) as date'), 
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(amount) as total')
        )
        ->groupBy('date')
        ->get();
        
        foreach ($donations as $donation) {
            if (isset($dateRange[$donation->date])) {
                $dateRange[$donation->date]['donations'] = $donation->count;
                $dateRange[$donation->date]['raised'] = $donation->total;
            }
        }
        
        // Format the response
        $response = [
            'campaigns' => array_values(array_column($dateRange, 'campaigns')),
            'donations' => array_values(array_column($dateRange, 'donations')),
            'raised' => array_values(array_column($dateRange, 'raised'))
        ];
        
        return response()->json($response);
    }
    
    /**
     * Get report data for fundraiser reports
     */
    public function getReportData(Request $request)
    {
        $userId = Auth::id();
        $reportType = $request->input('type', 'financial');
        $dateRange = $request->input('range', 'month');
        $campaignId = $request->input('campaign', 'all');
        $status = $request->input('status', 'all');
        
        // Calculate date range
        $startDate = now();
        switch ($dateRange) {
            case 'week':
                $startDate = now()->subDays(7);
                break;
            case 'month':
                $startDate = now()->subDays(30);
                break;
            case 'quarter':
                $startDate = now()->subMonths(3);
                break;
            case 'year':
                $startDate = now()->subMonths(12);
                break;
            default:
                $startDate = now()->subDays(30);
        }
        
        // Base donation query
        $donationQuery = Donation::whereHas('campaign', function($query) use ($userId) {
            $query->where('organizer_id', $userId);
        })
        ->where('created_at', '>=', $startDate);
        
        // Apply campaign filter
        if ($campaignId !== 'all') {
            $donationQuery->where('campaign_id', $campaignId);
        }
        
        // Apply status filter
        if ($status !== 'all') {
            $donationQuery->where('status', $status);
        }
        
        // Get donations for the report
        $donations = $donationQuery->with(['user:id,name,email,avatar', 'campaign:id,title,slug'])
            ->latest()
            ->get()
            ->map(function($donation) {
                return [
                    'id' => $donation->id,
                    'donor_name' => $donation->is_anonymous ? 'Nhà hảo tâm ẩn danh' : $donation->user->name,
                    'donor_email' => $donation->is_anonymous ? '' : $donation->user->email,
                    'amount' => $donation->amount,
                    'campaign_title' => $donation->campaign->title,
                    'status' => $donation->status,
                    'payment_method' => $donation->payment_method,
                    'created_at' => $donation->created_at
                ];
            });
            
        // Calculate totals
        $completedDonations = $donations->where('status', 'completed');
        
        $totals = [
            'totalRaised' => $completedDonations->sum('amount'),
            'totalDonations' => $donations->count(),
            'averageDonation' => $completedDonations->count() > 0 
                ? $completedDonations->sum('amount') / $completedDonations->count() 
                : 0,
            'totalDonors' => $donations->unique('donor_email')->count(),
            'successRate' => $donations->count() > 0 
                ? ($completedDonations->count() / $donations->count()) * 100 
                : 0
        ];
        
        // Generate monthly summary for charts
        $monthlySummary = [];
        foreach ($donations->where('status', 'completed') as $donation) {
            $month = $donation->created_at->format('Y-m');
            $monthLabel = $donation->created_at->format('m/Y');
            
            if (!isset($monthlySummary[$month])) {
                $monthlySummary[$month] = [
                    'month' => $monthLabel,
                    'amount' => 0,
                    'count' => 0
                ];
            }
            
            $monthlySummary[$month]['amount'] += $donation->amount;
            $monthlySummary[$month]['count'] += 1;
        }
        
        // Sort monthly summary by date
        ksort($monthlySummary);
        
        return response()->json([
            'donations' => $donations->values(),
            'totals' => $totals,
            'monthlySummary' => array_values($monthlySummary),
            'campaigns' => Campaign::where('organizer_id', $userId)
                ->select('id', 'title')
                ->get()
        ]);
    }
>>>>>>> origin/main
}
