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
            // Create realistic donation scenarios
            $targetAmount = $campaign->target_amount;
            $progressScenarios = [
                'new' => [5, 20],        // 5-20% progress (new campaigns)
                'developing' => [20, 60], // 20-60% progress (developing campaigns)
                'successful' => [60, 95], // 60-95% progress (successful campaigns)
                'completed' => [95, 100], // 95-100+ progress (completed/overfunded)
            ];
            
            // Randomly assign scenario weights (higher chance for realistic scenarios)
            $scenario = $this->getWeightedScenario();
            [$minProgress, $maxProgress] = $progressScenarios[$scenario];
            
            // Calculate target current amount based on scenario
            $targetProgress = rand($minProgress, $maxProgress) / 100;
            $targetCurrentAmount = intval($targetAmount * $targetProgress);
            
            // Generate donations to reach this target
            $remainingAmount = $targetCurrentAmount;
            $donationCount = 0;
            $maxDonations = rand(8, 25); // Reasonable number of donations
            $usedUserIds = []; // Track users who have already donated to this campaign
            
            while ($remainingAmount > 0 && $donationCount < $maxDonations) {
                // Create varied donation amounts based on remaining amount and campaign size
                $donationAmount = $this->generateRealisticDonationAmount($remainingAmount, $targetAmount, $donationCount, $maxDonations);
                
                if ($donationAmount <= 0) break;
                
                // Select a user (prefer new users, but allow repeat donors if needed)
                $availableUsers = $users->whereNotIn('id', $usedUserIds);
                if ($availableUsers->isEmpty() || (count($usedUserIds) >= 3 && rand(1, 100) <= 30)) {
                    // If no new users available or 30% chance for repeat donation
                    $selectedUser = $users->random();
                } else {
                    // Select a new user who hasn't donated to this campaign yet
                    $selectedUser = $availableUsers->random();
                    $usedUserIds[] = $selectedUser->id;
                }
                
                $donation = Donation::create([
                    'campaign_id' => $campaign->id,
                    'user_id' => $selectedUser->id,
                    'amount' => $donationAmount,
                    'message' => $this->getRandomMessage(),
                    'status' => 'completed',
                    'payment_method' => ['momo', 'bank_transfer', 'vnpay'][rand(0, 2)],
                    'created_at' => now()->subDays(rand(0, 30)), // Random date within the last 30 days
                    'updated_at' => now(),
                ]);

                // Update campaign current amount
                $campaign->increment('current_amount', $donationAmount);
                $remainingAmount -= $donationAmount;
                $donationCount++;
            }

            $finalProgress = round(($campaign->fresh()->current_amount / $campaign->target_amount) * 100, 1);
            $this->command->info("Created {$donationCount} donations for campaign: {$campaign->title} (Progress: {$finalProgress}%)");
        }
    }
    
    private function getWeightedScenario(): string 
    {
        $weights = [
            'new' => 30,         // 30% chance
            'developing' => 40,  // 40% chance  
            'successful' => 25,  // 25% chance
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
    
    private function generateRealisticDonationAmount(int $remainingAmount, int $targetAmount, int $donationCount, int $maxDonations): int
    {
        // Calculate proportional donation ranges based on campaign size
        if ($targetAmount <= 50000000) { // Small campaigns (<=50M)
            $ranges = [50000, 500000, 2000000]; // 50k-2M
        } elseif ($targetAmount <= 200000000) { // Medium campaigns (<=200M)
            $ranges = [100000, 1000000, 5000000]; // 100k-5M
        } else { // Large campaigns (>200M)
            $ranges = [200000, 2000000, 10000000]; // 200k-10M
        }
        
        // Adjust donation size based on remaining amount and donation position
        $progressInDonations = $donationCount / $maxDonations;
        
        if ($progressInDonations < 0.3) {
            // Early donations: smaller amounts
            $maxAmount = min($ranges[1], $remainingAmount);
            $minAmount = min($ranges[0], $maxAmount);
        } elseif ($progressInDonations < 0.7) {
            // Mid donations: varied amounts
            $maxAmount = min($ranges[2], $remainingAmount);
            $minAmount = min($ranges[0], $maxAmount);
        } else {
            // Late donations: try to complete the campaign
            $avgRemaining = intval($remainingAmount / max(1, $maxDonations - $donationCount));
            $maxAmount = min($avgRemaining * 2, $remainingAmount);
            $minAmount = min($ranges[0], $maxAmount);
        }
        
        // Ensure minimum donation amount
        if ($minAmount < 50000) $minAmount = 50000;
        if ($maxAmount < $minAmount) $maxAmount = $minAmount;
        
        // Don't exceed remaining amount
        $maxAmount = min($maxAmount, $remainingAmount);
        
        return $minAmount >= $maxAmount ? $maxAmount : rand($minAmount, $maxAmount);
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
