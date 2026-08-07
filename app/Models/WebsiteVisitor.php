<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteVisitor extends Model
{
    protected $fillable = [
        'visitor_id',
        'ip_hash',
        'user_agent',
        'first_visited_at',
    ];

    protected function casts(): array
    {
        return [
            'first_visited_at' => 'datetime',
        ];
    }
}
