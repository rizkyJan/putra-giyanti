<?php

namespace App\Models;

use App\Models\Attendances;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = ['title', 'date', 'time', 'location', 'description', 'status'];

    public function attendances()
    {
        return $this->hasMany(Attendances::class);
    }
}
