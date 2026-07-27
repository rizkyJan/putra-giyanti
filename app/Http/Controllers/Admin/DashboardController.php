<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;


use Inertia\Inertia;
use App\Models\User;
use App\Models\Meeting; // Sesuaikan jika nama modelmu Rapat
use App\Models\Attendances; // Sesuaikan jika nama modelmu Absensi
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Hitung total anggota (hanya yang role-nya 'anggota')
        $totalAnggota = User::where('role', 'anggota')->count();

        // 2. Hitung total rapat/kegiatan
        $totalRapat = Meeting::count();

        // 3. Hitung absensi khusus bulan ini
        $totalAbsensiBulanIni = Attendances::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Lempar data ke halaman React Inertia
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalAnggota' => $totalAnggota,
                'totalRapat' => $totalRapat,
                'totalAbsensi' => $totalAbsensiBulanIni,
            ]
        ]);
    }
}
