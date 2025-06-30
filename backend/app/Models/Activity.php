<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'image',
        'images',
        'organizer_id',
        'organizer_name',
        'category',
        'status',
        'is_featured',
        'location',
        'event_date',
        'registration_deadline',
        'max_participants',
        'current_participants',
        'registration_fee',
        'contact_email',
        'contact_phone',
        'views_count',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'registration_deadline' => 'datetime',
        'max_participants' => 'integer',
        'current_participants' => 'integer',
        'registration_fee' => 'decimal:2',
        'views_count' => 'integer',
        'is_featured' => 'boolean',
        'images' => 'json'
    ];

    protected $appends = ['image_url', 'images_url', 'is_full', 'days_until_event'];

    // Relationships
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function registrations()
    {
        return $this->hasMany(ActivityRegistration::class);
    }

    public function confirmedRegistrations()
    {
        return $this->hasMany(ActivityRegistration::class)->where('status', 'confirmed');
    }

    // Accessors
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

    public function getIsFullAttribute(): bool
    {
        if (!$this->max_participants) {
            return false;
        }
        return $this->current_participants >= $this->max_participants;
    }

    public function getDaysUntilEventAttribute(): int
    {
        return max(0, now()->diffInDays($this->event_date, false));
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>', now());
    }

    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeAvailable($query)
    {
        return $query->where(function($q) {
            $q->whereNull('max_participants')
              ->orWhereRaw('current_participants < max_participants');
        });
    }

    // Helper methods
    public function canRegister(): bool
    {
        return $this->status === 'published' 
            && $this->event_date > now()
            && (!$this->registration_deadline || $this->registration_deadline > now())
            && !$this->is_full;
    }

    public function isUpcoming(): bool
    {
        return $this->event_date > now();
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($activity) {
            if (empty($activity->slug)) {
                $activity->slug = Str::slug($activity->title);
                
                // Ensure unique slug
                $originalSlug = $activity->slug;
                $count = 1;
                while (static::where('slug', $activity->slug)->exists()) {
                    $activity->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });
    }
}