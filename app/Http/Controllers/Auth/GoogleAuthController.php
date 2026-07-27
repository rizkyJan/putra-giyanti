<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cek apakah user dengan email ini sudah ada
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // KUNCI 1: Jika user baru, otomatis set is_active menjadi false (0)
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'anggota',
                    'is_active' => false // <-- Wajib verifikasi admin
                ]);
            } else {
                // Jika sudah ada tapi google_id kosong, perbarui datanya
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
            }

            // KUNCI 2: Blokir login jika akun belum diverifikasi/aktif
            if (!$user->is_active) {
                return redirect('/login')->with('status', 'Akun Anda berhasil didaftarkan, namun sedang menunggu verifikasi oleh Admin. Silakan hubungi Admin untuk aktivasi.');
            }

            // Jika aktif, proses login user
            Auth::login($user);

            // Arahkan ke dashboard sesuai role
            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            } elseif ($user->role === 'anggota') {
                return redirect()->route('member.dashboard');
            }

            return redirect('/');
        } catch (Exception $e) {
            return redirect('/login')->with('status', 'Terjadi kesalahan saat login menggunakan Google.');
        }
    }
}
