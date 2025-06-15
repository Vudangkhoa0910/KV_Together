<?php

namespace App\Notifications;

use App\Models\Donation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DonationReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected $donation;

    public function __construct(Donation $donation)
    {
        $this->donation = $donation;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $url = url("/donations/{$this->donation->id}");
        $amount = number_format($this->donation->amount) . 'đ';
        $method = $this->donation->getPaymentMethodText();

        return (new MailMessage)
            ->subject('Xác nhận quyên góp thành công')
            ->greeting("Xin chào {$notifiable->name}")  
            ->line("Cảm ơn bạn đã quyên góp {$amount} cho chiến dịch \"{$this->donation->campaign->title}\".")
            ->line("Phương thức thanh toán: {$method}")
            ->line('Chúng tôi xác nhận đã nhận được số tiền của bạn.')
            ->action('Xem chi tiết', $url)
            ->line('Cảm ơn bạn đã chung tay vì cộng đồng!');
    }

    public function toArray($notifiable)
    {
        return [
            'donation_id' => $this->donation->id,
            'campaign_id' => $this->donation->campaign_id,
            'amount' => $this->donation->amount,
            'payment_method' => $this->donation->payment_method,
            'message' => "Cảm ơn bạn đã quyên góp " . number_format($this->donation->amount) . "đ cho chiến dịch \"{$this->donation->campaign->title}\""
        ];
    }
}
