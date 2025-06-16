<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use Carbon\Carbon;

class MonthlyStatsSeederNew extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->generateHistoricalDonations();
        $this->updateCampaignCreationDates();
        $this->command->info('Monthly statistics data seeded successfully.');
    }

    private function generateHistoricalDonations(): void
    {
        $campaigns = Campaign::where('status', 'active')->get();
        $users = User::whereHas('role', function($q) {
            $q->where('slug', 'user');
        })->where('status', 'active')->get();

        if ($campaigns->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No active campaigns or users found.');
            return;
        }

        $this->command->info('Clearing existing donations...');
        Donation::truncate();
        Campaign::query()->update(['current_amount' => 0]);

        for ($monthOffset = 11; $monthOffset >= 0; $monthOffset--) {
            $targetMonth = now()->subMonths($monthOffset);
            $startOfMonth = $targetMonth->copy()->startOfMonth();
            $endOfMonth = $targetMonth->copy()->endOfMonth();
            
            $monthlyMetrics = $this->getMonthlyMetrics($monthOffset);
            
            $this->command->info("Generating donations for {$targetMonth->format('F Y')} - Target: {$monthlyMetrics['donations']} donations");
            
            $donationsCreated = 0;
            $totalAmountThisMonth = 0;
            $usersThisMonth = collect();
            
            while ($donationsCreated < $monthlyMetrics['donations']) {
                $campaign = $campaigns->random();
                $user = $users->random();
                
                $donationAmount = $this->generateRealisticAmount($campaign->target_amount, $monthOffset);
                
                $newCurrentAmount = $campaign->current_amount + $donationAmount;
                if ($newCurrentAmount > ($campaign->target_amount * 0.95)) {
                    $availableCampaigns = $campaigns->filter(function($c) {
                        return $c->current_amount < ($c->target_amount * 0.95);
                    });
                    
                    if ($availableCampaigns->isEmpty()) {
                        break;
                    }
                    
                    $campaign = $availableCampaigns->random();
                    $maxAmount = ($campaign->target_amount * 0.95) - $campaign->current_amount;
                    $donationAmount = min($donationAmount, $maxAmount);
                }
                
                $donationDate = $this->getRandomDateInMonth($startOfMonth, $endOfMonth);
                
                Donation::create([
                    'user_id' => $user->id,
                    'campaign_id' => $campaign->id,
                    'amount' => $donationAmount,
                    'message' => $this->getRandomMessage(),
                    'status' => 'completed',
                    'payment_method' => ['momo', 'bank_transfer', 'vnpay'][rand(0, 2)],
                    'created_at' => $donationDate,
                    'updated_at' => $donationDate,
                ]);

                $campaign->increment('current_amount', $donationAmount);
                $campaign = $campaign->fresh();
                
                $totalAmountThisMonth += $donationAmount;
                $usersThisMonth->push($user->id);
                $donationsCreated++;
            }
            
            $uniqueDonors = $usersThisMonth->unique()->count();
            $this->command->info("Month {$targetMonth->format('M Y')}: {$donationsCreated} donations, " . 
                               number_format($totalAmountThisMonth) . " VND, {$uniqueDonors} unique donors");
        }
    }

    private function updateCampaignCreationDates(): void
    {
        $campaigns = Campaign::all();
        
        foreach ($campaigns as $campaign) {
            $monthOffset = rand(0, 11);
            $targetMonth = now()->subMonths($monthOffset);
            $creationDate = $this->getRandomDateInMonth(
                $targetMonth->copy()->startOfMonth(),
                $targetMonth->copy()->endOfMonth()
            );
            
            $campaign->update([
                'created_at' => $creationDate,
                'start_date' => $creationDate,
                'end_date' => $creationDate->copy()->addMonths(rand(3, 12)),
            ]);
        }
    }

    private function getMonthlyMetrics(int $monthOffset): array
    {
        $baseMetrics = [
            11 => ['donations' => 150, 'avg_amount' => 500000],
            10 => ['donations' => 180, 'avg_amount' => 520000],
            9 => ['donations' => 220, 'avg_amount' => 550000],
            8 => ['donations' => 280, 'avg_amount' => 580000],
            7 => ['donations' => 340, 'avg_amount' => 600000],
            6 => ['donations' => 420, 'avg_amount' => 620000],
            5 => ['donations' => 480, 'avg_amount' => 650000],
            4 => ['donations' => 560, 'avg_amount' => 680000],
            3 => ['donations' => 640, 'avg_amount' => 700000],
            2 => ['donations' => 720, 'avg_amount' => 720000],
            1 => ['donations' => 820, 'avg_amount' => 750000],
            0 => ['donations' => 900, 'avg_amount' => 800000],
        ];

        return $baseMetrics[$monthOffset] ?? ['donations' => 200, 'avg_amount' => 600000];
    }

    private function generateRealisticAmount(int $targetAmount, int $monthOffset): int
    {
        $metrics = $this->getMonthlyMetrics($monthOffset);
        $baseAmount = $metrics['avg_amount'];
        
        $random = rand(1, 100);
        
        if ($random <= 50) {
            return rand($baseAmount * 0.1, $baseAmount * 0.5);
        } elseif ($random <= 80) {
            return rand($baseAmount * 0.5, $baseAmount * 1.5);
        } else {
            return rand($baseAmount * 1.5, $baseAmount * 3);
        }
    }

    private function getRandomDateInMonth(Carbon $startOfMonth, Carbon $endOfMonth): Carbon
    {
        $dayInMonth = rand(1, $startOfMonth->daysInMonth);
        $hourInDay = rand(0, 23);
        $minuteInHour = rand(0, 59);
        
        return $startOfMonth->copy()->addDays($dayInMonth - 1)->setTime($hourInDay, $minuteInHour);
    }

    private function getRandomMessage(): string
    {
        $messages = [
            'Ủng hộ chiến dịch ý nghĩa!',
            'Chúc chiến dịch thành công!',
            'Mong muốn giúp đỡ cộng đồng',
            'Đóng góp vào việc thiện nguyện',
            'Hy vọng sẽ giúp được nhiều người',
            'Gửi chút tấm lòng đến mọi người',
            'Chúc dự án sớm đạt mục tiêu',
            'Rất mong dự án thành công',
            'Góp sức vào công việc thiện nguyện',
            'Chúc các bạn hoàn thành mục tiêu',
        ];
        
        return $messages[array_rand($messages)];
    }
}
