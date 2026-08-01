<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Tambah tipe post (defaultnya informasi)
            $table->enum('type', ['informasi', 'dokumentasi'])->default('informasi')->after('slug');
            // Tambah kolom images tipe JSON untuk simpan banyak gambar (dokumentasi)
            $table->json('images')->nullable()->after('image'); 
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['type', 'images']);
        });
    }
};