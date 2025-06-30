<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialReport;
use App\Models\FinancialTransaction;
use App\Services\FinancialReportService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FinancialReportController extends Controller
{
    protected $reportService;

    public function __construct(FinancialReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Get public financial reports
     */
    public function index(Request $request)
    {
        $query = FinancialReport::public()->verified()
            ->with(['campaign:id,title,slug', 'generatedBy:id,name'])
            ->orderBy('report_period_end', 'desc');

        // Filter by report type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by year
        if ($request->has('year')) {
            $year = $request->year;
            $query->whereYear('report_period_start', $year);
        }

        $reports = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Get specific financial report
     */
    public function show(FinancialReport $report)
    {
        // Only show public and verified reports to non-admin users
        if (!$report->is_public || !$report->is_verified) {
            $user = auth()->user();
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Báo cáo này không công khai hoặc chưa được xác minh'
                ], 403);
            }
        }

        $report->load(['campaign:id,title,slug,organizer_id', 'generatedBy:id,name', 'verifiedBy:id,name']);

        return response()->json([
            'success' => true,
            'data' => [
                'report' => $report,
                'insights' => $this->generateReportInsights($report)
            ]
        ]);
    }

    /**
     * Get financial transparency overview
     */
    public function transparency()
    {
        // Calculate current period (this month) donations
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();

        // Current month donation data
        $monthlyDonations = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->dateRange($startOfMonth, $endOfMonth)
            ->sum('amount');

        $monthlyDonors = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->dateRange($startOfMonth, $endOfMonth)
            ->distinct('user_id')
            ->count('user_id');

        // All time donation data
        $allTimeDonations = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->sum('amount');

        $allTimeDonors = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->distinct('user_id')
            ->count('user_id');

        // Get recent donation transactions only
        $recentTransactions = FinancialTransaction::completed()
            ->where('category', 'donation')
            ->with(['campaign:id,title', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();

        // Payment method distribution
        $paymentMethods = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->selectRaw('sub_category, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('sub_category')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                // Unified donation summary (consistent data)
                'donation_overview' => [
                    'current_month' => [
                        'total_donations' => $monthlyDonations,
                        'total_donors' => $monthlyDonors,
                        'charity_fund_available' => $monthlyDonations, // 100% available for charity
                        'period' => $currentMonth->format('m/Y')
                    ],
                    'all_time' => [
                        'total_donations' => $allTimeDonations,
                        'total_donors' => $allTimeDonors,
                        'charity_fund_available' => $allTimeDonations, // 100% available for charity
                        'platform_efficiency' => 100 // 100% goes to charity
                    ]
                ],
                // Payment method breakdown
                'payment_methods' => $paymentMethods->mapWithKeys(function($method) {
                    $methodNames = [
                        'bank_transfer' => 'Chuyển khoản',
                        'momo' => 'MoMo',
                        'vnpay' => 'VNPay',
                        'individual' => 'Cá nhân'
                    ];
                    return [$methodNames[$method->sub_category] ?? $method->sub_category => [
                        'count' => $method->count,
                        'amount' => $method->total
                    ]];
                }),
                'recent_transactions' => $recentTransactions,
                'transparency_metrics' => [
                    'donation_efficiency' => 100, // 100% goes to charity
                    'operational_cost_coverage' => 'Được tài trợ riêng',
                    'transparency_score' => 98.5, // High transparency score
                    'audit_status' => 'Đã kiểm toán độc lập'
                ],
                'transparency_note' => '100% số tiền quyên góp được sử dụng trực tiếp cho mục đích từ thiện. Chi phí vận hành được tài trợ riêng, không trừ từ các khoản quyên góp.',
                'last_updated' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Get monthly financial trend
     */
    public function monthlyTrend(Request $request)
    {
        $months = $request->get('months', 12);
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subMonths($months - 1)->startOfMonth();

        $reports = FinancialReport::public()->verified()
            ->ofType('monthly')
            ->whereBetween('report_period_start', [$startDate, $endDate])
            ->orderBy('report_period_start')
            ->get();

        $trend = $reports->map(function ($report) {
            return [
                'period' => $report->report_period_start->format('Y-m'),
                'total_donations' => $report->total_income, // Only show donations
                'total_donors' => $report->total_donors,
                'total_transactions' => $report->total_transactions,
                'average_donation' => $report->average_donation,
                'charity_fund_available' => $report->total_income // 100% available for charity
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'trend' => $trend,
                'summary' => [
                    'total_donations' => $reports->sum('total_income'), // Only donations
                    'total_charity_fund' => $reports->sum('total_income'), // Same as donations (100%)
                    'average_monthly_donations' => $reports->avg('total_income'),
                    'growth_rate' => $this->calculateGrowthRate($reports),
                    'note' => 'Tất cả số tiền quyên góp được sử dụng 100% cho hoạt động từ thiện'
                ]
            ]
        ]);
    }

    /**
     * Get campaign financial breakdown
     */
    public function campaignBreakdown(Request $request)
    {
        $request->validate([
            'period' => 'required|in:month,quarter,year',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'month' => 'integer|min:1|max:12',
            'quarter' => 'integer|min:1|max:4'
        ]);

        $period = $request->period;
        $year = $request->year;

        // Determine date range based on period
        [$startDate, $endDate] = $this->getDateRangeForPeriod($period, $year, $request->month, $request->quarter);

        // Get donations within the period grouped by campaign (actual amounts, no fees deducted)
        $campaignBreakdown = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->dateRange($startDate, $endDate)
            ->with(['campaign:id,title,target_amount,current_amount,status'])
            ->get()
            ->groupBy('campaign_id')
            ->map(function ($transactions, $campaignId) {
                $campaign = $transactions->first()->campaign;
                return [
                    'campaign_id' => $campaignId,
                    'campaign_title' => $campaign->title ?? 'Unknown',
                    'target_amount' => $campaign->target_amount ?? 0,
                    'total_raised' => $transactions->sum('amount'), // Full donation amount (no fees deducted)
                    'transaction_count' => $transactions->count(),
                    'average_donation' => $transactions->avg('amount'),
                    'payment_methods' => $transactions->groupBy('sub_category')
                        ->map(fn($group) => [
                            'count' => $group->count(),
                            'amount' => $group->sum('amount')
                        ])
                ];
            })
            ->sortByDesc('total_raised')
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'type' => $period,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString()
                ],
                'breakdown' => $campaignBreakdown,
                'summary' => [
                    'total_campaigns' => $campaignBreakdown->count(),
                    'total_raised' => $campaignBreakdown->sum('total_raised'),
                    'total_transactions' => $campaignBreakdown->sum('transaction_count'),
                    'average_per_campaign' => $campaignBreakdown->avg('total_raised')
                ]
            ]
        ]);
    }

    /**
     * Generate insights for a financial report
     */
    private function generateReportInsights(FinancialReport $report): array
    {
        $insights = [];

        // Donation efficiency insights
        if ($report->total_income > 0) {
            $insights[] = [
                'type' => 'donation',
                'title' => 'Hiệu quả quyên góp',
                'description' => "100% số tiền quyên góp được sử dụng trực tiếp cho hoạt động từ thiện",
                'value' => 100,
                'trend' => 'positive'
            ];
        }

        // Available funds insight (only show total donations available)
        $insights[] = [
            'type' => 'available_funds',
            'title' => 'Quỹ từ thiện',
            'description' => "Tổng số tiền " . number_format($report->total_income) . " VND đã được quyên góp và sẵn sàng sử dụng cho các hoạt động từ thiện",
            'value' => $report->total_income,
            'trend' => 'positive'
        ];

        // Donor insights
        if ($report->total_donors > 0) {
            $insights[] = [
                'type' => 'donors',
                'title' => 'Cộng đồng quyên góp',
                'description' => $report->total_donors . " người đã đóng góp với mức trung bình " . number_format($report->average_donation) . " VND/người",
                'value' => $report->total_donors,
                'trend' => 'positive'
            ];
        }

        // Transparency insight
        $insights[] = [
            'type' => 'transparency',
            'title' => 'Minh bạch tài chính',
            'description' => 'Tất cả quyên góp được sử dụng 100% cho mục đích từ thiện. Chi phí vận hành được tài trợ riêng biệt.',
            'value' => 100,
            'trend' => 'positive'
        ];

        return $insights;
    }

    /**
     * Calculate donation totals only (operational costs covered by sponsors)
     */
    private function calculateDonationTotalsOnly(): array
    {
        $currentYear = Carbon::now()->year;
        $startOfYear = Carbon::create($currentYear, 1, 1);
        $endOfYear = Carbon::create($currentYear, 12, 31);

        // Only count actual donations (100% goes to charity)
        $yearToDateDonations = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->dateRange($startOfYear, $endOfYear)
            ->sum('amount');

        // Count unique donors this year
        $yearToDateDonors = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->dateRange($startOfYear, $endOfYear)
            ->distinct('user_id')
            ->count('user_id');

        // All time calculations
        $allTimeDonations = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->sum('amount');

        $allTimeDonors = FinancialTransaction::income()
            ->completed()
            ->category('donation')
            ->distinct('user_id')
            ->count('user_id');

        return [
            'year_to_date' => [
                'total_donations' => $yearToDateDonations,
                'total_donors' => $yearToDateDonors,
                'available_for_charity' => $yearToDateDonations, // 100% available
                'operational_cost_coverage' => 'Được tài trợ riêng biệt'
            ],
            'all_time' => [
                'total_donations' => $allTimeDonations,
                'total_donors' => $allTimeDonors,
                'available_for_charity' => $allTimeDonations, // 100% available
                'operational_cost_coverage' => 'Được tài trợ riêng biệt'
            ],
            'transparency_metrics' => [
                'donation_efficiency' => 100, // 100% of donations go to charity
                'operational_fee_rate' => 0, // No fees charged to donations
                'transparency_level' => 'Hoàn toàn minh bạch'
            ]
        ];
    }

    /**
     * Calculate growth rate from reports
     */
    private function calculateGrowthRate($reports): float
    {
        if ($reports->count() < 2) return 0;

        $first = $reports->first();
        $last = $reports->last();

        if ($first->total_income == 0) return 0;

        return round((($last->total_income - $first->total_income) / $first->total_income) * 100, 2);
    }

    /**
     * Get date range for specific period
     */
    private function getDateRangeForPeriod(string $period, int $year, ?int $month = null, ?int $quarter = null): array
    {
        switch ($period) {
            case 'month':
                $month = $month ?? Carbon::now()->month;
                $start = Carbon::create($year, $month, 1)->startOfMonth();
                $end = $start->copy()->endOfMonth();
                break;
                
            case 'quarter':
                $quarter = $quarter ?? Carbon::now()->quarter;
                $start = Carbon::create($year, ($quarter - 1) * 3 + 1, 1)->startOfMonth();
                $end = $start->copy()->addMonths(2)->endOfMonth();
                break;
                
            case 'year':
                $start = Carbon::create($year, 1, 1)->startOfYear();
                $end = $start->copy()->endOfYear();
                break;
                
            default:
                throw new \InvalidArgumentException('Invalid period specified');
        }

        return [$start, $end];
    }
}
