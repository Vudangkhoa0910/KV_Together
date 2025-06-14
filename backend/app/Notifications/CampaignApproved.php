<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignApproved extends Notification implements ShouldQueue
{
    use Queueable;

    protected $campaign;

    public function __construct(Campaign $campaign)
    {
        $this->campaign = $campaign;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Chiến dịch đã được phê duyệt')
            ->greeting('Xin chào ' . $notifiable->name)
            ->line('Chúng tôi vui mừng thông báo rằng chiến dịch "' . $this->campaign->title . '" của bạn đã được phê duyệt.')
            ->line('Chiến dịch của bạn đã sẵn sàng để nhận quyên góp.')
            ->action('Xem chiến dịch', url('/campaigns/' . $this->campaign->id))
            ->line('Cảm ơn bạn đã tạo chiến dịch ý nghĩa này!');
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Chiến dịch đã được phê duyệt',
            'message' => 'Chiến dịch "' . $this->campaign->title . '" của bạn đã được phê duyệt và sẵn sàng nhận quyên góp.',
            'type' => 'campaign_approved',
            'campaign_id' => $this->campaign->id,
        ];
    }
} 