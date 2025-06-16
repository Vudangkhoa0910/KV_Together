<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Chạy kiểm tra tiến độ chiến dịch mỗi giờ
        $schedule->command('campaigns:check-progress')
                 ->hourly()
                 ->withoutOverlapping()
                 ->runInBackground();

        // Chạy hoàn thành chiến dịch mỗi 30 phút
        $schedule->command('campaigns:complete')
                 ->everyThirtyMinutes()
                 ->withoutOverlapping()
                 ->runInBackground();

        // Dọn dẹp thông báo cũ mỗi ngày
        $schedule->command('notifications:cleanup')
                 ->daily()
                 ->at('02:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}