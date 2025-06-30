<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\FinancialTransaction;
use App\Models\FinancialReport;
use App\Services\FinancialReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class FinancialTransparencyTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $campaign;
    protected $reportService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->campaign = Campaign::factory()->create([
            'target_amount' => 1000000,
            'current_amount' => 0,
            'status' => 'active'
        ]);
        $this->reportService = app(FinancialReportService::class);
    }

    /** @test */
    public function donations_are_recorded_with_full_amount_no_fees_deducted()
    {
        // Create a donation
        $donationAmount = 100000;
        $donation = Donation::factory()->create([
            'campaign_id' => $this->campaign->id,
            'user_id' => $this->user->id,
            'amount' => $donationAmount,
            'status' => 'completed'
        ]);

        // Check that a financial transaction was created with full amount
        $transaction = FinancialTransaction::where('related_id', $donation->id)
            ->where('related_type', Donation::class)
            ->first();

        $this->assertNotNull($transaction);
        $this->assertEquals($donationAmount, $transaction->amount);
        $this->assertEquals('donation', $transaction->category);
        $this->assertEquals('income', $transaction->type);
        $this->assertEquals('completed', $transaction->status);
    }

    /** @test */
    public function financial_reports_show_actual_amounts_only()
    {
        // Create multiple donations
        $donations = [
            ['amount' => 100000, 'campaign_id' => $this->campaign->id, 'user_id' => $this->user->id],
            ['amount' => 150000, 'campaign_id' => $this->campaign->id, 'user_id' => $this->user->id],
            ['amount' => 200000, 'campaign_id' => $this->campaign->id, 'user_id' => $this->user->id],
        ];

        $totalDonations = 0;
        foreach ($donations as $donationData) {
            $donation = Donation::factory()->create(array_merge($donationData, ['status' => 'completed']));
            $totalDonations += $donation->amount;
        }

        // Create some disbursements
        $disbursementAmount = 300000;
        FinancialTransaction::create([
            'campaign_id' => $this->campaign->id,
            'type' => 'expense',
            'category' => 'disbursement',
            'sub_category' => 'project_expense',
            'amount' => $disbursementAmount,
            'description' => 'Project implementation cost',
            'status' => 'completed'
        ]);

        // Generate a financial report
        $report = $this->reportService->generateMonthlyReport(
            Carbon::now()->startOfMonth(),
            Carbon::now()->endOfMonth()
        );

        // Verify report shows correct amounts (no platform fees)
        $this->assertEquals($totalDonations, $report->total_income);
        $this->assertEquals($disbursementAmount, $report->total_expenses);
        $this->assertEquals($totalDonations - $disbursementAmount, $report->net_balance);

        // Verify fund utilization is calculated correctly
        $expectedUtilization = round(($disbursementAmount / $totalDonations) * 100, 1);
        $fundUtilization = $this->reportService->calculateCurrentFundUtilization();
        
        $this->assertArrayHasKey('utilization_rate', $fundUtilization);
        $this->assertEquals($expectedUtilization, $fundUtilization['utilization_rate']);
    }

    /** @test */
    public function transparency_endpoint_returns_actual_financial_data()
    {
        $this->actingAs($this->user);

        // Create test data
        $donationAmount = 200000;
        Donation::factory()->create([
            'campaign_id' => $this->campaign->id,
            'user_id' => $this->user->id,
            'amount' => $donationAmount,
            'status' => 'completed'
        ]);

        $disbursementAmount = 80000;
        FinancialTransaction::create([
            'campaign_id' => $this->campaign->id,
            'type' => 'expense',
            'category' => 'disbursement',
            'sub_category' => 'project_expense',
            'amount' => $disbursementAmount,
            'description' => 'Project materials',
            'status' => 'completed'
        ]);

        // Test transparency endpoint
        $response = $this->getJson('/api/financial-reports/transparency');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'latest_reports',
                    'recent_transactions',
                    'platform_totals' => [
                        'year_to_date' => [
                            'total_donations',
                            'total_disbursements',
                            'available_funds',
                            'utilization_rate'
                        ],
                        'transparency_metrics' => [
                            'platform_fee_rate',
                            'processing_fee_rate',
                            'donation_efficiency'
                        ]
                    ],
                    'fund_utilization',
                    'transparency_note'
                ]
            ]);

        $data = $response->json('data');

        // Verify transparency metrics
        $this->assertEquals(0, $data['platform_totals']['transparency_metrics']['platform_fee_rate']);
        $this->assertEquals(0, $data['platform_totals']['transparency_metrics']['processing_fee_rate']);
        $this->assertEquals(100, $data['platform_totals']['transparency_metrics']['donation_efficiency']);

        // Verify actual amounts
        $this->assertEquals($donationAmount, $data['platform_totals']['year_to_date']['total_donations']);
        $this->assertEquals($disbursementAmount, $data['platform_totals']['year_to_date']['total_disbursements']);
        $this->assertEquals($donationAmount - $disbursementAmount, $data['platform_totals']['year_to_date']['available_funds']);
    }

    /** @test */
    public function financial_transactions_only_include_actual_categories()
    {
        // Create transactions of different categories
        $validCategories = ['donation', 'disbursement', 'refund'];
        $amounts = [100000, 80000, 20000];

        foreach ($validCategories as $index => $category) {
            FinancialTransaction::create([
                'campaign_id' => $this->campaign->id,
                'type' => $category === 'donation' ? 'income' : 'expense',
                'category' => $category,
                'sub_category' => $category === 'donation' ? 'individual' : 'project_expense',
                'amount' => $amounts[$index],
                'description' => "Test {$category}",
                'status' => 'completed'
            ]);
        }

        // Test that only valid categories are returned in transparency endpoint
        $response = $this->getJson('/api/financial-reports/transparency');
        
        $transactions = $response->json('data.recent_transactions');
        
        foreach ($transactions as $transaction) {
            $this->assertContains($transaction['category'], $validCategories);
            $this->assertNotEquals('platform_fee', $transaction['category']);
            $this->assertNotEquals('processing_fee', $transaction['category']);
        }
    }

    /** @test */
    public function report_insights_focus_on_transparency()
    {
        // Create a financial report
        $report = FinancialReport::factory()->create([
            'campaign_id' => $this->campaign->id,
            'total_income' => 500000,
            'total_expenses' => 300000,
            'net_balance' => 200000,
            'total_donors' => 10,
            'average_donation' => 50000,
            'is_public' => true,
            'is_verified' => true
        ]);

        $this->actingAs($this->user);

        $response = $this->getJson("/api/financial-reports/{$report->id}");

        $response->assertStatus(200);
        
        $insights = $response->json('data.insights');
        
        // Check for transparency-focused insights
        $insightTypes = array_column($insights, 'type');
        $this->assertContains('donation', $insightTypes);
        $this->assertContains('transparency', $insightTypes);
        
        // Find transparency insight
        $transparencyInsight = collect($insights)->firstWhere('type', 'transparency');
        $this->assertNotNull($transparencyInsight);
        $this->assertEquals(100, $transparencyInsight['value']); // 100% transparency
        $this->assertEquals('positive', $transparencyInsight['trend']);
    }

    /** @test */
    public function campaign_breakdown_shows_full_donation_amounts()
    {
        // Create donations for this campaign
        $donations = [
            ['amount' => 100000],
            ['amount' => 150000],
            ['amount' => 80000]
        ];

        $totalExpected = 0;
        foreach ($donations as $donationData) {
            $donation = Donation::factory()->create(array_merge($donationData, [
                'campaign_id' => $this->campaign->id,
                'user_id' => $this->user->id,
                'status' => 'completed'
            ]));
            $totalExpected += $donation->amount;
        }

        $this->actingAs($this->user);

        $response = $this->getJson('/api/financial-reports/campaign-breakdown?' . http_build_query([
            'period' => 'month',
            'year' => Carbon::now()->year,
            'month' => Carbon::now()->month
        ]));

        $response->assertStatus(200);
        
        $breakdown = $response->json('data.breakdown');
        $campaignData = collect($breakdown)->firstWhere('campaign_id', $this->campaign->id);
        
        $this->assertNotNull($campaignData);
        $this->assertEquals($totalExpected, $campaignData['total_raised']);
        $this->assertEquals(count($donations), $campaignData['transaction_count']);
    }
}
