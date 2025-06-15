<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'campaign_id',
        'amount',
        'message',
        'status',
        'payment_method',
        'transaction_id',
        'is_anonymous',
        'bank_name',
        'account_number'
    ];

    protected $casts = [
        'amount' => 'integer',
        'is_anonymous' => 'boolean'
    ];

    protected $attributes = [
        'status' => 'pending'
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    const METHOD_BANK_TRANSFER = 'bank_transfer';
    const METHOD_MOMO = 'momo';
    const METHOD_VNPAY = 'vnpay';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isBankTransfer(): bool
    {
        return $this->payment_method === self::METHOD_BANK_TRANSFER;
    }

    public function getPaymentMethodText(): string
    {
        return match($this->payment_method) {
            self::METHOD_BANK_TRANSFER => 'Chuyển khoản ngân hàng',
            self::METHOD_MOMO => 'Ví MoMo',
            self::METHOD_VNPAY => 'VNPay',
            default => 'Không xác định'
        };
    }
}