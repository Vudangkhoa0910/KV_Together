<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignStatusController extends Controller
{
    /**
     * Get campaign status summary
     */
    public function getStatusSummary()
    {
        $totalCampaigns = Campaign::count();
        $activeCampaigns = Campaign::where('status', 'active')
                                  ->where('end_date', '>', now())
                                  ->count();
        $completedCampaigns = Campaign::where('status', 'completed')->count();
        $pendingCampaigns = Campaign::where('status', 'pending')->count();
        
        // Get campaigns nearing completion (>= 90%)
        $nearingCompletion = Campaign::where('status', 'active')
            ->where('end_date', '>', now()) // Only non-expired campaigns
            ->whereRaw('(current_amount / target_amount) >= 0.9')
            ->count();
        
        // Get campaigns expiring soon (< 7 days)
        $expiringSoon = Campaign::where('status', 'active')
            ->where('end_date', '>', now()) // Only non-expired campaigns
            ->where('end_date', '<=', now()->addDays(7))
            ->count();
        
        // Get campaigns that need completion
        $needsCompletion = Campaign::where('status', 'active')
            ->where('end_date', '>', now()) // Only non-expired campaigns
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->count();

        return response()->json([
            'total_campaigns' => $totalCampaigns,
            'active_campaigns' => $activeCampaigns,
            'completed_campaigns' => $completedCampaigns,
            'pending_campaigns' => $pendingCampaigns,
            'nearing_completion' => $nearingCompletion,
            'expiring_soon' => $expiringSoon,
            'needs_completion' => $needsCompletion,
            'completion_rate' => $totalCampaigns > 0 ? round(($completedCampaigns / $totalCampaigns) * 100, 1) : 0
        ]);
    }

    /**
     * Get campaigns requiring attention
     */
    public function getCampaignsRequiringAttention()
    {
        // Campaigns that reached target but not marked as completed
        $needsCompletion = Campaign::where('status', 'active')
            ->where('end_date', '>', now()) // Only non-expired campaigns
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->with(['organizer:id,name,email'])
            ->get();

        // Campaigns nearing completion (>= 90%)
        $nearingCompletion = Campaign::where('status', 'active')
            ->where('end_date', '>', now()) // Only non-expired campaigns
            ->whereRaw('(current_amount / target_amount) >= 0.9')
            ->whereColumn('current_amount', '<', 'target_amount')
            ->with(['organizer:id,name,email'])
            ->get();

        // Campaigns expiring soon (< 7 days)
        $expiringSoon = Campaign::where('status', 'active')
            ->where('end_date', '<=', now()->addDays(7))
            ->where('end_date', '>', now())
            ->with(['organizer:id,name,email'])
            ->get();

        return response()->json([
            'needs_completion' => $needsCompletion->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'slug' => $campaign->slug,
                    'current_amount' => $campaign->current_amount,
                    'target_amount' => $campaign->target_amount,
                    'progress_percentage' => round(($campaign->current_amount / $campaign->target_amount) * 100, 2), // 2 decimal places
                    'organizer' => $campaign->organizer,
                    'type' => 'needs_completion'
                ];
            }),
            'nearing_completion' => $nearingCompletion->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'slug' => $campaign->slug,
                    'current_amount' => $campaign->current_amount,
                    'target_amount' => $campaign->target_amount,
                    'progress_percentage' => round(($campaign->current_amount / $campaign->target_amount) * 100, 2), // 2 decimal places
                    'organizer' => $campaign->organizer,
                    'type' => 'nearing_completion'
                ];
            }),
            'expiring_soon' => $expiringSoon->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'slug' => $campaign->slug,
                    'end_date' => $campaign->end_date,
                    'days_remaining' => now()->diffInDays($campaign->end_date, false),
                    'current_amount' => $campaign->current_amount,
                    'target_amount' => $campaign->target_amount,
                    'progress_percentage' => round(($campaign->current_amount / $campaign->target_amount) * 100, 2), // 2 decimal places
                    'organizer' => $campaign->organizer,
                    'type' => 'expiring_soon'
                ];
            })
        ]);
    }

    /**
     * Mark campaign as completed manually
     */
    public function markAsCompleted(Campaign $campaign)
    {
        if ($campaign->current_amount < $campaign->target_amount) {
            return response()->json([
                'message' => 'Chiến dịch chưa đạt đủ mục tiêu để đánh dấu hoàn thành'
            ], 400);
        }

        $campaign->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Đã đánh dấu chiến dịch hoàn thành',
            'campaign' => $campaign
        ]);
    }

    /**
     * Get campaign health check
     */
    public function healthCheck()
    {
        $issues = [];

        // Check for campaigns that should be completed
        $needsCompletion = Campaign::where('status', 'active')
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->count();

        if ($needsCompletion > 0) {
            $issues[] = [
                'type' => 'needs_completion',
                'count' => $needsCompletion,
                'message' => "{$needsCompletion} chiến dịch đã đạt mục tiêu nhưng chưa được đánh dấu hoàn thành"
            ];
        }

        // Check for expired campaigns
        $expiredActive = Campaign::where('status', 'active')
            ->where('end_date', '<', now())
            ->count();

        if ($expiredActive > 0) {
            $issues[] = [
                'type' => 'expired_active',
                'count' => $expiredActive,
                'message' => "{$expiredActive} chiến dịch đã hết hạn nhưng vẫn ở trạng thái active"
            ];
        }

        return response()->json([
            'healthy' => empty($issues),
            'issues' => $issues,
            'checked_at' => now()->toISOString()
        ]);
    }
}
