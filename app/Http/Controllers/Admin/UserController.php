<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Menampilkan daftar semua anggota/user.
     */
    public function index()
    {
        // Ambil semua data user, urutkan berdasarkan nama
        $users = User::orderBy('name', 'asc')->get();

        // Lempar data ke halaman React: resources/js/Pages/Admin/Users/Index.jsx
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    /**
     * Menampilkan form tambah anggota.
     */
    public function create()
    {
        // Lempar ke halaman React: resources/js/Pages/Admin/Users/Create.jsx
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Menyimpan data anggota baru ke database.
     */
    public function store(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'whatsapp_number' => 'nullable|string|max:20',
            'role' => 'required|in:admin,anggota',
            'is_active' => 'boolean',
            'password' => 'required|string|min:8', // Password wajib diisi saat awal buat
        ]);

        // 2. Simpan ke database
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'whatsapp_number' => $request->whatsapp_number,
            'role' => $request->role,
            'is_active' => $request->is_active ?? true,
            'password' => Hash::make($request->password), // Enkripsi password
        ]);

        // 3. Redirect kembali ke halaman index dengan pesan sukses
        return redirect()->route('admin.users.index')->with('success', 'Anggota berhasil ditambahkan.');
    }

    /**
     * Menampilkan form edit anggota.
     */
    public function edit(User $user)
    {
        // Lempar data spesifik user ke halaman React untuk diedit
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    /**
     * Menyimpan pembaruan data anggota.
     */
    public function update(Request $request, User $user)
    {
        // 1. Validasi input (email boleh sama dengan email lama milik user ini)
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'whatsapp_number' => 'nullable|string|max:20',
            'role' => 'required|in:admin,anggota',
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:8', // Password opsional saat edit
        ]);

        // 2. Siapkan data yang akan diupdate
        $dataToUpdate = [
            'name' => $request->name,
            'email' => $request->email,
            'whatsapp_number' => $request->whatsapp_number,
            'role' => $request->role,
            'is_active' => $request->has('is_active') ? $request->is_active : $user->is_active,
        ];

        // 3. Jika kolom password diisi, maka update passwordnya juga
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        // 4. Eksekusi update
        $user->update($dataToUpdate);

        return redirect()->route('admin.users.index')->with('success', 'Data anggota berhasil diperbarui.');
    }

    /**
     * Menghapus data anggota.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Anggota berhasil dihapus.');
    }

    public function toggleStatus(User $user)
    {
        // Balikkan status saat ini (jika true jadi false, jika false jadi true)
        $user->update(['is_active' => !$user->is_active]);

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        // Kembalikan ke halaman sebelumnya dengan pesan sukses
        return back()->with('success', "Akun {$user->name} berhasil {$statusText}.");
    }
}
