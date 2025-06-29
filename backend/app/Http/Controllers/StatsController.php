<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index()
    {
        try {
            // Lấy thống kê tổng quan thực từ database - NO FAKE DATA
            // Only count truly active campaigns (not expired)
            $totalCampaigns = Campaign::where('status', 'active')
                                    ->where('end_date', '>', now())
                                    ->count();
            
            // Calculate correct totals for ALL completed donations (not just active campaigns)
            $totalDonors = Donation::where('status', 'completed')
                ->where('is_stats', false) // Exclude stats donations
                ->distinct('user_id')
                ->count('user_id'); 
            $totalAmountRaised = Donation::where('status', 'completed')
                ->where('is_stats', false) // Exclude stats donations
                ->sum('amount');
            
            // Sử dụng số liệu thực từ database - không điều chỉnh artificial
            $displayDonors = $totalDonors;
            
            // Thống kê thêm cho admin dashboard
            $activeCampaigns = Campaign::where('status', 'active')
                                     ->where('end_date', '>', now())
                                     ->count();
            $completedCampaigns = Campaign::where('status', 'completed')->count();
            $pendingCampaigns = Campaign::where('status', 'pending')->count();
            $totalDonationsCount = Donation::count();
            
            // Đếm users theo role sử dụng relationship thay vì column 'role'
            $ambassadors = User::whereHas('role', function($query) {
                $query->where('slug', 'fundraiser');
            })->where('status', 'active')->count();
            
            $organizations = User::whereHas('role', function($query) {
                $query->where('slug', 'fundraiser');
            })->where('status', 'active')->count();

            // Thống kê chi tiết mới - sử dụng dữ liệu thực
            $avgDonationAmount = Donation::where('status', 'completed')
                ->where('is_stats', false)
                ->avg('amount') ?: 0;
            $successfulCampaigns = Campaign::where('status', 'completed')->count();
            $successRate = $totalCampaigns > 0 ? round(($successfulCampaigns / Campaign::count()) * 100, 1) : 0;
            
            // Tính tổng tiền các chiến dịch hoàn thành
            $completedCampaignsAmount = Campaign::where('status', 'completed')->sum('current_amount');
            
            // Thống kê theo tháng hiện tại - chỉ tính non-stats donations
            $thisMonthDonations = Donation::where('status', 'completed')
                ->where('is_stats', false) // Exclude stats donations
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount');
            
            $thisMonthDonors = Donation::where('status', 'completed')
                ->where('is_stats', false) // Exclude stats donations
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->distinct('user_id')
                ->count('user_id');

            return response()->json([
                // Thống kê chính cho campaigns page
                'active_campaigns' => $totalCampaigns,
                'total_donors' => $displayDonors, // Sử dụng số đã điều chỉnh
                'total_amount_raised' => $totalAmountRaised,
                
                // Thống kê chi tiết cho admin
                'total_campaigns' => Campaign::count(),
                'active_campaigns_count' => $activeCampaigns,
                'completed_campaigns' => $completedCampaigns,
                'pending_campaigns' => $pendingCampaigns,
                'total_donations_count' => $totalDonationsCount,
                
                // Thống kê nâng cao mới
                'avg_donation_amount' => round($avgDonationAmount),
                'success_rate' => $successRate,
                'this_month_donations' => $thisMonthDonations,
                'this_month_donors' => $thisMonthDonors,
                'completed_campaigns_amount' => $completedCampaignsAmount,
                
                // Backwards compatibility
                'projects' => Campaign::count(),
                'ambassadors' => $ambassadors,
                'organizations' => $organizations,
                'donations_count' => $totalDonationsCount,
                'total_amount' => $totalAmountRaised,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching statistics:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tải thống kê',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getMonthlyStats()
    {
        try {
            $monthlyStats = [];
            
            // Get data for the last 6 months only (not 12) để hiển thị đẹp hơn
            for ($i = 5; $i >= 0; $i--) {
                $startDate = now()->subMonths($i)->startOfMonth();
                $endDate = now()->subMonths($i)->endOfMonth();
                
                // Get donations for this month
                $monthDonations = Donation::where('status', 'completed')
                    ->whereBetween('created_at', [$startDate, $endDate]);
                
                $donationsCount = $monthDonations->count();
                $totalAmount = $monthDonations->sum('amount');
                $uniqueDonors = $monthDonations->distinct('user_id')->count('user_id');
                
                // Sử dụng dữ liệu thực từ database - NO FALLBACK DATA
                $displayAmount = $totalAmount;
                $displayDonors = $uniqueDonors;
                $displayDonations = $donationsCount;
                
                // Get top donors for this month - REAL DATA ONLY
                $topDonorsQuery = \DB::table('donations')
                    ->join('users', 'donations.user_id', '=', 'users.id')
                    ->select(
                        'users.name',
                        'donations.amount',
                        'donations.created_at'
                    )
                    ->where('donations.status', 'completed')
                    ->whereBetween('donations.created_at', [$startDate, $endDate])
                    ->orderByDesc('donations.amount')
                    ->limit(3);
                
                $topDonors = $topDonorsQuery->get()->toArray();
                
                // Chỉ hiển thị nếu có dữ liệu thực - không tạo fake data
                if (empty($topDonors)) {
                    $topDonors = [];
                }
                
                $monthlyStats[] = [
                    'month' => $startDate->format('M Y'),
                    'month_vi' => $this->getVietnameseMonth($startDate),
                    'donations' => $displayDonations,
                    'amount' => $displayAmount,
                    'donors' => $displayDonors,
                    'campaigns' => Campaign::where('status', 'active')->count(), // Simplified
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'top_donors' => $topDonors
                ];
            }
            
            // Calculate totals từ database thực tế cho 6 tháng gần đây
            $sixMonthsAgo = now()->subMonths(6);
            $totalDonationsFromMonths = Donation::where('status', 'completed')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->count();
            
            $totalAmountFromMonths = Donation::where('status', 'completed')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->sum('amount');
            
            // Đếm unique donors trong 6 tháng - không cộng duplicate
            $totalDonorsFromMonths = Donation::where('status', 'completed')
                ->where('created_at', '>=', $sixMonthsAgo)
                ->distinct('user_id')
                ->count('user_id');
                
            $avgCampaigns = Campaign::where('status', 'active')->count();
            
            return response()->json([
                'data' => $monthlyStats,
                'summary' => [
                    'total_donations' => $totalDonationsFromMonths,
                    'total_amount' => $totalAmountFromMonths,
                    'total_donors' => $totalDonorsFromMonths, // Đếm thực tế unique donors
                    'total_campaigns' => $avgCampaigns,
                    'period_months' => count($monthlyStats),
                    'avg_donation_per_month' => count($monthlyStats) > 0 ? 
                        intval($totalDonationsFromMonths / count($monthlyStats)) : 0,
                    'avg_amount_per_month' => count($monthlyStats) > 0 ? 
                        intval($totalAmountFromMonths / count($monthlyStats)) : 0,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching monthly statistics:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tải thống kê theo tháng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getTopDonors(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $period = $request->get('period', 'all'); // all, month, year
            
            $query = \DB::table('donations')
                ->join('users', 'donations.user_id', '=', 'users.id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.avatar_url',
                    \DB::raw('SUM(donations.amount) as total_donated'),
                    \DB::raw('COUNT(donations.id) as donations_count'),
                    \DB::raw('MAX(donations.created_at) as last_donation_date')
                )
                ->where('donations.status', 'completed');
            
            // Apply period filter
            switch ($period) {
                case 'month':
                    $query->whereMonth('donations.created_at', now()->month)
                          ->whereYear('donations.created_at', now()->year);
                    break;
                case 'year':
                    $query->whereYear('donations.created_at', now()->year);
                    break;
                // 'all' - no additional filter
            }
            
            $topDonors = $query->groupBy('users.id', 'users.name', 'users.avatar_url')
                ->orderByDesc('total_donated')
                ->limit($limit)
                ->get()
                ->map(function ($donor, $index) {
                    return [
                        'id' => $donor->id,
                        'name' => $donor->name,
                        'avatar_url' => $donor->avatar_url,
                        'total_donated' => (int) $donor->total_donated,
                        'donations_count' => (int) $donor->donations_count,
                        'last_donation_date' => $donor->last_donation_date,
                        'rank' => $index + 1
                    ];
                });
            
            $totalDonors = \DB::table('donations')
                ->distinct('user_id')
                ->where('status', 'completed')
                ->count();
            
            return response()->json([
                'data' => $topDonors,
                'period' => $period,
                'total_donors' => $totalDonors
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching top donors:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tải danh sách nhà hảo tâm',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function getVietnameseMonth($date)
    {
        $monthNames = [
            1 => 'Tháng 1', 2 => 'Tháng 2', 3 => 'Tháng 3', 4 => 'Tháng 4',
            5 => 'Tháng 5', 6 => 'Tháng 6', 7 => 'Tháng 7', 8 => 'Tháng 8',
            9 => 'Tháng 9', 10 => 'Tháng 10', 11 => 'Tháng 11', 12 => 'Tháng 12'
        ];
        
        return $monthNames[$date->month] . '/' . $date->year;
    }
}