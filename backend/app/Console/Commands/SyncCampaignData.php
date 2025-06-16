<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Campaign;

class SyncCampaignData extends Command
{
    protected $signature = 'campaigns:sync-data';
    protected $description = 'Sync campaign data with real donations';

    public function handle()
    {
        $this->info('Starting campaign data synchronization...');

        $campaigns = Campaign::all();
        $updated = 0;

        foreach ($campaigns as $campaign) {
            // Tính toán từ real donations (không phải stats)
            $realAmount = $campaign->realDonations()->sum('amount');
            $realCount = $campaign->realDonations()->count();
            
            // Cập nhật current_amount để khớp với real donations
            $oldAmount = $campaign->current_amount;
            $campaign->current_amount = $realAmount;
            $campaign->save();
            
            if ($oldAmount != $realAmount) {
                $this->line("Campaign {$campaign->id}: {$campaign->title}");
                $this->line("  Updated amount: " . number_format($oldAmount) . " → " . number_format($realAmount));
                $this->line("  Real donations count: {$realCount}");
                $updated++;
            }
        }

        $this->info("Synchronized {$updated} campaigns successfully!");
        return 0;
    }
}
