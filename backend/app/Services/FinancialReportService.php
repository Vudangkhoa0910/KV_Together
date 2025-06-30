<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\FinancialReport;
use App\Models\FinancialTransaction;
use App\Models\CreditTransaction;
use App\Models\PlatformFinancialSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialReportService
{
    /**
     * Generate monthly financial report
     */
    public function generateMonthlyReport(int $year, int $month, ?int $generatedBy = null): FinancialReport
    {
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        return $this->generatePeriodReport(
            'monthly',
            $startDate,
            $endDate,
            null,
            $generatedBy
        );
    }

    /**
     * Generate quarterly financial report
     */
    public function generateQuarterlyReport(int $year, int $quarter, ?int $generatedBy = null): FinancialReport
    {
        $startDate = Carbon::create($year, ($quarter - 1) * 3 + 1, 1)->startOfMonth();
        $endDate = $startDate->copy()->addMonths(2)->endOfMonth();
        
        return $this->generatePeriodReport(
            'quarterly',
            $startDate,
            $endDate,
            null,
            $generatedBy
        );
    }

    /**
     * Generate yearly financial report
     */
    public function generateYearlyReport(int $year, ?int $generatedBy = null): FinancialReport
    {
        $startDate = Carbon::create($year, 1, 1)->startOfYear();
        $endDate = $startDate->copy()->endOfYear();
        
        return $this->generatePeriodReport(
            'yearly',
            $startDate,
            $endDate,
            null,
            $generatedBy
        );
    }

    /**
     * Generate campaign-specific financial report
     */
    public function generateCampaignReport(Campaign $campaign, ?int $generatedBy = null): FinancialReport
    {
        return $this->generatePeriodReport(
            'campaign_specific',
            $campaign->start_date,
            $campaign->end_date ?? now(),
            $campaign->id,
            $generatedBy
        );
    }

    /**
     * Generate financial report for a specific period
     */
    public function generatePeriodReport(
        string $reportType,
        Carbon $startDate,
        Carbon $endDate,
        ?int $campaignId = null,
        ?int $generatedBy = null
    ): FinancialReport {
        DB::beginTransaction();
        
        try {
            // Get base query for the period
            $baseQuery = $campaignId 
                ? Donation::where('campaign_id', $campaignId)
                : Donation::query();
            
            $donations = $baseQuery->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            // Calculate income breakdown
            $incomeData = $this->calculateIncomeBreakdown($donations, $startDate, $endDate, $campaignId);
            
            // Calculate expense breakdown
            $expenseData = $this->calculateExpenseBreakdown($donations, $startDate, $endDate, $campaignId);
            
            // Calculate statistics
            $statsData = $this->calculateStatistics($donations, $startDate, $endDate, $campaignId);
            
            // Create financial report
            $report = FinancialReport::create([
                'report_type' => $reportType,
                'report_period_start' => $startDate->toDateString(),
                'report_period_end' => $endDate->toDateString(),
                'campaign_id' => $campaignId,
                
                // Income - Actual donations received
                'total_income' => $incomeData['total'],
                'donations_income' => $incomeData['donations'],
                'credits_income' => $incomeData['credits'],
                'bank_transfer_income' => $incomeData['bank_transfer'],
                'momo_income' => $incomeData['momo'],
                'vnpay_income' => $incomeData['vnpay'],
                
                // Expenses - Actual fund usage for charity purposes
                'total_expenses' => $expenseData['total'],
                'campaign_disbursements' => $expenseData['disbursements'],
                'platform_fees' => 0, // No platform fees for charity
                'payment_processing_fees' => 0, // No processing fees charged to charity
                'operational_costs' => $expenseData['administrative_costs'],
                'refunds_issued' => $expenseData['refunds'],
                'credits_converted' => 0, // Not applicable for direct charity reporting
                
                // Statistics
                'total_donors' => $statsData['total_donors'],
                'total_transactions' => $statsData['total_transactions'],
                'average_donation' => $statsData['average_donation'],
                'median_donation' => $statsData['median_donation'],
                
                // Fund management - Available and allocated funds
                'reserve_fund' => $this->calculateAvailableFunds($incomeData['total'], $expenseData['total']),
                'pending_disbursements' => $this->calculatePendingDisbursements($campaignId),
                'escrow_balance' => $this->calculateCurrentBalance($campaignId),
                
                'breakdown_details' => [
                    'income_breakdown' => $incomeData,
                    'expense_breakdown' => $expenseData,
                    'monthly_trends' => $this->calculateMonthlyTrends($startDate, $endDate, $campaignId),
                    'donor_demographics' => $this->calculateDonorDemographics($donations),
                    'payment_method_distribution' => $this->calculatePaymentMethodDistribution($donations),
                    'fund_utilization' => $this->calculateFundUtilization($incomeData['total'], $expenseData['total'])
                ],
                
                'generated_at' => now(),
                'generated_by' => $generatedBy,
                'is_public' => true,
                'is_verified' => false
            ]);

            // Create corresponding financial transactions if they don't exist
            $this->ensureFinancialTransactionsExist($donations);

            DB::commit();
            return $report;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Calculate income breakdown
     */
    private function calculateIncomeBreakdown($donations, Carbon $startDate, Carbon $endDate, ?int $campaignId): array
    {
        $totals = [
            'total' => 0,
            'donations' => 0,
            'credits' => 0,
            'bank_transfer' => 0,
            'momo' => 0,
            'vnpay' => 0
        ];

        foreach ($donations as $donation) {
            $amount = $donation->amount;
            $totals['total'] += $amount;
            $totals['donations'] += $amount;
            
            switch ($donation->payment_method) {
                case 'credits':
                    $totals['credits'] += $amount;
                    break;
                case 'bank_transfer':
                    $totals['bank_transfer'] += $amount;
                    break;
                case 'momo':
                    $totals['momo'] += $amount;
                    break;
                case 'vnpay':
                    $totals['vnpay'] += $amount;
                    break;
            }
        }

        return $totals;
    }

    /**
     * Calculate expense breakdown - Focused on actual charity fund expenditures
     */
    private function calculateExpenseBreakdown($donations, Carbon $startDate, Carbon $endDate, ?int $campaignId): array
    {
        $expenses = [
            'disbursements' => 0,           // Tiền đã giải ngân cho các dự án
            'refunds' => 0,                 // Tiền hoàn trả
            'administrative_costs' => 0,     // Chi phí quản lý (nếu có)
            'total' => 0
        ];

        // Get actual expenses from financial transactions
        $expenseTransactions = FinancialTransaction::expense()
            ->completed()
            ->dateRange($startDate, $endDate)
            ->when($campaignId, function($query) use ($campaignId) {
                return $query->where('campaign_id', $campaignId);
            })
            ->get();

        foreach ($expenseTransactions as $expense) {
            switch ($expense->category) {
                case 'campaign_disbursement':
                    $expenses['disbursements'] += $expense->amount;
                    break;
                case 'refund':
                    $expenses['refunds'] += $expense->amount;
                    break;
                case 'administrative_cost':
                    $expenses['administrative_costs'] += $expense->amount;
                    break;
            }
        }

        // Calculate disbursements from completed campaigns
        if ($campaignId) {
            $campaign = Campaign::find($campaignId);
            if ($campaign && $campaign->status === 'completed') {
                // Check actual disbursements recorded for this campaign
                $campaignDisbursements = FinancialTransaction::where('category', 'campaign_disbursement')
                    ->where('campaign_id', $campaignId)
                    ->where('status', 'completed')
                    ->sum('amount');
                $expenses['disbursements'] = $campaignDisbursements;
            }
        } else {
            // Get all disbursements in the period
            $periodDisbursements = FinancialTransaction::where('category', 'campaign_disbursement')
                ->where('status', 'completed')
                ->dateRange($startDate, $endDate)
                ->sum('amount');
            $expenses['disbursements'] = $periodDisbursements;
        }

        $expenses['total'] = array_sum($expenses);
        return $expenses;
    }

    /**
     * Calculate statistics
     */
    private function calculateStatistics($donations, Carbon $startDate, Carbon $endDate, ?int $campaignId): array
    {
        $amounts = $donations->pluck('amount')->sort()->values();
        $uniqueDonors = $donations->pluck('user_id')->unique()->count();
        
        return [
            'total_donors' => $uniqueDonors,
            'total_transactions' => $donations->count(),
            'average_donation' => $amounts->avg() ?? 0,
            'median_donation' => $amounts->count() > 0 ? $amounts->median() : 0
        ];
    }

    /**
     * Calculate available funds (not reserve fund for profit)
     */
    private function calculateAvailableFunds(float $totalIncome, float $totalExpenses): float
    {
        return max(0, $totalIncome - $totalExpenses);
    }

    /**
     * Calculate pending disbursements - Money allocated but not yet distributed
     */
    private function calculatePendingDisbursements(?int $campaignId): float
    {
        $query = Campaign::where('status', 'completed')
            ->where('current_amount', '>', 0);
            
        if ($campaignId) {
            $query->where('id', $campaignId);
            $campaign = $query->first();
            if ($campaign) {
                // Calculate actual pending disbursement for this campaign
                $totalRaised = $campaign->current_amount;
                $alreadyDisbursed = FinancialTransaction::where('campaign_id', $campaignId)
                    ->where('category', 'campaign_disbursement')
                    ->where('status', 'completed')
                    ->sum('amount');
                return max(0, $totalRaised - $alreadyDisbursed);
            }
        }
        
        // For all campaigns, sum up pending disbursements
        $allCompletedCampaigns = $query->get();
        $totalPending = 0;
        
        foreach ($allCompletedCampaigns as $campaign) {
            $totalRaised = $campaign->current_amount;
            $alreadyDisbursed = FinancialTransaction::where('campaign_id', $campaign->id)
                ->where('category', 'campaign_disbursement')
                ->where('status', 'completed')
                ->sum('amount');
            $totalPending += max(0, $totalRaised - $alreadyDisbursed);
        }
        
        return $totalPending;
    }

    /**
     * Calculate current balance - Money in active campaigns and available funds
     */
    private function calculateCurrentBalance(?int $campaignId): float
    {
        if ($campaignId) {
            $campaign = Campaign::find($campaignId);
            return $campaign ? $campaign->current_amount : 0;
        }
        
        // Sum of all active campaign balances plus available funds
        $activeCampaignsBalance = Campaign::where('status', 'active')
            ->sum('current_amount');
            
        return $activeCampaignsBalance ?? 0;
    }

    /**
     * Calculate fund utilization for transparency
     */
    private function calculateFundUtilization(float $totalIncome, float $totalExpenses): array
    {
        if ($totalIncome == 0) {
            return [
                'utilization_rate' => 0,
                'remaining_funds' => 0,
                'utilization_percentage' => 0
            ];
        }
        
        $utilizationRate = $totalExpenses / $totalIncome;
        $remainingFunds = $totalIncome - $totalExpenses;
        
        return [
            'utilization_rate' => round($utilizationRate, 4),
            'remaining_funds' => $remainingFunds,
            'utilization_percentage' => round($utilizationRate * 100, 2)
        ];
    }

    /**
     * Calculate monthly trends
     */
    private function calculateMonthlyTrends(Carbon $startDate, Carbon $endDate, ?int $campaignId): array
    {
        $trends = [];
        $current = $startDate->copy();
        
        while ($current <= $endDate) {
            $monthStart = $current->copy()->startOfMonth();
            $monthEnd = $current->copy()->endOfMonth();
            
            $query = Donation::where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd]);
                
            if ($campaignId) {
                $query->where('campaign_id', $campaignId);
            }
            
            $monthData = $query->get();
            
            $trends[] = [
                'month' => $current->format('Y-m'),
                'total_amount' => $monthData->sum('amount'),
                'total_donations' => $monthData->count(),
                'unique_donors' => $monthData->pluck('user_id')->unique()->count()
            ];
            
            $current->addMonth();
        }
        
        return $trends;
    }

    /**
     * Calculate donor demographics
     */
    private function calculateDonorDemographics($donations): array
    {
        $amounts = $donations->pluck('amount');
        
        return [
            'small_donors' => $amounts->filter(fn($amount) => $amount < 100000)->count(),
            'medium_donors' => $amounts->filter(fn($amount) => $amount >= 100000 && $amount < 1000000)->count(),
            'large_donors' => $amounts->filter(fn($amount) => $amount >= 1000000)->count(),
            'anonymous_donations' => $donations->where('is_anonymous', true)->count(),
            'repeat_donors' => $donations->groupBy('user_id')->filter(fn($group) => $group->count() > 1)->count()
        ];
    }

    /**
     * Calculate payment method distribution
     */
    private function calculatePaymentMethodDistribution($donations): array
    {
        return $donations->groupBy('payment_method')
            ->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total_amount' => $group->sum('amount'),
                    'percentage' => 0 // Will be calculated later
                ];
            })
            ->toArray();
    }

    /**
     * Ensure financial transactions exist for all donations
     */
    private function ensureFinancialTransactionsExist($donations): void
    {
        foreach ($donations as $donation) {
            // Check if financial transaction already exists
            $exists = FinancialTransaction::where('reference_type', 'donation')
                ->where('reference_id', $donation->id)
                ->exists();
                
            if (!$exists) {
                $this->createFinancialTransactionFromDonation($donation);
            }
        }
    }

    /**
     * Create financial transaction from donation - Sync actual money flow
     */
    private function createFinancialTransactionFromDonation(Donation $donation): void
    {
        FinancialTransaction::create([
            'type' => 'income',
            'category' => 'donation',
            'sub_category' => $donation->payment_method,
            'amount' => $donation->amount,
            'currency' => 'VND',
            'reference_id' => $donation->id,
            'reference_type' => 'donation',
            'campaign_id' => $donation->campaign_id,
            'user_id' => $donation->user_id,
            'transaction_id' => 'FT_' . $donation->id . '_' . time(),
            'external_transaction_id' => $donation->transaction_id,
            'payment_method' => $donation->payment_method,
            'status' => $donation->status === 'completed' ? 'completed' : 'pending',
            'description' => "Quyên góp cho chiến dịch: {$donation->campaign->title}",
            'fee_amount' => 0, // No fees deducted from charity donations
            'net_amount' => $donation->amount, // Full amount goes to charity
            'processed_at' => $donation->updated_at,
            'is_verified' => true,
            'verified_at' => now()
        ]);
    }

    /**
     * No processing fee calculation for charity donations
     */
    private function calculateProcessingFee(Donation $donation): float
    {
        return 0; // All donations go 100% to charity causes
    }

    /**
     * Calculate donation summary for transparency reporting
     */
    public function calculateDonationSummary(): array
    {
        $currentYear = Carbon::now()->year;
        $startOfYear = Carbon::create($currentYear, 1, 1);
        $endOfYear = Carbon::create($currentYear, 12, 31);

        // Get donation data
        $yearDonations = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->dateRange($startOfYear, $endOfYear);

        $allTimeDonations = FinancialTransaction::income()
            ->completed()
            ->category('donation');

        return [
            'year_to_date' => [
                'total_amount' => $yearDonations->sum('amount'),
                'total_count' => $yearDonations->count(),
                'unique_donors' => $yearDonations->distinct('user_id')->count('user_id'),
                'average_donation' => $yearDonations->avg('amount') ?: 0
            ],
            'all_time' => [
                'total_amount' => $allTimeDonations->sum('amount'),
                'total_count' => $allTimeDonations->count(),
                'unique_donors' => $allTimeDonations->distinct('user_id')->count('user_id'),
                'average_donation' => $allTimeDonations->avg('amount') ?: 0
            ],
            'transparency_note' => '100% số tiền quyên góp được sử dụng trực tiếp cho hoạt động từ thiện. Chi phí vận hành được tài trợ riêng biệt.'
        ];
    }
}
