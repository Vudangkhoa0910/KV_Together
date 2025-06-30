<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Campaign;

class FixCampaignStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaign:fix-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix campaign statuses according to correct business logic';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting campaign status fix...');

        $campaigns = Campaign::all();
        $fixed = 0;

        foreach ($campaigns as $campaign) {
            $current = $campaign->current_amount ?? 0;
            $target = $campaign->target_amount ?? 0;
            $isExpired = $campaign->end_date && now()->gt($campaign->end_date);
            $targetReached = $target > 0 && $current >= $target;
            
            $correctStatus = null;
            
            // Determine correct status
            if ($targetReached) {
                // Hoàn thành: đạt đủ target (bất kể thời gian)
                $correctStatus = 'completed';
            } elseif ($isExpired) {
                // Đã kết thúc: hết hạn + chưa đạt target
                if ($campaign->funding_type === 'flexible' || ($campaign->minimum_goal && $current >= $campaign->minimum_goal)) {
                    $correctStatus = 'ended_partial';
                } else {
                    $correctStatus = 'ended_failed';
                }
            } elseif ($campaign->status === 'active' || in_array($campaign->status, ['completed', 'ended_failed', 'ended_partial'])) {
                // Đang hoạt động: chưa hết hạn + chưa đạt target
                $correctStatus = 'active';
            } else {
                // Giữ nguyên các status khác (pending, draft, rejected, etc.)
                continue;
            }
            
            if ($campaign->status !== $correctStatus) {
                $this->line("Campaign ID {$campaign->id}: {$campaign->status} -> {$correctStatus}");
                $this->line("  Current: {$current}, Target: {$target}, Expired: " . ($isExpired ? 'Yes' : 'No'));
                
                $campaign->update(['status' => $correctStatus]);
                $fixed++;
            }
        }

        $this->info("Fixed {$fixed} campaigns.");

        // Show summary
        $summary = [
            'total' => Campaign::count(),
            'active' => Campaign::where('status', 'active')->count(),
            'completed' => Campaign::where('status', 'completed')->count(),
            'ended_failed' => Campaign::where('status', 'ended_failed')->count(),
            'ended_partial' => Campaign::where('status', 'ended_partial')->count(),
            'other' => Campaign::whereNotIn('status', ['active', 'completed', 'ended_failed', 'ended_partial'])->count(),
        ];

        $this->info("\nSummary after fix:");
        foreach ($summary as $status => $count) {
            $this->line("  {$status}: {$count}");
        }

        $this->info("Done!");
        return 0;
    }
}
