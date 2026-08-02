<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\User; // Tambahkan ini
use App\Models\Attendances; // Tambahkan ini (sesuaikan jika nama modelmu Attendance tanpa 's')
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;

class MeetingController extends Controller
{
    public function index()
    {
        $meetings = Meeting::orderBy('date', 'desc')->get();
        return Inertia::render('Admin/Meetings/Index', ['meetings' => $meetings]);
    }

    public function create()
    {
        return Inertia::render('Admin/Meetings/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        // Pecah input date dari React (cth: "2026-07-23T10:34") menjadi tanggal dan waktu
        $datetime = Carbon::parse($request->date);

        Meeting::create([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $datetime->toDateString(), // Menghasilkan "YYYY-MM-DD"
            'time' => $datetime->toTimeString(), // Menghasilkan "HH:mm:ss"
            'location' => $request->location ?? '-' // Kolom location ada di DB kamu, kita isi default '-' jika form tidak mengirimnya
        ]);

        return redirect()->route('admin.meetings.index')->with('success', 'Agenda rapat berhasil dibuat.');
    }

    public function edit(Meeting $meeting)
    {
        return Inertia::render('Admin/Meetings/Edit', ['meeting' => $meeting]);
    }

    public function update(Request $request, Meeting $meeting)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $datetime = Carbon::parse($request->date);

        $meeting->update([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $datetime->toDateString(),
            'time' => $datetime->toTimeString(),
            'location' => $request->location ?? '-'
        ]);

        return redirect()->route('admin.meetings.index')->with('success', 'Agenda rapat berhasil diperbarui.');
    }

    public function destroy(Meeting $meeting)
    {
        $meeting->delete();
        return redirect()->route('admin.meetings.index')->with('success', 'Rapat berhasil dihapus.');
    }

    public function startMeeting(Meeting $meeting)
    {
        // 1. Cegah jika rapat sudah pernah dimulai sebelumnya
        if ($meeting->status !== 'scheduled') {
            return back()->with('error', 'Rapat ini sudah dimulai atau selesai.');
        }

        // 2. Ubah status rapat menjadi 'ongoing' (Berlangsung)
        $meeting->update(['status' => 'ongoing']);

        // 3. Ambil semua data anggota (User yang role-nya 'anggota')
        $members = User::where('role', 'anggota')->get();

        // 4. Generate tiket/absensi beserta QR Code unik untuk tiap anggota!
        foreach ($members as $member) {
            Attendances::create([
                'user_id' => $member->id,
                'meeting_id' => $meeting->id,

                // INI PERBAIKANNYA: 
                // Format token disamakan persis dengan yang dibaca scanner HP kamu
                'qr_code_token' => "token-rapat-{$meeting->id}-user-{$member->id}",

                'status' => 'pending', // Status awal: belum hadir
            ]);
        }

        return back()->with('success', 'Rapat berhasil dimulai! QR Code untuk semua anggota telah dibuat.');
    }

    public function endMeeting(Meeting $meeting)
    {
        if ($meeting->status !== 'ongoing') {
            return back()->with('error', 'Hanya rapat yang sedang berlangsung yang dapat diakhiri.');
        }

        $meeting->update(['status' => 'completed']);

        return back()->with('success', 'Rapat telah diakhiri. Sesi absensi ditutup.');
    }

    public function resumeMeeting(Meeting $meeting)
    {
        if ($meeting->status !== 'completed') {
            return back()->with('error', 'Hanya rapat yang sudah selesai yang dapat dibuka kembali.');
        }

        $meeting->update(['status' => 'ongoing']);

        return back()->with('success', 'Rapat dibuka kembali! Anggota yang telat bisa absensi sekarang.');
    }

    public function scan(Request $request)
    {
        $request->validate([
            'meeting_id' => 'required|exists:meetings,id',
            'qr_code_token' => 'required|string',
        ]);

        // Eager load relasi 'user' DAN 'meeting' agar kita bisa cek status rapatnya
        $attendance = Attendances::with(['user', 'meeting'])
            ->where('meeting_id', $request->meeting_id)
            ->where('qr_code_token', $request->qr_code_token)
            ->first();

        if (!$attendance) {
            return back()->with('error', '❌ QR Code tidak valid atau bukan untuk agenda rapat ini!');
        }

        // TAMBAHAN LOGIKA: Tolak jika rapat sudah diakhiri
        if ($attendance->meeting->status === 'completed') {
            return back()->with('error', '❌ Absensi ditolak! Rapat ini sudah diakhiri.');
        }

        if ($attendance->status === 'hadir') {
            return back()->with('error', "⚠️ {$attendance->user->name} sudah melakukan absensi sebelumnya.");
        }

        $attendance->update([
            'status' => 'hadir',
            'scanned_at' => now(),
        ]);

        return back()->with('success', "✅ Berhasil! {$attendance->user->name} telah ditandai hadir.");
    }
}
