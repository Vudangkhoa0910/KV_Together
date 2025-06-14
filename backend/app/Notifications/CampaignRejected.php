<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignRejected extends Notification implements ShouldQueue
{
    use Queueable;

    protected $campaign;
    protected $reason;

    public function __construct(Campaign $campaign, $reason)
    {
        $this->campaign = $campaign;
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Chiến dịch không được phê duyệt')
            ->greeting('Xin chào ' . $notifiable->name)
            ->line('Chúng tôi rất tiếc phải thông báo rằng chiến dịch "' . $this->campaign->title . '" của bạn không được phê duyệt.')
            ->line('Lý do: ' . $this->reason)
            ->line('Bạn có thể chỉnh sửa chiến dịch và gửi lại để phê duyệt.')
            ->action('Chỉnh sửa chiến dịch', url('/campaigns/' . $this->campaign->id . '/edit'))
            ->line('Cảm ơn bạn đã thông cảm.');
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Chiến dịch không được phê duyệt',
            'message' => 'Chiến dịch "' . $this->campaign->title . '" của bạn không được phê duyệt. Lý do: ' . $this->reason,
            'type' => 'campaign_rejected',
            'campaign_id' => $this->campaign->id,
            'reason' => $this->reason,
        ];
    }
} 