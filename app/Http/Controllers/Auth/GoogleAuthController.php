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
    // Mengarahkan user ke halaman login Google
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    // Menangani balikan dari Google
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cek apakah user dengan email ini sudah ada
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Jika belum ada, daftarkan otomatis (Auto-Register)
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    // Buat password acak yang aman karena mereka login via Google
                    'password' => Hash::make(Str::random(16)),
                    'role' => 'anggota'
                ]);
            } else {
                // Jika sudah ada tapi google_id kosong, perbarui datanya
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->getId()]);
                }
            }

            // Login user
            Auth::login($user);

            // Arahkan ke dashboard
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
