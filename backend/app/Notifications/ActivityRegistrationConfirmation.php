<?php

namespace App\Notifications;

use App\Models\ActivityRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivityRegistrationConfirmation extends Notification
{
    use Queueable;

    protected $registration;

    public function __construct(ActivityRegistration $registration)
    {
        $this->registration = $registration;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $activity = $this->registration->activity;
        
        return (new MailMessage)
            ->subject('Xác nhận đăng ký hoạt động: ' . $activity->title)
            ->greeting('Xin chào ' . $this->registration->full_name . '!')
            ->line('Cảm ơn bạn đã đăng ký tham gia hoạt động của chúng tôi.')
            ->line('**Thông tin hoạt động:**')
            ->line('📋 **Tên hoạt động:** ' . $activity->title)
            ->line('📍 **Địa điểm:** ' . $activity->location)
            ->line('📅 **Ngày diễn ra:** ' . $activity->event_date->format('d/m/Y H:i'))
            ->line('💰 **Phí tham gia:** ' . number_format($activity->registration_fee) . ' VND')
            ->line('')
            ->line('**Thông tin đăng ký của bạn:**')
            ->line('👤 **Họ tên:** ' . $this->registration->full_name)
            ->line('📧 **Email:** ' . $this->registration->email)
            ->line('📞 **Số điện thoại:** ' . $this->registration->phone)
            ->when($this->registration->notes, function($mail) {
                return $mail->line('📝 **Ghi chú:** ' . $this->registration->notes);
            })
            ->line('🆔 **Mã đăng ký:** #' . $this->registration->id)
            ->line('📊 **Trạng thái:** ' . $this->getStatusText())
            ->line('')
            ->when($this->registration->isPending(), function($mail) {
                return $mail->line('⏳ Đăng ký của bạn đang chờ xác nhận từ ban tổ chức.');
            })
            ->when($this->registration->isConfirmed(), function($mail) {
                return $mail->line('✅ Đăng ký của bạn đã được xác nhận!')
                    ->line('Vui lòng có mặt đúng giờ theo lịch trình đã thông báo.');
            })
            ->line('Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.')
            ->when($activity->contact_email, function($mail) use ($activity) {
                return $mail->line('📧 Email: ' . $activity->contact_email);
            })
            ->when($activity->contact_phone, function($mail) use ($activity) {
                return $mail->line('📞 Điện thoại: ' . $activity->contact_phone);
            })
            ->action('Xem chi tiết hoạt động', url('/activities/' . $activity->slug))
            ->line('Cảm ơn bạn đã tham gia cùng chúng tôi!');
    }

    private function getStatusText(): string
    {
        return match($this->registration->status) {
            'pending' => 'Chờ xác nhận',
            'confirmed' => 'Đã xác nhận',
            'cancelled' => 'Đã hủy',
            'completed' => 'Hoàn thành',
            default => 'Không xác định'
        };
    }
}
