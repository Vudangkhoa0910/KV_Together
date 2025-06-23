<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role_id',
        'avatar',
        'bio',
        'address',
        'status',
        'is_admin',
        'is_verified',
        'profile_picture',
        'registration_reason',
        'fundraiser_type',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
        'is_verified' => 'boolean',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'organizer_id');
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function news()
    {
        return $this->hasMany(News::class, 'author_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'organizer_id');
    }

    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function fundraiserProfile(): HasOne
    {
        return $this->hasOne(FundraiserProfile::class);
    }

    public function virtualWallet(): HasOne
    {
        return $this->hasOne(VirtualWallet::class);
    }

    /**
     * Get or create virtual wallet for user
     */
    public function getWallet(): VirtualWallet
    {
        return $this->virtualWallet ?: $this->virtualWallet()->create([
            'balance' => 0,
            'total_earned' => 0,
            'total_spent' => 0,
            'tier' => VirtualWallet::TIER_BRONZE
        ]);
    }

    public function isFundraiser(): bool
    {
        return $this->role->slug === 'fundraiser';
    }

    public function isAdmin(): bool
    {
        return $this->role->slug === 'admin';
    }

    public function isStaff()
    {
        return $this->role->slug === 'staff';
    }

    public function isUser()
    {
        return $this->role->slug === 'user';
    }

    public function isPendingFundraiser()
    {
        return $this->role->slug === 'fundraiser' && $this->status === 'pending';
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->role->permissions ?? []);
    }

    public function canCreateCampaign(): bool
    {
        return $this->isFundraiser() || $this->isAdmin();
    }

    public function canCreateNews(): bool
    {
        return $this->isFundraiser() || $this->isAdmin();
    }

    public function hasRole(string $role): bool
    {
        return $this->role && $this->role->slug === $role;
    }
}