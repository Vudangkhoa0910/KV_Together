<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'is_featured' => 'boolean',
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
               $this->end_date > now();
               // Bỏ điều kiện current_amount < target_amount để cho phép chiến dịch tiếp tục nhận tiền
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('end_date', '>', now());
                    // Bỏ điều kiện current_amount < target_amount
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
     * Get display status for frontend
     */
    public function getDisplayStatus(): string
    {
        // Chiến dịch hoàn thành nếu:
        // 1. Status = completed (được đánh dấu thủ công hoặc đạt đủ số tiền), HOẶC
        // 2. Đã hết thời gian (end_date <= now)
        if ($this->status === 'completed' || 
            $this->current_amount >= $this->target_amount ||
            ($this->status === 'active' && $this->end_date <= now())) {
            return 'completed';
        }
        
        return $this->status; // active, pending, rejected, draft
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
}