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
    public function index()
    {
        $posts = Post::latest()->paginate(10);
        return Inertia::render('Admin/Post/Index', [
            'posts' => $posts
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Post/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:informasi,dokumentasi',
            'content' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // Validasi untuk setiap gambar
            'status' => 'required|in:draft,publish',
        ]);

        $imagePath = null;
        $imagesPaths = [];

        // Logika simpan gambar berdasarkan tipe
        if ($request->type === 'informasi') {
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('posts', 'public');
            }
        } elseif ($request->type === 'dokumentasi') {
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    // Ini sangat penting! Mencegah Laravel memproses file error/kosong
                    if ($file->isValid()) {
                        $imagesPaths[] = $file->store('posts/gallery', 'public');
                    }
                }
            }
        }

        Post::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'type' => $request->type,
            'content' => $request->content,
            'image' => $imagePath,
            'images' => empty($imagesPaths) ? null : $imagesPaths,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.posts.index')->with('message', 'Informasi/Dokumentasi berhasil ditambahkan!');
    }

    public function edit(Post $post)
    {
        return Inertia::render('Admin/Post/Edit', [
            'post' => $post
        ]);
    }

    public function update(Request $request, Post $post)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:informasi,dokumentasi',
            'content' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,publish',
        ]);

        $imagePath = $post->image;
        $imagesPaths = $post->images ?? [];

        // Jika mengubah tipe dari Dokumentasi ke Informasi
        if ($request->type === 'informasi') {
            // Bersihkan gambar dokumentasi lama jika ada
            if ($post->images) {
                foreach ($post->images as $oldImg) {
                    Storage::disk('public')->delete($oldImg);
                }
                $imagesPaths = null;
            }
            // Upload gambar tunggal baru jika ada
            if ($request->hasFile('image')) {
                if ($post->image) Storage::disk('public')->delete($post->image);
                $imagePath = $request->file('image')->store('posts', 'public');
            }
        }

        // Jika mengubah tipe dari Informasi ke Dokumentasi
        elseif ($request->type === 'dokumentasi') {
            // Bersihkan gambar informasi tunggal jika ada
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
                $imagePath = null;
            }
            // Upload gambar galeri baru jika ada
            if ($request->hasFile('images')) {
                // Hapus galeri lama agar diganti dengan yang baru
                if ($post->images) {
                    foreach ($post->images as $oldImg) {
                        Storage::disk('public')->delete($oldImg);
                    }
                }
                $imagesPaths = [];
                foreach ($request->file('images') as $file) {
                    $imagesPaths[] = $file->store('posts/gallery', 'public');
                }
            }
        }

        $post->update([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'type' => $request->type,
            'content' => $request->content,
            'image' => $imagePath,
            'images' => empty($imagesPaths) ? null : $imagesPaths,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.posts.index')->with('message', 'Data berhasil diperbarui!');
    }

    public function destroy(Post $post)
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        if ($post->images) {
            foreach ($post->images as $img) {
                Storage::disk('public')->delete($img);
            }
        }

        $post->delete();

        return redirect()->back()->with('message', 'Data berhasil dihapus!');
    }
}
