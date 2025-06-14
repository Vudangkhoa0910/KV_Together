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
            // Lấy thống kê tổng quan cho campaigns page
            $totalCampaigns = Campaign::where('status', 'active')->count();
            $totalDonors = Donation::distinct('user_id')->count('user_id'); // Đếm tất cả donors (không phân biệt status)
            $totalAmountRaised = Donation::where('status', 'completed')->sum('amount'); // Chỉ tính những donation đã hoàn thành
            
            // Thống kê thêm cho admin dashboard
            $activeCampaigns = Campaign::where('status', 'active')->count();
            $completedCampaigns = Campaign::where('status', 'completed')->count();
            $pendingCampaigns = Campaign::where('status', 'pending')->count();
            $totalDonationsCount = Donation::count();
            
            // Đếm users theo role sử dụng relationship thay vì column 'role'
            $ambassadors = User::whereHas('role', function($query) {
                $query->where('slug', 'ambassador');
            })->count();
            
            $organizations = User::whereHas('role', function($query) {
                $query->where('slug', 'organization');
            })->count();
            
            return response()->json([
                // Thống kê chính cho campaigns page
                'active_campaigns' => $totalCampaigns,
                'total_donors' => $totalDonors,
                'total_amount_raised' => $totalAmountRaised,
                
                // Thống kê chi tiết cho admin
                'total_campaigns' => Campaign::count(),
                'active_campaigns_count' => $activeCampaigns,
                'completed_campaigns' => $completedCampaigns,
                'pending_campaigns' => $pendingCampaigns,
                'total_donations_count' => $totalDonationsCount,
                
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
} 