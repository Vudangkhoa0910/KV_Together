<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function donations(Request $request)
    {
        $range = $request->get('range', 'year');
        $startDate = $this->getStartDate($range);

        $monthlyDonations = Donation::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(amount) as amount'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $stats = [
            'totalAmount' => Donation::sum('amount'),
            'totalCount' => Donation::count(),
            'averageAmount' => Donation::avg('amount'),
            'monthlyDonations' => $monthlyDonations,
        ];

        return response()->json($stats);
    }

    public function campaigns(Request $request)
    {
        $range = $request->get('range', 'year');
        $startDate = $this->getStartDate($range);

        $monthlyCreated = Campaign::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $categoryDistribution = Category::withCount('campaigns')
            ->having('campaigns_count', '>', 0)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'count' => $category->campaigns_count,
                ];
            });

        $completedCampaigns = Campaign::where('status', 'completed')->count();
        $totalCampaigns = Campaign::count();

        $stats = [
            'totalCampaigns' => $totalCampaigns,
            'activeCampaigns' => Campaign::where('status', 'active')->count(),
            'completedCampaigns' => $completedCampaigns,
            'successRate' => $totalCampaigns > 0 ? round(($completedCampaigns / $totalCampaigns) * 100, 1) : 0,
            'categoryDistribution' => $categoryDistribution,
            'monthlyCreated' => $monthlyCreated,
        ];

        return response()->json($stats);
    }

    public function users(Request $request)
    {
        $range = $request->get('range', 'year');
        $startDate = $this->getStartDate($range);

        $monthlyRegistrations = DB::table('users')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as users'),
                DB::raw('SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as fundraisers')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $stats = [
            'totalUsers' => User::count(),
            'totalFundraisers' => User::where('role_id', 2)->count(),
            'monthlyRegistrations' => $monthlyRegistrations,
        ];

        return response()->json($stats);
    }

    private function getStartDate($range)
    {
        $now = Carbon::now();

        switch ($range) {
            case 'week':
                return $now->subWeek();
            case 'month':
                return $now->subMonth();
            case 'year':
            default:
                return $now->subYear();
        }
    }
} 