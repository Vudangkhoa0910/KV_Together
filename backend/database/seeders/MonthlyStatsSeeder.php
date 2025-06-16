<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;
use Carbon\Carbon;

class MonthlyStatsSeeder extends Seeder
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

        $this->command->info('Clearing existing stats donations...');
        // Chỉ xóa stats donations, giữ lại donations thực tế
        Donation::where('is_stats', true)->delete();
        
        // Tính lại current_amount cho campaigns dựa trên donations thực tế
        $campaigns->each(function ($campaign) {
            $realDonations = Donation::where('campaign_id', $campaign->id)
                ->where('is_stats', false)
                ->sum('amount');
            $campaign->update(['current_amount' => $realDonations]);
        });

        // Sinh dữ liệu từ tháng 7/2024 đến tháng 6/2025 (12 tháng)
        for ($monthOffset = 11; $monthOffset >= 0; $monthOffset--) {
            $targetMonth = Carbon::create(2024, 7)->addMonths(11 - $monthOffset);
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
                
                $donationDate = $this->getRandomDateInMonth($startOfMonth, $endOfMonth);
                
                Donation::create([
                    'user_id' => $user->id,
                    'campaign_id' => $campaign->id,
                    'amount' => $donationAmount,
                    'message' => $this->getRandomMessage(),
                    'status' => 'completed',
                    'payment_method' => ['momo', 'bank_transfer', 'vnpay'][rand(0, 2)],
                    'is_stats' => true, // Đánh dấu đây là stats donation
                    'created_at' => $donationDate,
                    'updated_at' => $donationDate,
                ]);

                // DO NOT update campaign amount for stats donations
                // Stats donations are for reporting purposes only and should not affect campaign progress
                
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
            $targetMonth = Carbon::create(2024, 7)->addMonths($monthOffset);
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
        // Tạo pattern tăng/giảm xen kẽ với số lượng donations ít hơn 5-8 lần
        // Từ 900 xuống còn khoảng 25-90 donations/tháng
        $baseMetrics = [
            11 => ['donations' => 25, 'avg_amount' => 450000],   // Jul 2024 - thấp
            10 => ['donations' => 45, 'avg_amount' => 520000],   // Aug 2024 - tăng
            9 => ['donations' => 35, 'avg_amount' => 480000],    // Sep 2024 - giảm
            8 => ['donations' => 60, 'avg_amount' => 580000],    // Oct 2024 - tăng mạnh
            7 => ['donations' => 50, 'avg_amount' => 550000],    // Nov 2024 - giảm nhẹ
            6 => ['donations' => 80, 'avg_amount' => 620000],    // Dec 2024 - peak (Tết)
            5 => ['donations' => 70, 'avg_amount' => 600000],    // Jan 2025 - giảm sau Tết
            4 => ['donations' => 40, 'avg_amount' => 500000],    // Feb 2025 - thấp (sau Tết)
            3 => ['donations' => 65, 'avg_amount' => 580000],    // Mar 2025 - hồi phục
            2 => ['donations' => 55, 'avg_amount' => 560000],    // Apr 2025 - ổn định
            1 => ['donations' => 75, 'avg_amount' => 640000],    // May 2025 - tăng
            0 => ['donations' => 90, 'avg_amount' => 680000],    // Jun 2025 - cao nhất
        ];

        return $baseMetrics[$monthOffset] ?? ['donations' => 50, 'avg_amount' => 600000];
    }

    private function generateRealisticAmount(int $targetAmount, int $monthOffset): int
    {
        $metrics = $this->getMonthlyMetrics($monthOffset);
        $baseAmount = $metrics['avg_amount'];
        
        $random = rand(1, 100);
        $amount = 0;
        
        if ($random <= 50) {
            // Nhỏ hơn: 50,000 - 500,000 VND
            $amount = rand(50000, 500000);
        } elseif ($random <= 80) {
            // Trung bình: 100,000 - 2,000,000 VND
            $amount = rand(100000, 2000000);
        } else {
            // Lớn: 500,000 - 5,000,000 VND
            $amount = rand(500000, 5000000);
        }
        
        // Làm tròn thành số chẵn (chia hết cho 10,000)
        return floor($amount / 10000) * 10000;
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
