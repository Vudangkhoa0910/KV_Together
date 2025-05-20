<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\News;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $featuredCampaigns = Campaign::where('status', 'active')
            ->orderBy('current_amount', 'desc')
            ->take(3)
            ->get();

        $latestNews = News::latest()
            ->take(3)
            ->get();

        return view('welcome', compact('featuredCampaigns', 'latestNews'));
    }
}
