<?php

namespace App\Http\Controllers;

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

class FundraiserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

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
}
