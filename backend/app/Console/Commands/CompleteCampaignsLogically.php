<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use Illuminate\Console\Command;

class CompleteCampaignsLogically extends Command
{
    protected $signature = 'campaigns:complete-logically';
    protected $description = 'Complete campaigns that have reached target or expired logically';

    public function handle()
    {
        $this->info('Finding campaigns to complete logically...');

        $campaigns = Campaign::where('status', 'active')->get();
        $completed = 0;

        foreach ($campaigns as $campaign) {
            $shouldComplete = false;
            $reason = '';

            // Logic 1: Campaign đã đạt hoặc vượt 100% mục tiêu
            if ($campaign->current_amount >= $campaign->target_amount) {
                $shouldComplete = true;
                $reason = 'reached target';
            }
            
            // Logic 2: Campaign đã hết hạn (past end_date)
            else if ($campaign->end_date < now()) {
                $shouldComplete = true;
                $reason = 'expired';
            }
            
            // Logic 3: Campaign gần đạt mục tiêu (95%+) và gần hết hạn (trong 3 ngày)
            else if ($campaign->current_amount >= $campaign->target_amount * 0.95 && 
                     $campaign->end_date <= now()->addDays(3)) {
                $shouldComplete = true;
                $reason = 'nearly completed and near deadline';
            }

            if ($shouldComplete) {
                $campaign->update(['status' => 'completed']);
                $this->line("✓ Completed campaign {$campaign->id}: {$campaign->title}");
                $this->line("  Reason: {$reason}");
                $this->line("  Amount: " . number_format($campaign->current_amount) . " / " . number_format($campaign->target_amount));
                $completed++;
            }
        }

        if ($completed === 0) {
            $this->info('No campaigns meet the criteria for logical completion.');
            
            // Show some stats
            $highProgress = $campaigns->where('current_amount', '>=', function($campaign) { 
                return $campaign->target_amount * 0.7; 
            })->count();
            
            $expired = $campaigns->where('end_date', '<', now())->count();
            
            $this->line("Stats:");
            $this->line("- {$highProgress} campaigns with 70%+ progress");
            $this->line("- {$expired} campaigns past deadline");
        } else {
            $this->info("Successfully completed {$completed} campaigns!");
        }

        return 0;
    }
}
