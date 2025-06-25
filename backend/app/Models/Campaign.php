<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'organizer_name',
        'organizer_description',
        'organizer_website',
        'organizer_address',
        'organizer_hotline',
        'organizer_contact',
        'target_amount',
        'current_amount',
        'start_date',
        'end_date',
        'image',
        'images',
        'status',
        'organizer_id',
        'rejection_reason',
        'is_featured',
        // Funding policies
        'funding_type',
        'minimum_goal',
        'rollover_policy',
        'auto_disburse',
        'accepts_credits',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'minimum_goal' => 'decimal:2',
        'is_featured' => 'boolean',
        'auto_disburse' => 'boolean',
        'accepts_credits' => 'boolean',
        'images' => 'json'
    ];
    
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . str_replace('\\', '', $this->image));
        }
        return null;
    }
    
    public function getImagesUrlAttribute()
    {
        if ($this->images && is_array($this->images)) {
            return array_map(function($image) {
                return url('storage/' . str_replace('\\', '', $image));
            }, $this->images);
        }
        return [];
    }

    protected $with = ['categories', 'organizer'];
    protected $appends = ['progress_percentage', 'days_remaining', 'image_url', 'images_url'];
    protected $dates = ['start_date', 'end_date'];

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function realDonations(): HasMany
    {
        return $this->hasMany(Donation::class)->where('is_stats', false);
    }

    public function statsDonations(): HasMany
    {
        return $this->hasMany(Donation::class)->where('is_stats', true);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(CampaignUpdate::class);
    }

    public function closure(): HasOne
    {
        return $this->hasOne(CampaignClosure::class);
    }

    public function progressReports(): HasMany
    {
        return $this->hasMany(CampaignProgressReport::class);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->target_amount == 0) return 0;
        return min(100, max(0, round(($this->current_amount / $this->target_amount) * 100, 2))); // 2 decimal places
    }

    public function getDaysRemainingAttribute(): int
    {
        return max(0, now()->diffInDays($this->end_date, false));
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && 
               $this->end_date > now() &&
               $this->current_amount < $this->target_amount; // Dừng nhận tiền khi đủ target
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('end_date', '>', now())
                    ->where('current_amount', '<', 'target_amount'); // Chỉ lấy chiến dịch chưa đủ target
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)
                    ->orWhere('current_amount', '>', 1000000);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
    }

    public function getStatusAttribute()
    {
        // Không tự động thay đổi status dựa trên số tiền
        // Chỉ trả về status thực tế từ database
        return $this->attributes['status'] ?? 'active';
    }

    /**
     * Determine if campaign was stopped before reaching target
     */
    public function wasStoppedBeforeTarget(): bool
    {
        return $this->status === 'completed' && $this->current_amount < $this->target_amount;
    }

    /**
     * Get detailed status for frontend with proper logic
     */
    public function getDetailedStatus(): array
    {
        $now = now();
        $isExpired = $this->end_date <= $now;
        $targetReached = $this->current_amount >= $this->target_amount;
        $hasMinimumGoal = $this->minimum_goal && $this->current_amount >= $this->minimum_goal;

        // 0. Ưu tiên status đã được set trong database
        if ($this->status === 'completed') {
            return [
                'status' => 'completed',
                'label' => 'Hoàn thành',
                'description' => 'Chiến dịch đã đạt đủ mục tiêu quyên góp',
                'color' => 'green',
                'can_donate' => false,
                'requires_action' => false
            ];
        }

        if ($this->status === 'ended_failed') {
            return [
                'status' => 'ended_failed',
                'label' => 'Đã kết thúc (thất bại)',
                'description' => 'Chiến dịch không đạt mục tiêu, tiền sẽ được hoàn lại',
                'color' => 'red',
                'can_donate' => false,
                'requires_action' => true
            ];
        }

        if ($this->status === 'ended_partial') {
            return [
                'status' => 'ended_partial',
                'label' => 'Đã kết thúc (một phần)',
                'description' => 'Chiến dịch đã kết thúc, tiền sẽ được chuyển cho tổ chức',
                'color' => 'orange',
                'can_donate' => false,
                'requires_action' => true
            ];
        }

        // 1. Logic tự động: Hoàn thành CHỈ KHI current_amount >= target_amount (bất kể thời gian)
        if ($targetReached) {
            return [
                'status' => 'completed',
                'label' => 'Hoàn thành',
                'description' => 'Chiến dịch đã đạt đủ mục tiêu quyên góp',
                'color' => 'green',
                'can_donate' => false,
                'requires_action' => false
            ];
        }

        // 2. Đang hoạt động: Chưa đủ target và chưa hết thời gian
        if (!$isExpired && $this->status === 'active') {
            return [
                'status' => 'active',
                'label' => 'Đang hoạt động',
                'description' => 'Chiến dịch đang nhận quyên góp',
                'color' => 'blue',
                'can_donate' => true,
                'requires_action' => false
            ];
        }

        // 3. Đã kết thúc: CHỈ KHI hết thời gian VÀ current_amount < target_amount
        if ($isExpired && !$targetReached) {
            // 3a. Flexible funding - có thể giữ tiền
            if ($this->funding_type === self::FUNDING_FLEXIBLE || $hasMinimumGoal) {
                return [
                    'status' => 'ended_partial',
                    'label' => 'Đã kết thúc (một phần)',
                    'description' => 'Chiến dịch đã kết thúc, tiền sẽ được chuyển cho tổ chức',
                    'color' => 'orange',
                    'can_donate' => false,
                    'requires_action' => true // Cần xử lý chuyển tiền
                ];
            }
            // 3b. All-or-nothing funding - cần hoàn tiền
            else {
                return [
                    'status' => 'ended_failed',
                    'label' => 'Đã kết thúc (thất bại)',
                    'description' => 'Chiến dịch không đạt mục tiêu, tiền sẽ được hoàn lại',
                    'color' => 'red',
                    'can_donate' => false,
                    'requires_action' => true // Cần xử lý hoàn tiền
                ];
            }
        }

        // 4. Các trạng thái khác
        return [
            'status' => $this->status,
            'label' => ucfirst($this->status),
            'description' => $this->getStatusDescription(),
            'color' => $this->getStatusColor(),
            'can_donate' => false,
            'requires_action' => false
        ];
    }

    private function getStatusDescription(): string
    {
        return match($this->status) {
            'pending' => 'Chiến dịch đang chờ phê duyệt',
            'rejected' => 'Chiến dịch đã bị từ chối',
            'draft' => 'Chiến dịch đang soạn thảo',
            'paused' => 'Chiến dịch tạm dừng',
            'cancelled' => 'Chiến dịch đã bị hủy',
            default => 'Trạng thái không xác định'
        };
    }

    /**
     * Get status color for frontend
     */
    public function getStatusColor(): string
    {
        return match($this->getDisplayStatus()) {
            'completed' => 'green',
            'stopped' => 'yellow',
            'expired' => 'orange',
            'active' => 'blue',
            'pending' => 'gray',
            'rejected' => 'red',
            'draft' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Funding type constants
     */
    const FUNDING_FLEXIBLE = 'flexible';
    const FUNDING_ALL_OR_NOTHING = 'all_or_nothing'; 
    const FUNDING_THRESHOLD = 'threshold';

    /**
     * Check if campaign uses flexible funding
     */
    public function isFlexibleFunding(): bool
    {
        return $this->funding_type === self::FUNDING_FLEXIBLE;
    }

    /**
     * Check if campaign should be auto-disbursed when expired
     */
    public function shouldAutoDisburse(): bool
    {
        return $this->auto_disburse && $this->isFlexibleFunding();
    }

    /**
     * Check if campaign meets minimum funding requirement
     */
    public function meetsMinimumGoal(): bool
    {
        if (!$this->minimum_goal) return true;
        return $this->current_amount >= $this->minimum_goal;
    }

    /**
     * Get disbursement amount after platform fee
     */
    public function getDisbursementAmount(float $platformFeePercent = 3.0): float
    {
        $fee = $this->current_amount * ($platformFeePercent / 100);
        return $this->current_amount - $fee;
    }

    /**
     * Check if campaign is expired
     */
    public function isExpired(): bool
    {
        return $this->end_date <= now() && $this->status === 'active';
    }

    /**
     * Process campaign closure when expired
     */
    public function processClosure(array $options = []): CampaignClosure
    {
        $closureType = $this->determineClosureType();
        $disbursementAmount = 0;
        $platformFee = 0;

        if ($closureType === CampaignClosure::CLOSURE_COMPLETED || 
            ($closureType === CampaignClosure::CLOSURE_PARTIAL_COMPLETED && $this->shouldAutoDisburse())) {
            
            $platformFeePercent = $options['platform_fee_percent'] ?? 3.0;
            $platformFee = $this->current_amount * ($platformFeePercent / 100);
            $disbursementAmount = $this->current_amount - $platformFee;
        }

        $closure = CampaignClosure::create([
            'campaign_id' => $this->id,
            'closure_type' => $closureType,
            'final_amount' => $this->current_amount,
            'disbursement_amount' => $disbursementAmount,
            'platform_fee' => $platformFee,
            'closure_reason' => $options['reason'] ?? null,
            'disbursement_details' => $options['disbursement_details'] ?? null,
            'disbursed_at' => $disbursementAmount > 0 ? now() : null
        ]);

        // Update campaign status
        $this->update(['status' => 'completed']);

        return $closure;
    }

    /**
     * Determine closure type based on funding rules
     */
    private function determineClosureType(): string
    {
        if ($this->current_amount >= $this->target_amount) {
            return CampaignClosure::CLOSURE_COMPLETED;
        }

        if ($this->funding_type === self::FUNDING_FLEXIBLE) {
            return CampaignClosure::CLOSURE_PARTIAL_COMPLETED;
        }

        if ($this->funding_type === self::FUNDING_THRESHOLD && $this->meetsMinimumGoal()) {
            return CampaignClosure::CLOSURE_PARTIAL_COMPLETED;
        }

        return CampaignClosure::CLOSURE_FAILED;
    }

    /**
     * Check if campaign accepts credits donations
     */
    public function acceptsCredits(): bool
    {
        return $this->isActive() && $this->status === 'active';
    }

    /**
     * Get donations made with credits
     */
    public function creditsDonations(): HasMany
    {
        return $this->hasMany(Donation::class)->where('payment_method', 'credits');
    }

    /**
     * Get total amount donated via credits
     */
    public function getTotalCreditsAmount(): float
    {
        return $this->creditsDonations()->where('status', 'completed')->sum('amount');
    }

    /**
     * Get display status for frontend (legacy compatibility)
     */
    public function getDisplayStatus(): string
    {
        $detailed = $this->getDetailedStatus();
        return $detailed['status'];
    }
}