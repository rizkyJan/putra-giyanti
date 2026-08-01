<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    // Mengizinkan field ini diisi massal (Mass Assignment)
    protected $fillable = [
        'title',
        'slug',
        'image',
        'content',
        'status',
        'type',
        'images'
    ];

    protected $casts = [
        'images' => 'array', // Ini akan otomatis mengubah Array ke JSON di Database
    ];
}
