<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FundraiserApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Đăng ký Fundraiser đã được phê duyệt')
            ->greeting('Xin chào ' . $notifiable->name)
            ->line('Chúng tôi vui mừng thông báo rằng đăng ký Fundraiser của bạn đã được phê duyệt.')
            ->line('Bây giờ bạn có thể tạo các chiến dịch gây quỹ của mình.')
            ->action('Tạo chiến dịch', url('/campaigns/create'))
            ->line('Cảm ơn bạn đã tham gia cùng chúng tôi!');
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Đăng ký Fundraiser đã được phê duyệt',
            'message' => 'Bạn đã được phê duyệt trở thành Fundraiser. Bây giờ bạn có thể tạo các chiến dịch gây quỹ.',
            'type' => 'fundraiser_approved',
        ];
    }
} 