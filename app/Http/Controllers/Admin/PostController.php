<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class PostController extends Controller
{
    public function __construct(
        private GoogleDriveService $drive
    ) {
    }

    public function index()
    {
        $posts = Post::latest()->paginate(10);

        return Inertia::render('Admin/Post/Index', [
            'posts' => $posts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Post/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'in:informasi,dokumentasi',
            ],

            'content' => [
                'required',
            ],

            // 50 MB PER GAMBAR
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200',
            ],

            'images' => [
                'nullable',
                'array',
            ],

            // 50 MB PER GAMBAR GALERI
            'images.*' => [
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200',
            ],

            'status' => [
                'required',
                'in:draft,publish',
            ],
        ]);

        $imagePath = null;
        $imagesPaths = [];

        /*
         * Menyimpan daftar upload baru.
         *
         * Kalau database gagal menyimpan,
         * gambar yang sudah telanjur masuk Drive
         * akan kita hapus lagi.
         */
        $newUploads = [];

        try {

            /*
             * ================================
             * INFORMASI
             * ================================
             *
             * Hanya 1 gambar utama.
             */
            if (
                $request->type === 'informasi'
                && $request->hasFile('image')
            ) {
                $imagePath = $this->uploadToDrive(
                    $request->file('image')
                );

                $newUploads[] = $imagePath;
            }

            /*
             * ================================
             * DOKUMENTASI
             * ================================
             *
             * Bisa banyak gambar.
             */
            if (
                $request->type === 'dokumentasi'
                && $request->hasFile('images')
            ) {

                foreach (
                    $request->file('images')
                    as $file
                ) {

                    if (!$file->isValid()) {
                        continue;
                    }

                    $stored =
                        $this->uploadToDrive(
                            $file
                        );

                    $imagesPaths[] =
                        $stored;

                    $newUploads[] =
                        $stored;
                }
            }

            /*
             * Database TIDAK menyimpan binary gambar.
             *
             * Contoh:
             *
             * image:
             * gdrive:1ABCXYZ...
             *
             * images:
             * [
             *   "gdrive:1AAA...",
             *   "gdrive:1BBB..."
             * ]
             */
            Post::create([
                'title' =>
                    $request->title,

                'slug' =>
                    Str::slug(
                        $request->title
                    ),

                'type' =>
                    $request->type,

                'content' =>
                    $request->content,

                'image' =>
                    $imagePath,

                'images' =>
                    empty($imagesPaths)
                        ? null
                        : $imagesPaths,

                'status' =>
                    $request->status,
            ]);

        } catch (Throwable $e) {

            /*
             * Kalau proses gagal setelah upload,
             * hapus file baru dari Drive supaya
             * tidak meninggalkan file sampah.
             */
            $this->cleanupNewUploads(
                $newUploads
            );

            report($e);

            return back()
                ->withInput()
                ->withErrors([
                    'image' =>
                        'Upload gambar ke Google Drive gagal. '
                        . 'Silakan coba lagi.',
                ]);
        }

        return redirect()
            ->route(
                'admin.posts.index'
            )
            ->with(
                'message',
                'Informasi/Dokumentasi berhasil ditambahkan!'
            );
    }

    public function edit(Post $post)
    {
        return Inertia::render(
            'Admin/Post/Edit',
            [
                'post' => $post,
            ]
        );
    }

    public function update(
        Request $request,
        Post $post
    ) {

        $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
                'in:informasi,dokumentasi',
            ],

            'content' => [
                'required',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200',
            ],

            'images' => [
                'nullable',
                'array',
            ],

            'images.*' => [
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200',
            ],

            'status' => [
                'required',
                'in:draft,publish',
            ],
        ]);

        /*
         * Ambil data gambar lama.
         */
        $oldImage =
            $post->getRawOriginal(
                'image'
            );

        $oldImages =
            $post->images ?? [];

        $imagePath =
            $oldImage;

        $imagesPaths =
            $oldImages;

        /*
         * File yang baru saja diupload.
         *
         * Jika update database gagal,
         * file ini dihapus kembali.
         */
        $newUploads = [];

        /*
         * File lama yang harus dihapus
         * setelah update database berhasil.
         */
        $deleteAfterSuccess = [];

        try {

            /*
             * ==================================
             * TIPE INFORMASI
             * ==================================
             */
            if (
                $request->type ===
                'informasi'
            ) {

                /*
                 * Kalau sebelumnya dokumentasi,
                 * hapus galeri lamanya.
                 */
                if (!empty($oldImages)) {

                    $deleteAfterSuccess =
                        array_merge(
                            $deleteAfterSuccess,
                            $oldImages
                        );

                    $imagesPaths = null;
                }

                /*
                 * Jika sebelumnya bukan
                 * informasi, reset gambar utama.
                 */
                if (
                    $post->type !==
                    'informasi'
                ) {
                    $imagePath = null;
                }

                /*
                 * Kalau admin upload gambar baru.
                 */
                if (
                    $request->hasFile(
                        'image'
                    )
                ) {

                    $stored =
                        $this->uploadToDrive(
                            $request->file(
                                'image'
                            )
                        );

                    $newUploads[] =
                        $stored;

                    $imagePath =
                        $stored;

                    /*
                     * Gambar lama baru dihapus
                     * setelah database sukses.
                     */
                    if ($oldImage) {
                        $deleteAfterSuccess[] =
                            $oldImage;
                    }
                }

            } else {

                /*
                 * ==================================
                 * TIPE DOKUMENTASI
                 * ==================================
                 */

                /*
                 * Dokumentasi tidak menggunakan
                 * gambar utama.
                 */
                if ($oldImage) {
                    $deleteAfterSuccess[] =
                        $oldImage;
                }

                $imagePath = null;

                /*
                 * Kalau admin memilih galeri baru,
                 * galeri lama diganti.
                 */
                if (
                    $request->hasFile(
                        'images'
                    )
                ) {

                    $replacementImages =
                        [];

                    foreach (
                        $request->file(
                            'images'
                        )
                        as $file
                    ) {

                        if (
                            !$file->isValid()
                        ) {
                            continue;
                        }

                        $stored =
                            $this
                                ->uploadToDrive(
                                    $file
                                );

                        $replacementImages[] =
                            $stored;

                        $newUploads[] =
                            $stored;
                    }

                    /*
                     * Galeri lama dihapus setelah
                     * database sukses diupdate.
                     */
                    if (!empty($oldImages)) {

                        $deleteAfterSuccess =
                            array_merge(
                                $deleteAfterSuccess,
                                $oldImages
                            );
                    }

                    $imagesPaths =
                        empty(
                            $replacementImages
                        )
                            ? null
                            : $replacementImages;

                } elseif (
                    $post->type !==
                    'dokumentasi'
                ) {

                    $imagesPaths =
                        null;
                }
            }

            /*
             * Update database.
             */
            $post->update([
                'title' =>
                    $request->title,

                'slug' =>
                    Str::slug(
                        $request->title
                    ),

                'type' =>
                    $request->type,

                'content' =>
                    $request->content,

                'image' =>
                    $imagePath,

                'images' =>
                    empty($imagesPaths)
                        ? null
                        : $imagesPaths,

                'status' =>
                    $request->status,
            ]);

        } catch (Throwable $e) {

            /*
             * Kalau update database gagal,
             * file baru yang sudah masuk Drive
             * dihapus.
             */
            $this->cleanupNewUploads(
                $newUploads
            );

            report($e);

            return back()
                ->withInput()
                ->withErrors([
                    'image' =>
                        'Upload/perubahan gambar '
                        . 'di Google Drive gagal. '
                        . 'Data lama tetap dipertahankan.',
                ]);
        }

        /*
         * Database berhasil.
         *
         * Sekarang aman menghapus
         * file gambar lama.
         */
        foreach (
            array_unique(
                array_filter(
                    $deleteAfterSuccess
                )
            )
            as $storedImage
        ) {

            try {

                $this->deleteStoredImage(
                    $storedImage
                );

            } catch (Throwable $e) {

                /*
                 * Jangan gagalkan update post
                 * hanya karena file lama gagal
                 * dihapus.
                 */
                report($e);
            }
        }

        return redirect()
            ->route(
                'admin.posts.index'
            )
            ->with(
                'message',
                'Data berhasil diperbarui!'
            );
    }

    public function destroy(
        Post $post
    ) {

        /*
         * Catat semua file sebelum
         * record database dihapus.
         */
        $storedImages =
            array_values(
                array_filter(
                    array_merge(
                        [
                            $post
                                ->getRawOriginal(
                                    'image'
                                ),
                        ],
                        $post->images ?? []
                    )
                )
            );

        /*
         * Hapus database terlebih dahulu.
         */
        $post->delete();

        /*
         * Kemudian bersihkan Drive/storage.
         */
        foreach (
            $storedImages
            as $storedImage
        ) {

            try {

                $this->deleteStoredImage(
                    $storedImage
                );

            } catch (Throwable $e) {

                report($e);
            }
        }

        return redirect()
            ->back()
            ->with(
                'message',
                'Data berhasil dihapus!'
            );
    }

    /**
     * Upload gambar ke Drive.
     *
     * Yang disimpan ke database hanya:
     *
     * gdrive:FILE_ID
     */
    private function uploadToDrive(
        $file
    ): string {

        return
            'gdrive:'
            . $this
                ->drive
                ->upload($file);
    }

    /**
     * Menghapus gambar.
     *
     * Mendukung:
     *
     * 1. gambar baru Google Drive
     * 2. gambar lama storage lokal
     */
    private function deleteStoredImage(
        string $storedImage
    ): void {

        /*
         * Gambar Google Drive.
         */
        if (
            Str::startsWith(
                $storedImage,
                'gdrive:'
            )
        ) {

            $fileId =
                Str::after(
                    $storedImage,
                    'gdrive:'
                );

            $this
                ->drive
                ->delete(
                    $fileId
                );

            return;
        }

        /*
         * Gambar lama.
         *
         * Contoh:
         * posts/abc.jpg
         */
        Storage::disk(
            'public'
        )->delete(
            $storedImage
        );
    }

    /**
     * Bersihkan upload baru apabila
     * transaksi penyimpanan gagal.
     */
    private function cleanupNewUploads(
        array $uploads
    ): void {

        foreach (
            $uploads
            as $storedImage
        ) {

            try {

                $this->deleteStoredImage(
                    $storedImage
                );

            } catch (Throwable $e) {

                report($e);
            }
        }
    }
}