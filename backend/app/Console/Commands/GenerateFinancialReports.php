<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FinancialReportService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateFinancialReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'financial:generate-reports 
                            {type=monthly : Type of report (monthly, quarterly, yearly, all)}
                            {--verify : Auto-verify generated reports}
                            {--public : Make reports public}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate financial reports for transparency';

    protected $reportService;

    public function __construct(FinancialReportService $reportService)
    {
        parent::__construct();
        $this->reportService = $reportService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->argument('type');
        $verify = $this->option('verify');
        $makePublic = $this->option('public');

        // Get system admin user
        $admin = User::whereHas('role', function($q) {
            $q->where('slug', 'admin');
        })->first();

        if (!$admin) {
            $this->error('No admin user found. Please create an admin user first.');
            return Command::FAILURE;
        }

        $this->info("🔄 Generating {$type} financial reports...");

        try {
            switch ($type) {
                case 'monthly':
                    $this->generateMonthlyReports($admin->id, $verify, $makePublic);
                    break;
                case 'quarterly':
                    $this->generateQuarterlyReports($admin->id, $verify, $makePublic);
                    break;
                case 'yearly':
                    $this->generateYearlyReports($admin->id, $verify, $makePublic);
                    break;
                case 'all':
                    $this->generateMonthlyReports($admin->id, $verify, $makePublic);
                    $this->generateQuarterlyReports($admin->id, $verify, $makePublic);
                    $this->generateYearlyReports($admin->id, $verify, $makePublic);
                    break;
                default:
                    $this->error("Invalid report type: {$type}");
                    return Command::FAILURE;
            }

            $this->info('✅ Financial reports generated successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to generate reports: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Generate monthly reports
     */
    private function generateMonthlyReports(int $adminId, bool $verify, bool $makePublic): void
    {
        $this->info('📊 Generating monthly reports...');

        $bar = $this->output->createProgressBar(12);
        $bar->start();

        for ($i = 0; $i < 12; $i++) {
            $targetDate = Carbon::now()->subMonths($i);
            $year = $targetDate->year;
            $month = $targetDate->month;

            try {
                $report = $this->reportService->generateMonthlyReport($year, $month, $adminId);
                
                if ($verify || $makePublic) {
                    $updateData = [];
                    if ($verify) {
                        $updateData['is_verified'] = true;
                        $updateData['verified_at'] = now();
                        $updateData['verified_by'] = $adminId;
                    }
                    if ($makePublic) {
                        $updateData['is_public'] = true;
                    }
                    
                    if (!empty($updateData)) {
                        $report->update($updateData);
                    }
                }

                $bar->advance();
            } catch (\Exception $e) {
                $this->warn("\n⚠ Failed to generate monthly report for {$year}-{$month}: " . $e->getMessage());
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
    }

    /**
     * Generate quarterly reports
     */
    private function generateQuarterlyReports(int $adminId, bool $verify, bool $makePublic): void
    {
        $this->info('📊 Generating quarterly reports...');

        $bar = $this->output->createProgressBar(4);
        $bar->start();

        for ($i = 0; $i < 4; $i++) {
            $targetDate = Carbon::now()->subQuarters($i);
            $year = $targetDate->year;
            $quarter = $targetDate->quarter;

            try {
                $report = $this->reportService->generateQuarterlyReport($year, $quarter, $adminId);
                
                if ($verify || $makePublic) {
                    $updateData = [];
                    if ($verify) {
                        $updateData['is_verified'] = true;
                        $updateData['verified_at'] = now();
                        $updateData['verified_by'] = $adminId;
                    }
                    if ($makePublic) {
                        $updateData['is_public'] = true;
                    }
                    
                    if (!empty($updateData)) {
                        $report->update($updateData);
                    }
                }

                $bar->advance();
            } catch (\Exception $e) {
                $this->warn("\n⚠ Failed to generate quarterly report for Q{$quarter} {$year}: " . $e->getMessage());
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
    }

    /**
     * Generate yearly reports
     */
    private function generateYearlyReports(int $adminId, bool $verify, bool $makePublic): void
    {
        $this->info('📊 Generating yearly reports...');

        $currentYear = Carbon::now()->year;
        $years = [$currentYear - 1, $currentYear];

        $bar = $this->output->createProgressBar(count($years));
        $bar->start();

        foreach ($years as $year) {
            try {
                $report = $this->reportService->generateYearlyReport($year, $adminId);
                
                if ($verify || $makePublic) {
                    $updateData = [];
                    if ($verify) {
                        $updateData['is_verified'] = true;
                        $updateData['verified_at'] = now();
                        $updateData['verified_by'] = $adminId;
                    }
                    if ($makePublic) {
                        $updateData['is_public'] = true;
                    }
                    
                    if (!empty($updateData)) {
                        $report->update($updateData);
                    }
                }

                $bar->advance();
            } catch (\Exception $e) {
                $this->warn("\n⚠ Failed to generate yearly report for {$year}: " . $e->getMessage());
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
    }
}
