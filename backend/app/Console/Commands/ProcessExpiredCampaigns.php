<?php

namespace App\Console\Commands;

<<<<<<< HEAD
use App\Models\Campaign;
use App\Models\CampaignClosure;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
=======
use Illuminate\Console\Command;
>>>>>>> origin/main

class ProcessExpiredCampaigns extends Command
{
    /**
     * The name and signature of the console command.
<<<<<<< HEAD
     */
    protected $signature = 'campaigns:process-expired {--dry-run : Run without making changes}';

    /**
     * The console command description.
     */
    protected $description = 'Process expired campaigns and create closure records';
=======
     *
     * @var string
     */
    protected $signature = 'campaigns:process-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';
>>>>>>> origin/main

    /**
     * Execute the console command.
     */
    public function handle()
    {
<<<<<<< HEAD
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 Running in DRY-RUN mode - no changes will be made');
        }

        // Tìm các chiến dịch đã hết hạn nhưng chưa được xử lý
        $expiredCampaigns = Campaign::where('status', 'active')
            ->where('end_date', '<=', now())
            ->whereDoesntHave('closure')
            ->get();

        if ($expiredCampaigns->isEmpty()) {
            $this->info('✅ No expired campaigns found to process');
            return 0;
        }

        $this->info("🔍 Found {$expiredCampaigns->count()} expired campaigns to process");

        $completed = 0;
        $partialCompleted = 0;
        $failed = 0;
        $errors = 0;

        foreach ($expiredCampaigns as $campaign) {
            try {
                $this->info("\n📋 Processing Campaign ID: {$campaign->id}");
                $this->info("   Title: {$campaign->title}");
                $this->info("   Target: " . number_format($campaign->target_amount) . " VND");
                $this->info("   Current: " . number_format($campaign->current_amount) . " VND");
                $this->info("   Progress: {$campaign->progress_percentage}%");
                $this->info("   End Date: {$campaign->end_date}");
                $this->info("   Funding Type: " . ($campaign->funding_type ?? 'all_or_nothing'));

                if (!$dryRun) {
                    DB::beginTransaction();
                    
                    $closure = $campaign->processClosure([
                        'platform_fee_percent' => 3.0,
                        'reason' => 'Campaign expired automatically'
                    ]);

                    DB::commit();

                    $this->info("   ✅ Closure created: {$closure->closure_type}");
                    
                    if ($closure->disbursement_amount > 0) {
                        $this->info("   💰 Disbursement: " . number_format($closure->disbursement_amount) . " VND");
                        $this->info("   💳 Platform Fee: " . number_format($closure->platform_fee) . " VND");
                    }

                    // Count by closure type
                    match($closure->closure_type) {
                        CampaignClosure::CLOSURE_COMPLETED => $completed++,
                        CampaignClosure::CLOSURE_PARTIAL_COMPLETED => $partialCompleted++,
                        CampaignClosure::CLOSURE_FAILED => $failed++,
                        default => null
                    };
                } else {
                    // Dry run - just show what would happen
                    $closureType = $campaign->current_amount >= $campaign->target_amount 
                        ? CampaignClosure::CLOSURE_COMPLETED
                        : ($campaign->funding_type === Campaign::FUNDING_FLEXIBLE 
                            ? CampaignClosure::CLOSURE_PARTIAL_COMPLETED 
                            : CampaignClosure::CLOSURE_FAILED);
                    
                    $this->info("   🔍 Would create closure: {$closureType}");
                    
                    if ($closureType !== CampaignClosure::CLOSURE_FAILED) {
                        $platformFee = $campaign->current_amount * 0.03;
                        $disbursement = $campaign->current_amount - $platformFee;
                        $this->info("   💰 Would disburse: " . number_format($disbursement) . " VND");
                        $this->info("   💳 Platform fee: " . number_format($platformFee) . " VND");
                    } else {
                        $this->info("   ↩️ Would require refund processing");
                    }
                }

            } catch (\Exception $e) {
                if (!$dryRun) {
                    DB::rollBack();
                }
                
                $this->error("   ❌ Error processing campaign {$campaign->id}: " . $e->getMessage());
                $errors++;
            }
        }

        // Summary
        $this->info("\n" . str_repeat('=', 50));
        $this->info("📊 PROCESSING SUMMARY");
        $this->info(str_repeat('=', 50));
        
        if (!$dryRun) {
            $this->info("✅ Completed successfully: {$completed}");
            $this->info("🟡 Partial completed: {$partialCompleted}");
            $this->info("❌ Failed (need refund): {$failed}");
            $this->info("🚫 Errors: {$errors}");
        } else {
            $this->info("🔍 This was a DRY-RUN. No actual changes were made.");
            $this->info("📋 Total campaigns that would be processed: {$expiredCampaigns->count()}");
        }

        return 0;
=======
        //
>>>>>>> origin/main
    }
}
