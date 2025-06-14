<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FundraiserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'organization_name',
        'tax_id',
        'website',
        'social_media',
        'mission_statement',
        'organization_type',
        'year_established',
        'registration_number'
    ];

    protected $casts = [
        'year_established' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
} 