<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'location',
        'image',
        'status',
        'participants_count',
        'organizer_id',
    ];

    protected $casts = [
        'date' => 'datetime',
        'participants_count' => 'integer',
        'status' => 'string',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }
}