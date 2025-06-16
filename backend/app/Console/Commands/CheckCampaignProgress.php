<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckCampaignProgress extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:check-progress';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kiểm tra tiến độ chiến dịch và tự động dừng khi đạt mục tiêu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Đang kiểm tra tiến độ các chiến dịch...');

        // Tìm các chiến dịch active và kiểm tra tiến độ
        $activeCampaigns = Campaign::where('status', 'active')->get();

        $completedCount = 0;
        $nearCompletionCount = 0;
        $nearExpiryCount = 0;

        foreach ($activeCampaigns as $campaign) {
            $progressPercent = ($campaign->current_amount / $campaign->target_amount) * 100;
            $daysRemaining = now()->diffInDays($campaign->end_date, false);

            // Tự động dừng chiến dịch khi đạt >= 100% mục tiêu
            if ($campaign->current_amount >= $campaign->target_amount) {
                $campaign->update(['status' => 'completed']);
                $this->line("✓ Hoàn thành chiến dịch: {$campaign->title} (100%)");
                
                // Log completion instead of creating notification for now
                Log::info("Campaign completed: {$campaign->title} (ID: {$campaign->id})");
                
                $completedCount++;
            }
            // Thông báo khi gần hoàn thành (>= 90%)
            elseif ($progressPercent >= 90) {
                $this->line("⚠ Sắp hoàn thành: {$campaign->title} (" . round($progressPercent, 1) . "%)");
                $nearCompletionCount++;
            }

            // Kiểm tra chiến dịch sắp hết hạn (còn <= 3 ngày)
            if ($daysRemaining <= 3 && $daysRemaining > 0 && $campaign->current_amount < $campaign->target_amount) {
                $this->line("⏰ Sắp hết hạn: {$campaign->title} (còn {$daysRemaining} ngày)");
                $nearExpiryCount++;
                
                // Log expiry warning instead of creating notification for now
                Log::info("Campaign expiring: {$campaign->title} (ID: {$campaign->id}, {$daysRemaining} days remaining)");
            }
        }

        if ($completedCount > 0) {
            $this->info("Đã hoàn thành {$completedCount} chiến dịch.");
        }
        
        if ($nearCompletionCount > 0) {
            $this->info("Có {$nearCompletionCount} chiến dịch sắp hoàn thành (>90%).");
        }

        if ($nearExpiryCount > 0) {
            $this->info("Có {$nearExpiryCount} chiến dịch sắp hết hạn (≤3 ngày).");
        }

        if ($completedCount === 0 && $nearCompletionCount === 0 && $nearExpiryCount === 0) {
            $this->info('Không có chiến dịch nào cần cập nhật.');
        }

        Log::info("Campaign progress check completed. Completed: {$completedCount}, Near completion: {$nearCompletionCount}, Near expiry: {$nearExpiryCount}");
    }
}
