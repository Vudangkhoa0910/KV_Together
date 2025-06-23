<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'source_type',
        'source_id',
        'description',
        'metadata',
        'balance_before',
        'balance_after'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array'
    ];

    const TYPE_EARN = 'earn';
    const TYPE_SPEND = 'spend';
    const TYPE_TRANSFER_IN = 'transfer_in';
    const TYPE_TRANSFER_OUT = 'transfer_out';
    const TYPE_BONUS = 'bonus';
    const TYPE_REFUND = 'refund';

    const SOURCE_TYPES = [
        'failed_campaign' => 'Chiến dịch thất bại',
        'donation' => 'Quyên góp',
        'bonus' => 'Thưởng',
        'transfer' => 'Chuyển khoản',
        'referral' => 'Giới thiệu',
        'loyalty' => 'Thưởng trung thành',
        'campaign_support' => 'Ủng hộ chiến dịch'
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(VirtualWallet::class, 'wallet_id');
    }

    public function user(): BelongsTo
    {
        return $this->wallet->user();
    }

    /**
     * Get the source model dynamically
     */
    public function source()
    {
        if (!$this->source_type || !$this->source_id) {
            return null;
        }

        return match($this->source_type) {
            'failed_campaign', 'campaign_support' => Campaign::find($this->source_id),
            'donation' => Donation::find($this->source_id),
            'transfer' => VirtualWallet::find($this->source_id),
            default => null,
        };
    }

    /**
     * Get display type
     */
    public function getDisplayTypeAttribute(): string
    {
        return match($this->type) {
            self::TYPE_EARN => 'Nhận',
            self::TYPE_SPEND => 'Chi tiêu',
            self::TYPE_TRANSFER_IN => 'Nhận chuyển khoản',
            self::TYPE_TRANSFER_OUT => 'Chuyển khoản',
            self::TYPE_BONUS => 'Thưởng',
            self::TYPE_REFUND => 'Hoàn tiền',
            default => ucfirst($this->type),
        };
    }

    /**
     * Get display source type
     */
    public function getDisplaySourceTypeAttribute(): string
    {
        return self::SOURCE_TYPES[$this->source_type] ?? ucfirst($this->source_type);
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        $prefix = in_array($this->type, [self::TYPE_EARN, self::TYPE_TRANSFER_IN, self::TYPE_BONUS, self::TYPE_REFUND]) ? '+' : '-';
        return $prefix . number_format($this->amount, 0, ',', '.') . ' Credits';
    }

    /**
     * Scope for earning transactions
     */
    public function scopeEarnings($query)
    {
        return $query->whereIn('type', [self::TYPE_EARN, self::TYPE_TRANSFER_IN, self::TYPE_BONUS, self::TYPE_REFUND]);
    }

    /**
     * Scope for spending transactions
     */
    public function scopeSpending($query)
    {
        return $query->whereIn('type', [self::TYPE_SPEND, self::TYPE_TRANSFER_OUT]);
    }

    /**
     * Scope for transfers
     */
    public function scopeTransfers($query)
    {
        return $query->whereIn('type', [self::TYPE_TRANSFER_IN, self::TYPE_TRANSFER_OUT]);
    }

    /**
     * Scope by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}
