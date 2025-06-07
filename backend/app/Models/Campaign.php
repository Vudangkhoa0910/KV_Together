<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'target_amount',
        'current_amount',
        'image_url',
        'is_featured',
        'status',
    ];

    protected $casts = [
        'target_amount' => 'integer',
        'current_amount' => 'integer',
        'is_featured' => 'boolean',
    ];

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }
}