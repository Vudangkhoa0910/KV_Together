<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FundraiserRejected extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reason;

    public function __construct($reason)
    {
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Đăng ký Fundraiser không được phê duyệt')
            ->greeting('Xin chào ' . $notifiable->name)
            ->line('Chúng tôi rất tiếc phải thông báo rằng đăng ký Fundraiser của bạn không được phê duyệt.')
            ->line('Lý do: ' . $this->reason)
            ->line('Bạn có thể cập nhật thông tin và gửi lại đăng ký.')
            ->action('Cập nhật thông tin', url('/profile/fundraiser'))
            ->line('Cảm ơn bạn đã quan tâm đến việc trở thành Fundraiser.');
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Đăng ký Fundraiser không được phê duyệt',
            'message' => 'Đăng ký Fundraiser của bạn không được phê duyệt. Lý do: ' . $this->reason,
            'type' => 'fundraiser_rejected',
            'reason' => $this->reason,
        ];
    }
} 