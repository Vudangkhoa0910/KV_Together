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
        'password',
        'is_admin',
        'role',
        'is_verified',
        'profile_picture',
        'bio',
        'phone',
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

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isAmbassador(): bool
    {
        return $this->role === 'ambassador';
    }

    public function isOrganization(): bool
    {
        return $this->role === 'organization';
    }
}