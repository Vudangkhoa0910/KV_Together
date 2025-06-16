<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CleanupNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:cleanup {--days=30 : Number of days to keep notifications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dọn dẹp các thông báo cũ để tối ưu hóa cơ sở dữ liệu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Đang dọn dẹp thông báo cũ hơn {$days} ngày...");

        // Xóa thông báo cũ
        $deletedCount = Notification::where('created_at', '<', $cutoffDate)
            ->where('read_at', '!=', null) // Chỉ xóa thông báo đã đọc
            ->delete();

        if ($deletedCount > 0) {
            $this->info("Đã xóa {$deletedCount} thông báo cũ.");
        } else {
            $this->info('Không có thông báo nào cần dọn dẹp.');
        }

        // Thống kê thông báo còn lại
        $totalNotifications = Notification::count();
        $unreadNotifications = Notification::whereNull('read_at')->count();

        $this->info("Tổng thông báo còn lại: {$totalNotifications}");
        $this->info("Thông báo chưa đọc: {$unreadNotifications}");

        return 0;
    }
}
