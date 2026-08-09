<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class PostImageUploadController extends Controller
{
    public function __construct(
        private GoogleDriveService $drive
    ) {}

    /**
     * Upload SATU gambar.
     *
     * Browser akan memanggil endpoint ini
     * satu per satu:
     *
     * foto 1 -> selesai
     * foto 2 -> selesai
     * foto 3 -> selesai
     * dst.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200', // 50 MB per gambar
            ],
        ]);

        try {
            $file = $request->file('image');

            $fileId =
                $this->drive->upload(
                    $file
                );

            $stored =
                'gdrive:' . $fileId;

            /*
             * Simpan daftar temporary upload
             * di SESSION.
             *
             * Ini penting supaya client tidak
             * bisa mengirim File ID Drive
             * sembarangan saat membuat post.
             */
            $temporaryUploads =
                session()->get(
                    'post_temp_uploads',
                    []
                );

            if (
                !in_array(
                    $stored,
                    $temporaryUploads,
                    true
                )
            ) {
                $temporaryUploads[] =
                    $stored;

                session()->put(
                    'post_temp_uploads',
                    $temporaryUploads
                );
            }

            return response()->json([
                'success' => true,

                'stored' =>
                $stored,

                'url' =>
                route(
                    'drive.image',
                    [
                        'fileId' =>
                        $fileId,
                    ]
                ),

                'name' =>
                $file
                    ->getClientOriginalName(),

                'size' =>
                $file->getSize(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,

                'message' =>
                'Gagal menyimpan gambar '
                    . 'ke Google Drive.',
            ], 500);
        }
    }

    /**
     * Hapus temporary upload.
     *
     * Dipakai jika:
     *
     * - user sudah upload foto
     * - lalu menekan X sebelum post disimpan.
     */
    public function destroyTemp(
        Request $request
    ) {
        $request->validate([
            'stored' => [
                'required',
                'string',
            ],
        ]);

        $stored =
            $request->input(
                'stored'
            );

        $temporaryUploads =
            session()->get(
                'post_temp_uploads',
                []
            );

        /*
         * Hanya file milik session ini
         * yang boleh dihapus.
         */
        if (
            !in_array(
                $stored,
                $temporaryUploads,
                true
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                'Temporary upload tidak ditemukan.',
            ], 404);
        }

        try {
            if (
                Str::startsWith(
                    $stored,
                    'gdrive:'
                )
            ) {
                $fileId =
                    Str::after(
                        $stored,
                        'gdrive:'
                    );

                $this->drive->delete(
                    $fileId
                );
            }

            /*
             * Hapus dari daftar session.
             */
            $temporaryUploads =
                array_values(
                    array_filter(
                        $temporaryUploads,
                        fn($item) =>
                        $item !== $stored
                    )
                );

            session()->put(
                'post_temp_uploads',
                $temporaryUploads
            );

            return response()->json([
                'success' => true,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,

                'message' =>
                'Gagal menghapus temporary upload.',
            ], 500);
        }
    }
}
