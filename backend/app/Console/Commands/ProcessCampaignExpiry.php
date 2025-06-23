<?php

namespace App\Console\Commands;

use App\Services\CampaignExpiryService;
use Illuminate\Console\Command;

class ProcessCampaignExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'campaigns:process-expiry 
                            {--campaign= : Process specific campaign ID}
                            {--action=credits : Action to take (credits, extend, complete)}
                            {--dry-run : Show what would be processed without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process expired campaigns and convert donations to credits or take other actions';

    private CampaignExpiryService $expiryService;

    public function __construct(CampaignExpiryService $expiryService)
    {
        parent::__construct();
        $this->expiryService = $expiryService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔄 Starting campaign expiry processing...');

        try {
            if ($this->option('campaign')) {
                return $this->processSingleCampaign();
            }

            if ($this->option('dry-run')) {
                return $this->dryRun();
            }

            return $this->processAllExpiredCampaigns();

        } catch (\Exception $e) {
            $this->error('❌ Error processing campaigns: ' . $e->getMessage());
            return 1;
        }
    }

    private function processSingleCampaign(): int
    {
        $campaignId = (int) $this->option('campaign');
        $action = $this->option('action');

        $this->info("Processing campaign ID: {$campaignId} with action: {$action}");

        $result = $this->expiryService->processSpecificCampaign($campaignId, $action);

        $this->displayResult($result);
        
        return 0;
    }

    private function dryRun(): int
    {
        $nearExpiry = $this->expiryService->getCampaignsNearingExpiry();
        
        $this->info('📊 Campaigns that would be processed (dry run):');
        $this->newLine();

        if ($nearExpiry->isEmpty()) {
            $this->info('✅ No expired campaigns to process.');
            return 0;
        }

        $headers = ['ID', 'Title', 'End Date', 'Target', 'Current', 'Success %', 'Donations'];
        $rows = [];

        foreach ($nearExpiry as $campaign) {
            $successRate = $campaign->target_amount > 0 
                ? round(($campaign->current_amount / $campaign->target_amount) * 100, 2)
                : 0;

            $rows[] = [
                $campaign->id,
                \Str::limit($campaign->title, 40),
                $campaign->end_date->format('Y-m-d H:i'),
                number_format($campaign->target_amount, 0, ',', '.'),
                number_format($campaign->current_amount, 0, ',', '.'),
                $successRate . '%',
                $campaign->donations->count()
            ];
        }

        $this->table($headers, $rows);
        
        return 0;
    }

    private function processAllExpiredCampaigns(): int
    {
        $results = $this->expiryService->processExpiredCampaigns();

        $this->info('📊 Campaign Expiry Processing Results:');
        $this->newLine();

        $this->info("✅ Campaigns processed: {$results['processed']}");
        $this->info("❌ Campaigns failed: {$results['failed']}");
        $this->info("💰 Total amount: " . number_format($results['total_amount'], 0, ',', '.') . ' VND');
        $this->info("🪙 Total credits issued: " . number_format($results['total_credits'], 0, ',', '.') . ' Credits');

        if (!empty($results['campaigns'])) {
            $this->newLine();
            $this->info('📋 Detailed results:');
            
            $headers = ['Campaign', 'Target', 'Current', 'Success %', 'Credits', 'Action'];
            $rows = [];

            foreach ($results['campaigns'] as $campaign) {
                $rows[] = [
                    \Str::limit($campaign['campaign_title'], 30),
                    number_format($campaign['target_amount'], 0, ',', '.'),
                    number_format($campaign['current_amount'], 0, ',', '.'),
                    $campaign['success_percentage'] . '%',
                    number_format($campaign['total_credits'], 0, ',', '.'),
                    $campaign['action_taken']
                ];
            }

            $this->table($headers, $rows);
        }

        // Show statistics
        $stats = $this->expiryService->getExpiryStatistics();
        $this->newLine();
        $this->info('📈 Overall Statistics:');
        $this->info("• Total expired campaigns: {$stats['total_expired']}");
        $this->info("• Total credits in circulation: " . number_format($stats['total_credits_issued'], 0, ',', '.'));
        $this->info("• Users with credits: {$stats['users_with_credits']}");
        $this->info("• Average credits per user: " . number_format($stats['avg_credits_per_user'], 0, ',', '.'));
        $this->info("• Campaigns nearing expiry: {$stats['campaigns_near_expiry']}");

        return 0;
    }

    private function displayResult(array $result): void
    {
        $this->newLine();
        $this->info('✅ Campaign processed successfully!');
        
        foreach ($result as $key => $value) {
            if (is_numeric($value)) {
                $value = number_format($value, 0, ',', '.');
            }
            $this->info("• " . ucfirst(str_replace('_', ' ', $key)) . ": {$value}");
        }
    }
}
