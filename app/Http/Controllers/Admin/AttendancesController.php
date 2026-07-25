<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendances; // Sesuaikan dengan nama modelmu
use App\Models\Meeting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendancesController extends Controller
{
    // 1. Menampilkan daftar rapat yang sudah dimulai (ongoing / completed)
    public function index()
    {
        // Hanya ambil rapat yang statusnya ongoing atau completed
        $meetings = Meeting::whereIn('status', ['ongoing', 'completed'])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Admin/Attendances/Index', [
            'meetings' => $meetings
        ]);
    }

    // 2. Menampilkan daftar anggota dan QR token mereka di rapat tertentu
    public function show(Meeting $meeting)
    {
        // Ambil data absensi beserta data User-nya
        $attendances = Attendances::with('user')
            ->where('meeting_id', $meeting->id)
            ->get()
            ->map(function ($item) {
                // Format ulang tanggal/waktu agar aman dibaca di semua perangkat (HP / Laptop)
                $item->formatted_scanned_at = $item->scanned_at
                    ? \Carbon\Carbon::parse($item->scanned_at)->timezone('Asia/Jakarta')->format('d/m/Y H:i:s')
                    : null;
                return $item;
            });

        return Inertia::render('Admin/Attendances/Show', [
            'meeting' => $meeting,
            'attendances' => $attendances
        ]);
    }

    // Fungsi untuk mengubah status absensi secara manual
    public function markManual($id)
    {
        $attendance = Attendances::with('user')->findOrFail($id);

        if ($attendance->status === 'hadir') {
            return back()->with('error', '⚠️ Anggota sudah ditandai hadir.');
        }

        $attendance->update([
            'status' => 'hadir',
            'scanned_at' => now(), // Mencatat jam saat tombol ditekan
        ]);

        return back()->with('success', "✅ Berhasil! {$attendance->user->name} telah ditandai hadir secara manual.");
    }
}
