<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Activity;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class HomeController extends Controller
{
    public function index()
    {
        $query = Campaign::query();

        if (Schema::hasColumn('campaigns', 'is_active')) {
            $query->where('is_active', true);
        }

        $campaigns = $query->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        return view('home', compact('campaigns')); // Sửa 'welcome' thành 'home'
    }

    public function dashboard()
    {
        $totalCampaigns = Campaign::count();
        $totalDonations = Donation::sum('amount');
        $totalActivities = Activity::count();
        $totalNews = News::count();

        $recentCampaigns = Campaign::latest()->take(5)->get();
        $recentDonations = Donation::with(['user', 'campaign'])->latest()->take(5)->get();

        return view('admin.dashboard', compact(
            'totalCampaigns',
            'totalDonations',
            'totalActivities',
            'totalNews',
            'recentCampaigns',
            'recentDonations'
        ));
    }
}