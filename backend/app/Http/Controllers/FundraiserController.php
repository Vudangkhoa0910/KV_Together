<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\CampaignUpdate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class FundraiserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }
    
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
}
