<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Database\Seeder;

class DonationSeeder extends Seeder
{
    public function run(): void
    {
        $campaigns = Campaign::where('status', 'active')->get();
        $users = User::whereHas('role', function($q) {
            $q->where('slug', 'user');
        })->where('status', 'active')->get();

        if ($campaigns->isEmpty()) {
            $this->command->error('No active campaigns found. Please run CampaignSeeder first.');
            return;
        }

        if ($users->isEmpty()) {
            $this->command->error('No active users found. Please run UserSeeder first.');
            return;
        }

        foreach ($campaigns as $campaign) {
            // Nếu campaign đã completed thì bỏ qua seeder donation
            if ($campaign->status === 'completed') continue;
            
            // Create realistic donation scenarios with STRICT control
            $targetAmount = $campaign->target_amount;
            $progressScenarios = [
                'new' => [1, 15],        // 1-15% progress (new campaigns)
                'developing' => [15, 45], // 15-45% progress (developing campaigns)  
                'successful' => [45, 85], // 45-85% progress (successful campaigns)
            ];
            
            $scenario = $this->getWeightedScenario();
            if (!isset($progressScenarios[$scenario])) $scenario = 'developing';
            
            [$minProgress, $maxProgress] = $progressScenarios[$scenario];
            $targetProgress = rand($minProgress, $maxProgress) / 100;
            
            // ABSOLUTE MAXIMUM: never exceed 105% of target
            $absoluteMaxAmount = intval($targetAmount * 1.05);
            $targetCurrentAmount = intval($targetAmount * $targetProgress);
            
            $donationCount = 0;
            $maxDonations = rand(2, 5); // Further reduced for better control
            $usedUserIds = [];
            
            while ($campaign->current_amount < $targetCurrentAmount && $donationCount < $maxDonations) {
                $remainingToTarget = $targetCurrentAmount - $campaign->current_amount;
                $remainingToAbsoluteMax = $absoluteMaxAmount - $campaign->current_amount;
                
                // Use the smaller of the two limits - this is critical
                $actualRemaining = min($remainingToTarget, $remainingToAbsoluteMax);
                
                if ($actualRemaining <= 0) break;
                
                $donationAmount = $this->generateControlledDonationAmount($actualRemaining, $targetAmount, $donationCount, $maxDonations);
                
                if ($donationAmount <= 0) break;
                
                // TRIPLE CHECK: never exceed our strict limits
                $donationAmount = min($donationAmount, $actualRemaining);
                
                $availableUsers = $users->whereNotIn('id', $usedUserIds);
                if ($availableUsers->isEmpty() || (count($usedUserIds) >= 3 && rand(1, 100) <= 30)) {
                    $selectedUser = $users->random();
                } else {
                    $selectedUser = $availableUsers->random();
                    $usedUserIds[] = $selectedUser->id;
                }
                
                Donation::create([
                    'campaign_id' => $campaign->id,
                    'user_id' => $selectedUser->id,
                    'amount' => $donationAmount,
                    'message' => $this->getRandomMessage(),
                    'status' => 'completed',
                    'payment_method' => ['momo', 'bank_transfer', 'vnpay'][rand(0, 2)],
                    'is_stats' => false, // These are real donations, not stats
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now(),
                ]);
                
                // Update campaign amount with ABSOLUTE maximum control
                $newAmount = $campaign->current_amount + $donationAmount;
                
                // NEVER exceed 105% of target - this is the absolute ceiling
                $actualAmount = min($newAmount, $absoluteMaxAmount);
                
                $campaign->update(['current_amount' => $actualAmount]);
                $donationCount++;
                
                // Refresh campaign and check completion
                $campaign = $campaign->fresh();
                
                // Auto-complete if reached target
                if ($campaign->current_amount >= $campaign->target_amount && $campaign->status === 'active') {
                    $campaign->update(['status' => 'completed']);
                }
                
                // STOP if we've reached our absolute limit
                if ($campaign->current_amount >= $absoluteMaxAmount) {
                    break;
                }
            }
            
            $finalProgress = round(($campaign->fresh()->current_amount / $campaign->target_amount) * 100, 1);
            $this->command->info("Created {$donationCount} donations for campaign: {$campaign->title} (Progress: {$finalProgress}%)");
        }
    }
    
    private function getWeightedScenario(): string 
    {
        $weights = [
            'new' => 40,         // 40% chance - more new campaigns
            'developing' => 35,  // 35% chance  
            'successful' => 20,  // 20% chance
            'completed' => 5     // 5% chance
        ];
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $scenario => $weight) {
            $cumulative += $weight;
            if ($random <= $cumulative) {
                return $scenario;
            }
        }
        
        return 'developing'; // fallback
    }
    
    private function generateControlledDonationAmount(int $remainingAmount, int $targetAmount, int $donationCount, int $maxDonations): int
    {
        // Much more conservative donation amounts
        if ($targetAmount <= 5000000) { // Small campaigns (<=5M)
            $ranges = [20000, 30000, 100000]; // 20k-100k (reduced)
        } elseif ($targetAmount <= 15000000) { // Medium campaigns (<=15M)
            $ranges = [20000, 50000, 200000]; // 20k-200k (reduced)
        } else { // Large campaigns (>15M)
            $ranges = [50000, 100000, 500000]; // 50k-500k (much reduced)
        }
        
        // Conservative approach based on position
        $progressInDonations = $donationCount / $maxDonations;
        
        if ($progressInDonations < 0.5) {
            // Early donations: smaller amounts
            $maxAmount = min($ranges[0], $remainingAmount);
            $minAmount = min($ranges[0] * 0.5, $maxAmount);
        } elseif ($progressInDonations < 0.8) {
            // Mid donations: moderate amounts
            $maxAmount = min($ranges[1], $remainingAmount);
            $minAmount = min($ranges[0], $maxAmount);
        } else {
            // Final donations: try to complete but be conservative
            $avgRemaining = intval($remainingAmount / max(1, $maxDonations - $donationCount));
            $maxAmount = min($avgRemaining, $ranges[1], $remainingAmount);
            $minAmount = min($ranges[0], $maxAmount);
        }
        
        // Ensure minimum donation amount
        if ($minAmount < 20000) $minAmount = 20000;
        if ($maxAmount < $minAmount) $maxAmount = $minAmount;
        
        // CRITICAL: never exceed remaining amount
        $maxAmount = min($maxAmount, $remainingAmount);
        
        // Generate amount within safe bounds
        $finalAmount = $minAmount >= $maxAmount ? $maxAmount : rand($minAmount, $maxAmount);
        
        // FINAL SAFETY CHECK: absolutely never exceed remaining
        return min($finalAmount, $remainingAmount);
    }
    
    private function getRandomMessage(): string
    {
        $messages = [
            'Ủng hộ chiến dịch ý nghĩa!',
            'Chúc chiến dịch thành công!',
            'Góp một phần nhỏ để giúp đỡ cộng đồng',
            'Rất ý nghĩa, ủng hộ!',
            'Cùng chung tay giúp đỡ',
            'Mong chiến dịch sớm đạt mục tiêu',
            'Ủng hộ hết mình!',
            'Cố lên!',
            'Chúc may mắn!',
            'Hy vọng có thể giúp ích',
            '', // Some donations without message
            '',
        ];
        
        return $messages[rand(0, count($messages) - 1)];
    }
}
