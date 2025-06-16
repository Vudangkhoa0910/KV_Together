<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignCompleted extends Notification implements ShouldQueue
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
        $amount = number_format($this->campaign->current_amount) . 'đ';
        return (new MailMessage)
            ->subject('Chiến dịch đã hoàn thành')
            ->greeting('Xin chào ' . $notifiable->name)
            ->line('Chiến dịch "' . $this->campaign->title . '" của bạn đã hoàn thành!')
            ->line('Tổng số tiền đã quyên góp được: ' . $amount)
            ->action('Xem chi tiết chiến dịch', url('/campaigns/' . $this->campaign->slug))
            ->line('Cảm ơn bạn đã tạo một chiến dịch ý nghĩa!');
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Chiến dịch đã hoàn thành',
            'message' => 'Chiến dịch "' . $this->campaign->title . '" đã hoàn thành với số tiền ' . number_format($this->campaign->current_amount) . 'đ',
            'type' => 'campaign_completed',
            'campaign_id' => $this->campaign->id,
        ];
    }
}
