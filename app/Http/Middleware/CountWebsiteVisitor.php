<?php

namespace App\Http\Middleware;

use App\Models\WebsiteVisitor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CountWebsiteVisitor
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Hanya hitung request GET yang berhasil
        if (
            $request->isMethod('GET') &&
            $response->getStatusCode() < 400 &&
            ! $request->hasCookie('website_visitor_id')
        ) {
            $visitorId = (string) Str::uuid();

            WebsiteVisitor::create([
                'visitor_id' => $visitorId,

                // Tidak menyimpan IP mentah
                'ip_hash' => hash_hmac(
                    'sha256',
                    (string) $request->ip(),
                    (string) config('app.key')
                ),

                'user_agent' => $request->userAgent(),
                'first_visited_at' => now(),
            ]);

            // Cookie berlaku satu tahun
            $response->headers->setCookie(
                cookie(
                    name: 'website_visitor_id',
                    value: $visitorId,
                    minutes: 60 * 24 * 365,
                    path: '/',
                    secure: $request->isSecure(),
                    httpOnly: true,
                    sameSite: 'lax'
                )
            );
        }

        return $response;
    }
}
