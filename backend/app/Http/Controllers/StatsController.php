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
        return response()->json([
            'projects' => Campaign::count(),
            'ambassadors' => User::where('role', 'ambassador')->count(),
            'organizations' => User::where('role', 'organization')->count(),
            'donations_count' => Donation::count(),
            'total_amount' => Donation::sum('amount'),
        ]);
    }
} 