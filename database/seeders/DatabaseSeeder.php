<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Meeting;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat Akun Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'whatsapp_number' => '081234567890',
            'is_active' => true,
        ]);

        // 2. Buat Akun Anggota
        User::create([
            'name' => 'Rizky Januar Afrizal',
            'email' => 'member@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'anggota',
            'whatsapp_number' => '089876543210',
            'is_active' => true,
        ]);

        // // 3. Buat Contoh Jadwal Rapat (Dijadwalkan besok)
        // Meeting::create([
        //     'title' => 'Rapat Rutin Karang Taruna Agustus',
        //     'date' => Carbon::tomorrow()->format('Y-m-d'),
        //     'time' => '19:30:00',
        //     'location' => 'Balai Desa',
        //     'description' => 'Membahas persiapan acara dan laporan keuangan bulanan.',
        //     'status' => 'scheduled',
        //     'qr_code_token' => null, // Masih kosong karena rapat belum 'ongoing'
        // ]);
    }
}
