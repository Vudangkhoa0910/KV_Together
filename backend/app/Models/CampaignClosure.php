<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignClosure extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'closure_type',
        'final_amount',
        'disbursement_amount',
        'platform_fee',
        'closure_reason',
        'disbursement_details',
        'disbursed_at',
        'notes'
    ];

    protected $casts = [
        'final_amount' => 'decimal:2',
        'disbursement_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'disbursed_at' => 'datetime',
        'disbursement_details' => 'json'
    ];

    // Closure types
    const CLOSURE_COMPLETED = 'completed';              // Đạt đủ target
    const CLOSURE_PARTIAL_COMPLETED = 'partial';        // Hết thời gian nhưng có flexible funding
    const CLOSURE_FAILED = 'failed';                    // Hết thời gian và không đủ minimum goal
    const CLOSURE_CANCELLED = 'cancelled';              // Bị hủy bỏ bởi organizer/admin

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function getClosureStatusText(): string
    {
        return match($this->closure_type) {
            self::CLOSURE_COMPLETED => 'Hoàn thành thành công',
            self::CLOSURE_PARTIAL_COMPLETED => 'Kết thúc một phần',
            self::CLOSURE_FAILED => 'Không đạt mục tiêu',
            self::CLOSURE_CANCELLED => 'Đã hủy bỏ',
            default => 'Không xác định'
        };
    }

    public function getClosureStatusColor(): string
    {
        return match($this->closure_type) {
            self::CLOSURE_COMPLETED => 'green',
            self::CLOSURE_PARTIAL_COMPLETED => 'orange',
            self::CLOSURE_FAILED => 'red',
            self::CLOSURE_CANCELLED => 'gray',
            default => 'gray'
        };
    }

    public function requiresRefund(): bool
    {
        return $this->closure_type === self::CLOSURE_FAILED ||
               $this->closure_type === self::CLOSURE_CANCELLED;
    }
}