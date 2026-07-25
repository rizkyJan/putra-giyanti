<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    // Menampilkan halaman depan (Landing Page)
    public function index()
    {
        // Mengambil 6 informasi/acara terbaru yang statusnya 'published'
        $posts = Post::where('status', 'publish')->latest()->take(6)->get();

        return Inertia::render('Welcome', [
            'posts' => $posts
        ]);
    }

    // Menampilkan detail informasi/acara ketika di-klik
    public function show($slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        return Inertia::render('PostDetail', [
            'post' => $post
        ]);
    }
}
