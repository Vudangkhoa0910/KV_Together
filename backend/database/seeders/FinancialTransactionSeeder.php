<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\FinancialTransaction;
use App\Models\PlatformFinancialSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FinancialTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Generating financial transactions...');

        // Generate transactions from existing donations
        $this->generateDonationTransactions();

        // Generate operational expense transactions
        $this->generateOperationalExpenses();

        // Generate disbursement transactions for completed campaigns
        $this->generateDisbursementTransactions();

        $this->command->info('✅ Financial transactions generated successfully!');
    }

    /**
     * Generate financial transactions from existing donations
     */
    private function generateDonationTransactions(): void
    {
        $this->command->info('💰 Creating income transactions from donations...');

        $donations = Donation::where('status', 'completed')
            ->with(['campaign', 'user'])
            ->get();

        $transactionCount = 0;

        foreach ($donations as $donation) {
            // Check if transaction already exists
            $exists = FinancialTransaction::where('reference_type', 'donation')
                ->where('reference_id', $donation->id)
                ->exists();

            if ($exists) continue;

            $feeAmount = $this->calculateProcessingFee($donation);

            try {
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
                    'transaction_id' => 'FT_DONATION_' . $donation->id,
                    'external_transaction_id' => $donation->transaction_id,
                    'payment_method' => $donation->payment_method,
                    'status' => 'completed',
                    'description' => "Quyên góp cho chiến dịch: {$donation->campaign->title}",
                    'fee_amount' => $feeAmount,
                    'net_amount' => $donation->amount - $feeAmount,
                    'processed_at' => $donation->updated_at,
                    'is_verified' => true,
                    'verified_at' => $donation->updated_at,
                    'created_at' => $donation->created_at,
                    'updated_at' => $donation->updated_at
                ]);

                $transactionCount++;
            } catch (\Exception $e) {
                $this->command->warn("Failed to create transaction for donation {$donation->id}: " . $e->getMessage());
            }
        }

        $this->command->info("✓ Created {$transactionCount} donation income transactions");
    }

    /**
     * Generate operational expense transactions
     */
    private function generateOperationalExpenses(): void
    {
        $this->command->info('💸 Creating operational expense transactions...');

        $admin = User::whereHas('role', function($q) {
            $q->where('slug', 'admin');
        })->first();

        if (!$admin) {
            $this->command->warn('No admin user found for operational expenses');
            return;
        }

        $startDate = Carbon::now()->subMonths(12);
        $endDate = Carbon::now();

        $operationalExpenses = [
            [
                'category' => 'operational_cost',
                'sub_category' => 'server_hosting',
                'monthly_amount' => 2500000, // 2.5M VND/month
                'description' => 'Chi phí hosting server và CDN'
            ],
            [
                'category' => 'operational_cost',
                'sub_category' => 'software_license',
                'monthly_amount' => 1800000, // 1.8M VND/month
                'description' => 'Phí license phần mềm và công cụ'
            ],
            [
                'category' => 'operational_cost',
                'sub_category' => 'security_audit',
                'monthly_amount' => 3000000, // 3M VND/month
                'description' => 'Kiểm toán bảo mật và tuân thủ'
            ],
            [
                'category' => 'operational_cost',
                'sub_category' => 'customer_support',
                'monthly_amount' => 5000000, // 5M VND/month
                'description' => 'Chi phí hỗ trợ khách hàng'
            ],
            [
                'category' => 'marketing_expense',
                'sub_category' => null,
                'monthly_amount' => 8000000, // 8M VND/month
                'description' => 'Chi phí marketing và quảng bá'
            ],
            [
                'category' => 'technology_infrastructure',
                'sub_category' => null,
                'monthly_amount' => 4000000, // 4M VND/month
                'description' => 'Đầu tư nâng cấp hạ tầng công nghệ'
            ]
        ];

        $expenseCount = 0;
        $currentMonth = $startDate->copy();

        while ($currentMonth <= $endDate) {
            foreach ($operationalExpenses as $expense) {
                // Add some randomness to amounts (±20%)
                $baseAmount = $expense['monthly_amount'];
                $variance = $baseAmount * 0.2;
                $amount = $baseAmount + rand(-$variance, $variance);

                try {
                    FinancialTransaction::create([
                        'type' => 'expense',
                        'category' => $expense['category'],
                        'sub_category' => $expense['sub_category'],
                        'amount' => $amount,
                        'currency' => 'VND',
                        'reference_type' => 'operational',
                        'transaction_id' => 'FT_OP_' . $currentMonth->format('Ym') . '_' . rand(1000, 9999),
                        'status' => 'completed',
                        'description' => $expense['description'] . ' - ' . $currentMonth->format('m/Y'),
                        'fee_amount' => 0,
                        'net_amount' => $amount,
                        'processed_at' => $currentMonth->copy()->addDays(rand(1, 28)),
                        'processed_by' => $admin->id,
                        'is_verified' => true,
                        'verified_at' => $currentMonth->copy()->addDays(rand(1, 28)),
                        'created_at' => $currentMonth->copy()->addDays(rand(1, 28)),
                        'updated_at' => $currentMonth->copy()->addDays(rand(1, 28))
                    ]);

                    $expenseCount++;
                } catch (\Exception $e) {
                    $this->command->warn("Failed to create operational expense: " . $e->getMessage());
                }
            }

            $currentMonth->addMonth();
        }

        $this->command->info("✓ Created {$expenseCount} operational expense transactions");
    }

    /**
     * Generate disbursement transactions for completed campaigns
     */
    private function generateDisbursementTransactions(): void
    {
        $this->command->info('💰 Creating campaign disbursement transactions...');

        $admin = User::whereHas('role', function($q) {
            $q->where('slug', 'admin');
        })->first();

        $completedCampaigns = Campaign::where('status', 'completed')
            ->where('current_amount', '>', 0)
            ->with(['organizer'])
            ->get();

        $disbursementCount = 0;

        foreach ($completedCampaigns as $campaign) {
            // Check if disbursement already exists
            $exists = FinancialTransaction::where('category', 'campaign_disbursement')
                ->where('campaign_id', $campaign->id)
                ->exists();

            if ($exists) continue;

            // Calculate platform fees
            $platformFeeRate = PlatformFinancialSetting::getValue('platform_fee_percentage', 3.5) / 100;
            $reserveFundRate = PlatformFinancialSetting::getValue('reserve_fund_percentage', 5.0) / 100;
            
            $totalRaised = $campaign->current_amount;
            $platformFees = $totalRaised * $platformFeeRate;
            $reserveAmount = $totalRaised * $reserveFundRate;
            $disbursementAmount = $totalRaised - $platformFees - $reserveAmount;

            try {
                // Create disbursement transaction
                FinancialTransaction::create([
                    'type' => 'expense',
                    'category' => 'campaign_disbursement',
                    'sub_category' => 'campaign_completion',
                    'amount' => $disbursementAmount,
                    'currency' => 'VND',
                    'reference_type' => 'campaign',
                    'reference_id' => $campaign->id,
                    'campaign_id' => $campaign->id,
                    'user_id' => $campaign->organizer_id,
                    'transaction_id' => 'FT_DISBURSEMENT_' . $campaign->id,
                    'status' => 'completed',
                    'to_account' => 'Organizer Bank Account',
                    'description' => "Giải ngân cho chiến dịch: {$campaign->title}",
                    'metadata' => [
                        'total_raised' => $totalRaised,
                        'platform_fees' => $platformFees,
                        'reserve_amount' => $reserveAmount,
                        'disbursement_percentage' => round(($disbursementAmount / $totalRaised) * 100, 2)
                    ],
                    'fee_amount' => 0,
                    'net_amount' => $disbursementAmount,
                    'processed_at' => $campaign->updated_at->addDays(rand(1, 7)),
                    'processed_by' => $admin->id ?? null,
                    'is_verified' => true,
                    'verified_at' => $campaign->updated_at->addDays(rand(1, 7)),
                    'created_at' => $campaign->updated_at->addDays(rand(1, 7)),
                    'updated_at' => $campaign->updated_at->addDays(rand(1, 7))
                ]);

                // Create platform fee transaction
                FinancialTransaction::create([
                    'type' => 'expense',
                    'category' => 'platform_fee',
                    'sub_category' => null,
                    'amount' => $platformFees,
                    'currency' => 'VND',
                    'reference_type' => 'campaign',
                    'reference_id' => $campaign->id,
                    'campaign_id' => $campaign->id,
                    'transaction_id' => 'FT_PLATFORM_FEE_' . $campaign->id,
                    'status' => 'completed',
                    'description' => "Phí nền tảng từ chiến dịch: {$campaign->title}",
                    'metadata' => [
                        'fee_rate' => $platformFeeRate * 100,
                        'base_amount' => $totalRaised
                    ],
                    'fee_amount' => 0,
                    'net_amount' => $platformFees,
                    'processed_at' => $campaign->updated_at,
                    'processed_by' => $admin->id ?? null,
                    'is_verified' => true,
                    'verified_at' => $campaign->updated_at,
                    'created_at' => $campaign->updated_at,
                    'updated_at' => $campaign->updated_at
                ]);

                $disbursementCount += 2; // Disbursement + Platform fee
            } catch (\Exception $e) {
                $this->command->warn("Failed to create disbursement for campaign {$campaign->id}: " . $e->getMessage());
            }
        }

        $this->command->info("✓ Created {$disbursementCount} disbursement transactions");
    }

    /**
     * Calculate processing fee for donation
     */
    private function calculateProcessingFee(Donation $donation): float
    {
        $feeRate = match($donation->payment_method) {
            'momo' => PlatformFinancialSetting::getValue('momo_processing_fee', 2.0) / 100,
            'vnpay' => PlatformFinancialSetting::getValue('vnpay_processing_fee', 1.8) / 100,
            'bank_transfer' => PlatformFinancialSetting::getValue('bank_transfer_processing_fee', 0.5) / 100,
            'credits' => 0,
            default => 0
        };
        
        return $donation->amount * $feeRate;
    }
}
