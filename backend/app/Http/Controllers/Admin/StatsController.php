<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalCampaigns' => Campaign::count(),
            'totalDonations' => Donation::count(),
            'totalAmount' => Donation::sum('amount'),
            'pendingFundraisers' => User::where('role_id', 2)->where('status', 'pending')->count(),
            'pendingCampaigns' => Campaign::where('status', 'pending')->count(),
        ];

        return response()->json($stats);
    }
} 