<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Mengambil 5 rapat terdekat yang belum lewat atau semua rapat terbaru
        $upcomingMeetings = Meeting::orderBy('date', 'asc')->take(5)->get();

        return Inertia::render('Member/Dashboard', [
            'upcomingMeetings' => $upcomingMeetings
        ]);
    }
}
