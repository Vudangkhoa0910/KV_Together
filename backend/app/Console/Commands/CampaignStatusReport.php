<?php

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\CampaignClosure;
use Illuminate\Console\Command;

class CampaignStatusReport extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'campaigns:status-report {--export= : Export to file}';

    /**
     * The console command description.
     */
    protected $description = 'Generate comprehensive campaign status report';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $export = $this->option('export');
        
        $this->info('🔍 Generating Campaign Status Report...');
        $this->info('Generated at: ' . now()->format('Y-m-d H:i:s'));
        $this->newLine();

        $report = $this->generateReport();
        
        if ($export) {
            $this->exportReport($report, $export);
        }

        return 0;
    }

    private function generateReport(): array
    {
        // Tổng quan
        $overview = [
            'total' => Campaign::count(),
            'active' => Campaign::where('status', 'active')
                ->where('end_date', '>', now())
                ->whereColumn('current_amount', '<', 'target_amount')
                ->count(),
            'completed' => Campaign::whereColumn('current_amount', '>=', 'target_amount')->count(),
            'ended_failed' => CampaignClosure::where('closure_type', 'failed')->count(),
            'ended_partial' => CampaignClosure::where('closure_type', 'partial')->count(),
            'expired_unprocessed' => Campaign::where('status', 'active')
                ->where('end_date', '<=', now())
                ->whereDoesntHave('closure')
                ->count(),
            'pending' => Campaign::where('status', 'pending')->count(),
            'rejected' => Campaign::where('status', 'rejected')->count(),
        ];

        // Thống kê tài chính
        $totalRaised = Campaign::sum('current_amount');
        $totalTarget = Campaign::sum('target_amount');
        $completedAmount = Campaign::whereColumn('current_amount', '>=', 'target_amount')
            ->sum('current_amount');
        $failedAmount = Campaign::whereHas('closure', function($q) {
            $q->where('closure_type', 'failed');
        })->sum('current_amount');

        $finance = [
            'total_raised' => $totalRaised,
            'total_target' => $totalTarget,
            'completed_amount' => $completedAmount,
            'failed_amount' => $failedAmount,
            'success_rate' => $totalRaised > 0 ? round(($completedAmount / $totalRaised) * 100, 2) : 0,
            'completion_rate' => $totalTarget > 0 ? round(($totalRaised / $totalTarget) * 100, 2) : 0,
        ];

        // Cảnh báo
        $expiredUnprocessed = Campaign::where('status', 'active')
            ->where('end_date', '<=', now())
            ->whereDoesntHave('closure')
            ->get(['id', 'title', 'end_date', 'current_amount']);

        $lowPerformance = Campaign::where('status', 'active')
            ->where('end_date', '>', now())
            ->whereRaw('(current_amount / target_amount) < 0.1')
            ->where('created_at', '<', now()->subDays(30))
            ->get(['id', 'title', 'current_amount', 'target_amount', 'end_date']);

        $alerts = [
            'expired_unprocessed' => $expiredUnprocessed,
            'low_performance' => $lowPerformance,
        ];

        // Hiển thị báo cáo
        $this->displayReport($overview, $finance, $alerts);

        return [
            'overview' => $overview,
            'finance' => $finance,
            'alerts' => $alerts,
            'generated_at' => now()->toISOString(),
        ];
    }

    private function displayReport(array $overview, array $finance, array $alerts): void
    {
        // Tổng quan
        $this->info('📊 TỔNG QUAN CHIẾN DỊCH');
        $this->table(
            ['Trạng thái', 'Số lượng'],
            [
                ['Tổng số chiến dịch', number_format($overview['total'])],
                ['Đang hoạt động', number_format($overview['active'])],
                ['Đã hoàn thành', number_format($overview['completed'])],
                ['Kết thúc thất bại', number_format($overview['ended_failed'])],
                ['Kết thúc một phần', number_format($overview['ended_partial'])],
                ['Hết hạn chưa xử lý', number_format($overview['expired_unprocessed'])],
                ['Chờ phê duyệt', number_format($overview['pending'])],
                ['Bị từ chối', number_format($overview['rejected'])],
            ]
        );

        $this->newLine();

        // Thống kê tài chính
        $this->info('💰 THỐNG KÊ TÀI CHÍNH');
        $this->table(
            ['Chỉ số', 'Giá trị'],
            [
                ['Tổng tiền quyên góp', number_format($finance['total_raised']) . ' VND'],
                ['Tổng mục tiêu', number_format($finance['total_target']) . ' VND'],
                ['Tiền từ chiến dịch hoàn thành', number_format($finance['completed_amount']) . ' VND'],
                ['Tiền cần hoàn lại', number_format($finance['failed_amount']) . ' VND'],
                ['Tỷ lệ thành công', $finance['success_rate'] . '%'],
                ['Tỷ lệ hoàn thành mục tiêu', $finance['completion_rate'] . '%'],
            ]
        );

        $this->newLine();

        // Cảnh báo
        $this->warn('⚠️  CẦN CHÚ Ý');
        
        if ($alerts['expired_unprocessed']->count() > 0) {
            $this->error("🚨 Chiến dịch hết hạn chưa xử lý: {$alerts['expired_unprocessed']->count()}");
            foreach ($alerts['expired_unprocessed'] as $campaign) {
                $this->line("   • ID {$campaign->id}: {$campaign->title} (" . number_format($campaign->current_amount) . " VND)");
            }
        } else {
            $this->info("✅ Không có chiến dịch hết hạn chưa xử lý");
        }

        if ($alerts['low_performance']->count() > 0) {
            $this->warn("📉 Chiến dịch kém hiệu suất (>30 ngày, <10% target): {$alerts['low_performance']->count()}");
            foreach ($alerts['low_performance'] as $campaign) {
                $progress = round(($campaign->current_amount / $campaign->target_amount) * 100, 2);
                $this->line("   • ID {$campaign->id}: {$campaign->title} ({$progress}%)");
            }
        }

        $this->info("💸 Chiến dịch cần hoàn tiền: {$overview['ended_failed']}");
        
        $this->newLine();
        $this->info('✅ Báo cáo hoàn thành!');
    }

    private function exportReport(array $report, string $filename): void
    {
        $content = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        $path = storage_path('app/reports/' . $filename);
        
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }
        
        file_put_contents($path, $content);
        
        $this->info("📄 Báo cáo đã được xuất ra: {$path}");
    }
}
