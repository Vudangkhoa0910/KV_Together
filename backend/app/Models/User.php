<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role', // 'user', 'fundraiser', 'admin'
        'status', // 'active', 'pending', 'rejected' - for fundraiser approval
        'is_admin',
        'is_verified',
        'profile_picture',
        'bio',
        'address',
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
        'role' => 'string',
    ];

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

    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function fundraiserProfile()
    {
        return $this->hasOne(FundraiserProfile::class);
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Check if user has admin role
     */
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user has staff role
     */
    public function isStaff()
    {
        return $this->hasRole('staff');
    }

    /**
     * Check if user has regular user role
     */
    public function isUser()
    {
        return $this->hasRole('user');
    }

    public function isFundraiser()
    {
        return $this->role === 'fundraiser';
    }

    public function isPendingFundraiser()
    {
        return $this->role === 'fundraiser' && $this->status === 'pending';
    }
}