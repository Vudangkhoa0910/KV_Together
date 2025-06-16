<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TopDonorsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $period = $request->get('period', 'all'); // all, year, month
            
            $query = Donation::select([
                'user_id',
                DB::raw('SUM(amount) as total_donated'),
                DB::raw('COUNT(*) as donations_count'),
                DB::raw('MAX(created_at) as last_donation_date')
            ])
            ->where('status', 'completed')
            ->with(['user:id,name,avatar,email']);

            // Filter by period
            switch ($period) {
                case 'year':
                    $query->whereYear('created_at', now()->year);
                    break;
                case 'month':
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                    break;
                case 'all':
                default:
                    // No additional filter
                    break;
            }

            $topDonors = $query
                ->groupBy('user_id')
                ->orderByDesc('total_donated')
                ->limit($limit)
                ->get()
                ->map(function ($donation) {
                    $user = $donation->user;
                    if (!$user) return null;
                    
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar_url' => $user->avatar ? url('storage/' . str_replace('\\', '', $user->avatar)) : null,
                        'total_donated' => $donation->total_donated,
                        'donations_count' => $donation->donations_count,
                        'last_donation_date' => $donation->last_donation_date,
                        'rank' => $donation->getKey() // Will be set properly in collection
                    ];
                })
                ->filter()
                ->values()
                ->map(function ($donor, $index) {
                    $donor['rank'] = $index + 1;
                    return $donor;
                });

            return response()->json([
                'data' => $topDonors,
                'period' => $period,
                'total_donors' => $topDonors->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching top donors:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tải danh sách nhà hảo tâm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTopOrganizations(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            
            $topOrganizations = User::select([
                'users.id',
                'users.name',
                'users.avatar',
                'users.bio',
                'users.address',
                DB::raw('COUNT(DISTINCT campaigns.id) as campaigns_count'),
                DB::raw('SUM(campaigns.current_amount) as total_raised'),
                DB::raw('COUNT(DISTINCT donations.id) as total_donations')
            ])
            ->join('campaigns', 'users.id', '=', 'campaigns.organizer_id')
            ->leftJoin('donations', 'campaigns.id', '=', 'donations.campaign_id')
            ->whereHas('role', function($query) {
                $query->where('slug', 'fundraiser');
            })
            ->where('users.status', 'active')
            ->where('campaigns.status', 'active')
            ->groupBy('users.id', 'users.name', 'users.avatar', 'users.bio', 'users.address')
            ->orderByDesc('total_raised')
            ->limit($limit)
            ->get()
            ->map(function ($user, $index) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar ? url('storage/' . str_replace('\\', '', $user->avatar)) : null,
                    'bio' => $user->bio,
                    'address' => $user->address,
                    'campaigns_count' => $user->campaigns_count,
                    'total_raised' => $user->total_raised,
                    'total_donations' => $user->total_donations,
                    'rank' => $index + 1
                ];
            });

            return response()->json([
                'data' => $topOrganizations,
                'total_organizations' => $topOrganizations->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching top organizations:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tải danh sách tổ chức hàng đầu',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
