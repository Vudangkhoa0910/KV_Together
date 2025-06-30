<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\FinancialReport;
use App\Models\User;
use App\Services\FinancialReportService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FinancialReportSeeder extends Seeder
{
    protected $reportService;

    public function __construct()
    {
        $this->reportService = app(FinancialReportService::class);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Generating financial reports...');

        // Get admin user for generating reports
        $admin = User::whereHas('role', function($q) {
            $q->where('slug', 'admin');
        })->first();

        if (!$admin) {
            $this->command->error('No admin user found. Please run UserSeeder first.');
            return;
        }

        // Generate monthly reports for the last 12 months
        $this->generateMonthlyReports($admin->id);

        // Generate quarterly reports for the last 4 quarters
        $this->generateQuarterlyReports($admin->id);

        // Generate yearly reports for the last 2 years
        $this->generateYearlyReports($admin->id);

        // Generate campaign-specific reports for some campaigns
        $this->generateCampaignReports($admin->id);

        $this->command->info('✅ Financial reports generated successfully!');
    }

    /**
     * Generate monthly reports
     */
    private function generateMonthlyReports(int $adminId): void
    {
        $this->command->info('📊 Generating monthly reports...');

        $currentDate = Carbon::now();
        
        for ($i = 0; $i < 12; $i++) {
            $targetDate = $currentDate->copy()->subMonths($i);
            $year = $targetDate->year;
            $month = $targetDate->month;

            try {
                $report = $this->reportService->generateMonthlyReport($year, $month, $adminId);
                
                // Mark as verified for public viewing
                $report->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                    'verified_by' => $adminId
                ]);

                $this->command->info("✓ Monthly report generated for {$year}-{$month}");
            } catch (\Exception $e) {
                $this->command->warn("⚠ Failed to generate monthly report for {$year}-{$month}: " . $e->getMessage());
            }
        }
    }

    /**
     * Generate quarterly reports
     */
    private function generateQuarterlyReports(int $adminId): void
    {
        $this->command->info('📊 Generating quarterly reports...');

        $currentDate = Carbon::now();
        
        for ($i = 0; $i < 4; $i++) {
            $targetDate = $currentDate->copy()->subQuarters($i);
            $year = $targetDate->year;
            $quarter = $targetDate->quarter;

            try {
                $report = $this->reportService->generateQuarterlyReport($year, $quarter, $adminId);
                
                // Mark as verified for public viewing
                $report->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                    'verified_by' => $adminId
                ]);

                $this->command->info("✓ Quarterly report generated for Q{$quarter} {$year}");
            } catch (\Exception $e) {
                $this->command->warn("⚠ Failed to generate quarterly report for Q{$quarter} {$year}: " . $e->getMessage());
            }
        }
    }

    /**
     * Generate yearly reports
     */
    private function generateYearlyReports(int $adminId): void
    {
        $this->command->info('📊 Generating yearly reports...');

        $currentYear = Carbon::now()->year;
        
        for ($year = $currentYear - 1; $year <= $currentYear; $year++) {
            try {
                $report = $this->reportService->generateYearlyReport($year, $adminId);
                
                // Mark as verified for public viewing
                $report->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                    'verified_by' => $adminId
                ]);

                $this->command->info("✓ Yearly report generated for {$year}");
            } catch (\Exception $e) {
                $this->command->warn("⚠ Failed to generate yearly report for {$year}: " . $e->getMessage());
            }
        }
    }

    /**
     * Generate campaign-specific reports
     */
    private function generateCampaignReports(int $adminId): void
    {
        $this->command->info('📊 Generating campaign-specific reports...');

        // Get some completed campaigns with donations
        $campaigns = Campaign::where('status', 'completed')
            ->whereHas('donations')
            ->limit(5)
            ->get();

        foreach ($campaigns as $campaign) {
            try {
                $report = $this->reportService->generateCampaignReport($campaign, $adminId);
                
                // Mark as verified for public viewing
                $report->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                    'verified_by' => $adminId
                ]);

                $this->command->info("✓ Campaign report generated for: {$campaign->title}");
            } catch (\Exception $e) {
                $this->command->warn("⚠ Failed to generate campaign report for {$campaign->title}: " . $e->getMessage());
            }
        }
    }
}
