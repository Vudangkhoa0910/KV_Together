<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'target_amount',
        'current_amount',
        'start_date',
        'end_date',
        'status',
        'organizer_id',
        'category_id',
        'is_active',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'status' => 'string',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function updates()
    {
        return $this->hasMany(CampaignUpdate::class);
    }
}