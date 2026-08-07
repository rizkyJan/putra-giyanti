<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Meeting;
use App\Models\Attendances;
use App\Models\WebsiteVisitor;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ==========================================
        // 1. TOTAL ANGGOTA
        // ==========================================
        $totalAnggota = User::where('role', 'anggota')->count();


        // ==========================================
        // 2. TOTAL RAPAT / KEGIATAN
        // ==========================================
        $totalRapat = Meeting::count();


        // ==========================================
        // 3. TOTAL ABSENSI BULAN INI
        // ==========================================
        $totalAbsensiBulanIni = Attendances::whereMonth(
            'created_at',
            Carbon::now()->month
        )
            ->whereYear(
                'created_at',
                Carbon::now()->year
            )
            ->count();


        // ==========================================
        // 4. TOTAL PENGUNJUNG WEBSITE
        // ==========================================
        $totalPengunjung = WebsiteVisitor::count();


        // ==========================================
        // 5. PENGUNJUNG HARI INI
        // ==========================================
        $pengunjungHariIni = WebsiteVisitor::whereDate(
            'first_visited_at',
            Carbon::today()
        )->count();


        // ==========================================
        // KIRIM DATA KE REACT INERTIA
        // ==========================================
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalAnggota' => $totalAnggota,
                'totalRapat' => $totalRapat,
                'totalAbsensi' => $totalAbsensiBulanIni,
                'totalPengunjung' => $totalPengunjung,
                'pengunjungHariIni' => $pengunjungHariIni,
            ]
        ]);
    }
}
