<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Menggunakan ...$roles agar nantinya bisa menerima lebih dari satu role.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // 1. Jika belum login, tendang ke halaman login
        if (!$user) {
            return redirect()->route('login');
        }

        // 2. SUPER ADMIN PRIVILEGE: 
        // Jika rolenya 'admin', dia berkuasa penuh. Langsung tembus!
        if ($user->role === 'admin') {
            return $next($request);
        }

        // 3. Cek apakah role user saat ini ada di dalam array $roles yang diizinkan
        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        // 4. Jika bukan admin dan rolenya tidak sesuai, tolak aksesnya!
        abort(403, 'Maaf, Anda tidak memiliki akses ke halaman ini.');
    }
}
