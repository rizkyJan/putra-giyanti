<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    // 1. Menampilkan daftar postingan
    public function index()
    {
        $posts = Post::latest()->paginate(10);
        return Inertia::render('Admin/Post/Index', [
            'posts' => $posts
        ]);
    }

    // 2. Menampilkan form tambah
    public function create()
    {
        return Inertia::render('Admin/Post/Create');
    }

    // 3. Menyimpan data ke database
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,publish',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        Post::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title), // Otomatis membuat URL dari judul
            'content' => $request->content,
            'image' => $imagePath,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.posts.index')->with('message', 'Informasi berhasil ditambahkan!');
    }

    // 4. Menampilkan form edit
    public function edit(Post $post)
    {
        return Inertia::render('Admin/Post/Edit', [
            'post' => $post
        ]);
    }

    // 5. Mengupdate data
    public function update(Request $request, Post $post)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,publish',
        ]);

        $imagePath = $post->image;

        // Cek jika ada gambar baru yang diupload
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post->update([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'image' => $imagePath,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.posts.index')->with('message', 'Informasi berhasil diperbarui!');
    }

    // 6. Menghapus data
    public function destroy(Post $post)
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->back()->with('message', 'Informasi berhasil dihapus!');
    }
}
