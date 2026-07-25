<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\MeetingController;
use App\Http\Controllers\Admin\AttendancesController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Member\DashboardController as MemberDashboard;

Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/informasi/{slug}', [LandingController::class, 'show'])->name('post.show');

// ==========================================
// AREA ADMIN (Hanya bisa diakses role 'admin')
// ==========================================
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    // CRUD Controllers
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('meetings', MeetingController::class);
    Route::post('/meetings/{meeting}/start', [MeetingController::class, 'startMeeting'])->name('meetings.start');
    Route::post('/attendances/scan', [MeetingController::class, 'scan'])->name('attendances.scan');

    Route::get('/attendances', [AttendancesController::class, 'index'])->name('attendances.index');
    Route::get('/attendances/{meeting}', [AttendancesController::class, 'show'])->name('attendances.show');
    Route::post('/attendances/{id}/manual', [AttendancesController::class, 'markManual'])->name('attendances.manual');

    Route::resource('posts', PostController::class);
});

// ==========================================
// AREA ANGGOTA (Bisa diakses 'anggota', tapi karena logika Super Admin, admin juga bisa tembus ke sini jika butuh)
// ==========================================
Route::middleware(['auth', 'role:anggota'])->prefix('member')->name('member.')->group(function () {

    Route::get('/dashboard', [MemberDashboard::class, 'index'])->name('dashboard');

    // Nanti halaman untuk Anggota melihat QR Code-nya sendiri ditaruh di sini
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
