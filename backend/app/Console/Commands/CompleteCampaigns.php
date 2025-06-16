<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use Illuminate\Console\Command;

class CompleteCampaigns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:complete';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động chuyển trạng thái chiến dịch thành hoàn thành khi đạt mục tiêu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Đang kiểm tra các chiến dịch đã đạt mục tiêu...');

        // Tìm các chiến dịch active nhưng đã đạt hoặc vượt mục tiêu
        $campaignsToComplete = Campaign::where('status', 'active')
            ->whereColumn('current_amount', '>=', 'target_amount')
            ->get();

        if ($campaignsToComplete->isEmpty()) {
            $this->info('Không có chiến dịch nào cần cập nhật trạng thái.');
            return;
        }

        $completed = 0;
        foreach ($campaignsToComplete as $campaign) {
            $campaign->update(['status' => 'completed']);
            $this->line("✓ Đã dừng chiến dịch: {$campaign->title}");
            $completed++;
        }

        $this->info("Đã cập nhật trạng thái cho {$completed} chiến dịch.");
    }
}
