<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'content',
        'image',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}