<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'location',
        'image',
        'participants_count',
        'status'
    ];

    protected $casts = [
        'date' => 'date',
        'participants_count' => 'integer'
    ];
}
