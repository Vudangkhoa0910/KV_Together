<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\VirtualWallet;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CampaignExpiryService
{
    /**
     * Process expired campaigns and convert donations to credits
     */
    public function processExpiredCampaigns(): array
    {
        $results = [
            'processed' => 0,
            'failed' => 0,
            'total_amount' => 0,
            'total_credits' => 0,
            'campaigns' => []
        ];

        // Find campaigns that are expired but not yet processed
        $expiredCampaigns = Campaign::where('status', 'active')
            ->where('end_date', '<', now())
            ->where('expiry_status', 'active')
            ->get();

        foreach ($expiredCampaigns as $campaign) {
            try {
                $result = $this->processSingleExpiredCampaign($campaign);
                
                $results['processed']++;
                $results['total_amount'] += $result['total_amount'];
                $results['total_credits'] += $result['total_credits'];
                $results['campaigns'][] = $result;
                
                Log::info("Processed expired campaign: {$campaign->title}", $result);
                
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("Failed to process expired campaign {$campaign->id}: " . $e->getMessage());
            }
        }

        return $results;
    }

    /**
     * Process a single expired campaign
     */
    private function processSingleExpiredCampaign(Campaign $campaign): array
    {
        DB::beginTransaction();
        
        try {
            // Calculate success percentage
            $targetAmount = $campaign->target_amount;
            $currentAmount = $campaign->current_amount;
            $successPercentage = $targetAmount > 0 ? ($currentAmount / $targetAmount) * 100 : 0;
            
            // Update campaign status
            $campaign->update([
                'expiry_status' => 'processing',
                'expired_at' => now()
            ]);
            
            $result = [
                'campaign_id' => $campaign->id,
                'campaign_title' => $campaign->title,
                'target_amount' => $targetAmount,
                'current_amount' => $currentAmount,
                'success_percentage' => round($successPercentage, 2),
                'total_amount' => 0,
                'total_credits' => 0,
                'donations_processed' => 0,
                'action_taken' => 'none'
            ];
            
            // Determine action based on success percentage and campaign settings
            if ($successPercentage >= 100) {
                // Campaign succeeded, mark as completed
                $campaign->update([
                    'status' => 'completed',
                    'expiry_status' => 'processed',
                    'processed_at' => now()
                ]);
                $result['action_taken'] = 'completed';
                
            } elseif ($successPercentage < 30) {
                // Low success rate - fast track to credits conversion
                $result = array_merge($result, $this->convertDonationsToCredits($campaign, 3));
                
            } elseif ($successPercentage < 70) {
                // Medium success rate - normal grace period
                $result = array_merge($result, $this->convertDonationsToCredits($campaign, $campaign->grace_period_days ?? 7));
                
            } else {
                // High success rate - try to extend or get more funding
                $result = array_merge($result, $this->handleHighSuccessRateExpiry($campaign));
            }
            
            DB::commit();
            return $result;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Convert donations to credits
     */
    private function convertDonationsToCredits(Campaign $campaign, int $gracePeriodDays = 7): array
    {
        $donations = Donation::where('campaign_id', $campaign->id)
            ->where('status', 'completed')
            ->with('user')
            ->get();
        
        $totalAmount = 0;
        $totalCredits = 0;
        $donationsProcessed = 0;
        
        foreach ($donations as $donation) {
            if (!$donation->user) {
                continue; // Skip donations without user
            }
            
            // Get or create wallet
            $wallet = $donation->user->getWallet();
            
            // Convert donation amount to credits (1:1 ratio)
            $creditAmount = $donation->amount;
            
            // Add credits to wallet
            $transaction = $wallet->addCredits(
                $creditAmount,
                CreditTransaction::TYPE_EARN,
                "Chuyển đổi từ chiến dịch thất bại: {$campaign->title}",
                'failed_campaign',
                $campaign->id,
                [
                    'original_donation_id' => $donation->id,
                    'original_amount' => $donation->amount,
                    'grace_period_days' => $gracePeriodDays
                ]
            );
            
            $totalAmount += $donation->amount;
            $totalCredits += $creditAmount;
            $donationsProcessed++;
            
            // Send notification to user
            $this->notifyUserAboutCreditsConversion($donation->user, $donation, $campaign, $creditAmount);
        }
        
        // Update campaign status
        $campaign->update([
            'expiry_status' => 'processed',
            'processed_at' => now()
        ]);
        
        return [
            'total_amount' => $totalAmount,
            'total_credits' => $totalCredits,
            'donations_processed' => $donationsProcessed,
            'action_taken' => 'converted_to_credits'
        ];
    }

    /**
     * Handle high success rate expiry (70%+ success)
     */
    private function handleHighSuccessRateExpiry(Campaign $campaign): array
    {
        // For now, still convert to credits but with longer grace period
        // In future, could implement:
        // - Automatic extension
        // - Contact organizer for more time
        // - Special "almost there" campaigns section
        
        return $this->convertDonationsToCredits($campaign, 14); // 14 days grace period
    }

    /**
     * Send notification to user about credits conversion
     */
    private function notifyUserAboutCreditsConversion(User $user, Donation $donation, Campaign $campaign, float $creditAmount): void
    {
        try {
            // Here you would send email/notification
            // For now, just log it
            Log::info("Credits conversion notification sent", [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'donation_id' => $donation->id,
                'campaign_title' => $campaign->title,
                'credit_amount' => $creditAmount
            ]);
            
            // You could implement actual email sending here:
            // Mail::to($user->email)->send(new CreditsConversionMail($user, $donation, $campaign, $creditAmount));
            
        } catch (\Exception $e) {
            Log::error("Failed to send credits conversion notification: " . $e->getMessage());
        }
    }

    /**
     * Get campaigns nearing expiry
     */
    public function getCampaignsNearingExpiry(int $days = 7): \Illuminate\Database\Eloquent\Collection
    {
        return Campaign::where('status', 'active')
            ->where('expiry_status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays($days)])
            ->with(['donations' => function($query) {
                $query->where('status', 'completed');
            }])
            ->get();
    }

    /**
     * Get statistics for expired campaigns processing
     */
    public function getExpiryStatistics(): array
    {
        return [
            'total_expired' => Campaign::where('expiry_status', 'processed')->count(),
            'total_credits_issued' => CreditTransaction::where('source_type', 'failed_campaign')
                ->where('type', CreditTransaction::TYPE_EARN)
                ->sum('amount'),
            'users_with_credits' => VirtualWallet::where('balance', '>', 0)->count(),
            'avg_credits_per_user' => VirtualWallet::where('balance', '>', 0)->avg('balance'),
            'campaigns_near_expiry' => $this->getCampaignsNearingExpiry()->count()
        ];
    }

    /**
     * Manual processing of specific campaign
     */
    public function processSpecificCampaign(int $campaignId, string $action = 'credits'): array
    {
        $campaign = Campaign::findOrFail($campaignId);
        
        return match($action) {
            'credits' => $this->convertDonationsToCredits($campaign),
            'extend' => $this->extendCampaign($campaign),
            'complete' => $this->completeCampaign($campaign),
            default => throw new \InvalidArgumentException("Invalid action: {$action}")
        };
    }

    /**
     * Extend campaign deadline
     */
    private function extendCampaign(Campaign $campaign, int $days = 30): array
    {
        $campaign->update([
            'end_date' => $campaign->end_date->addDays($days),
            'expiry_status' => 'active'
        ]);

        return [
            'action_taken' => 'extended',
            'new_end_date' => $campaign->end_date,
            'extension_days' => $days
        ];
    }

    /**
     * Manually complete campaign
     */
    private function completeCampaign(Campaign $campaign): array
    {
        $campaign->update([
            'status' => 'completed',
            'expiry_status' => 'processed',
            'processed_at' => now()
        ]);

        return [
            'action_taken' => 'completed',
            'completed_at' => now()
        ];
    }
}
