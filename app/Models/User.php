<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_verified' => 'boolean',
            'role' => 'string',
        ];
    }

    public function campaigns()
    {
        return $this->hasMany(Campaign::class, 'organizer_id');
    }

    public function donations()
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
}