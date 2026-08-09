<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
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

            // Maksimal 50 MB per gambar informasi
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

            // Maksimal 50 MB PER gambar dokumentasi
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
         * Kalau upload Drive berhasil tetapi database gagal,
         * file baru akan dibersihkan lagi.
         */
        $newUploads = [];

        try {
            /*
             * ==========================================
             * INFORMASI
             * ==========================================
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
             * ==========================================
             * DOKUMENTASI
             * ==========================================
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

                    $stored = $this->uploadToDrive(
                        $file
                    );

                    $imagesPaths[] = $stored;
                    $newUploads[] = $stored;
                }
            }

            Post::create([
                'title' => $request->title,

                'slug' => Str::slug(
                    $request->title
                ),

                'type' => $request->type,

                'content' => $request->content,

                'image' => $imagePath,

                'images' => empty($imagesPaths)
                    ? null
                    : $imagesPaths,

                'status' => $request->status,
            ]);
        } catch (Throwable $e) {
            /*
             * Jangan meninggalkan file baru yatim di Drive
             * bila proses database gagal.
             */
            $this->cleanupNewUploads(
                $newUploads
            );

            report($e);

            return back()
                ->withInput()
                ->withErrors([
                    $request->type === 'dokumentasi'
                        ? 'images'
                        : 'image'
                    =>
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

            /*
             * Gambar baru untuk Informasi
             */
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200',
            ],

            /*
             * Gambar BARU yang ingin ditambahkan
             * ke dokumentasi.
             */
            'images' => [
                'nullable',
                'array',
            ],

            'images.*' => [
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:51200',
            ],

            /*
             * Daftar gambar LAMA yang dipilih
             * admin untuk dihapus.
             */
            'remove_images' => [
                'nullable',
                'array',
            ],

            'remove_images.*' => [
                'string',
                'max:1000',
            ],

            'status' => [
                'required',
                'in:draft,publish',
            ],
        ]);

        /*
         * Ambil data gambar lama langsung dari DB.
         */
        $oldImage =
            $post->getRawOriginal(
                'image'
            );

        $oldImages =
            array_values(
                array_filter(
                    $post->images ?? [],
                    fn ($image) =>
                        is_string($image)
                        && $image !== ''
                )
            );

        $imagePath =
            $oldImage;

        $imagesPaths =
            $oldImages;

        /*
         * File BARU yang sudah berhasil
         * masuk Drive.
         *
         * Kalau DB gagal, semuanya akan
         * dihapus kembali.
         */
        $newUploads = [];

        /*
         * File LAMA yang akan dihapus.
         *
         * File tidak langsung dihapus.
         * Kita tunggu DB berhasil dahulu.
         */
        $deleteAfterSuccess = [];

        try {
            /*
             * ==========================================
             * INFORMASI
             * ==========================================
             */
            if (
                $request->type ===
                'informasi'
            ) {
                /*
                 * Informasi tidak memakai galeri.
                 *
                 * Jika sebelumnya Dokumentasi,
                 * seluruh galeri lamanya akan dihapus
                 * SETELAH database sukses.
                 */
                if (!empty($oldImages)) {
                    $deleteAfterSuccess =
                        array_merge(
                            $deleteAfterSuccess,
                            $oldImages
                        );
                }

                $imagesPaths = [];

                /*
                 * Kalau sebelumnya Dokumentasi,
                 * tidak ada gambar utama yang
                 * dipertahankan.
                 */
                if (
                    $post->type !==
                    'informasi'
                ) {
                    $imagePath = null;
                }

                /*
                 * Jika admin memilih gambar baru,
                 * upload ke Drive.
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
                 * ==========================================
                 * DOKUMENTASI
                 * ==========================================
                 *
                 * Logika baru:
                 *
                 * FOTO LAMA
                 *   ↓
                 * tetap dipertahankan
                 *
                 * REMOVE_IMAGES
                 *   ↓
                 * hanya yang dipilih dihapus
                 *
                 * IMAGES
                 *   ↓
                 * foto baru DITAMBAHKAN
                 * bukan mengganti galeri lama
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
                 * Galeri lama hanya dipertahankan
                 * kalau post sebelumnya memang
                 * Dokumentasi.
                 */
                $baseImages =
                    $post->type ===
                    'dokumentasi'
                        ? $oldImages
                        : [];

                /*
                 * Nilai yang dikirim frontend.
                 *
                 * Contoh:
                 *
                 * [
                 *   "gdrive:AAA",
                 *   "gdrive:BBB"
                 * ]
                 */
                $requestedRemoveImages =
                    $request->input(
                        'remove_images',
                        []
                    );

                /*
                 * KEAMANAN:
                 *
                 * Hanya gambar yang benar-benar
                 * terdapat pada post ini yang
                 * boleh dihapus.
                 *
                 * User tidak bisa mengirim
                 * FILE_ID Drive sembarangan.
                 */
                $removeImages =
                    array_values(
                        array_intersect(
                            $requestedRemoveImages,
                            $baseImages
                        )
                    );

                /*
                 * Pertahankan semua foto lama
                 * KECUALI yang dipilih X.
                 */
                $imagesPaths =
                    array_values(
                        array_filter(
                            $baseImages,
                            fn ($image) =>
                                !in_array(
                                    $image,
                                    $removeImages,
                                    true
                                )
                        )
                    );

                /*
                 * Foto yang ditandai X
                 * akan dihapus dari Drive nanti.
                 */
                $deleteAfterSuccess =
                    array_merge(
                        $deleteAfterSuccess,
                        $removeImages
                    );

                /*
                 * ==========================================
                 * TAMBAH FOTO BARU
                 * ==========================================
                 *
                 * Tidak mereset imagesPaths.
                 *
                 * Artinya gambar baru ditambahkan
                 * setelah gambar lama.
                 */
                if (
                    $request->hasFile(
                        'images'
                    )
                ) {
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
                            $this->uploadToDrive(
                                $file
                            );

                        /*
                         * TAMBAH, bukan replace.
                         */
                        $imagesPaths[] =
                            $stored;

                        /*
                         * Untuk rollback bila DB gagal.
                         */
                        $newUploads[] =
                            $stored;
                    }
                }
            }

            /*
             * ==========================================
             * UPDATE DATABASE
             * ==========================================
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
                        : array_values(
                            $imagesPaths
                        ),

                'status' =>
                    $request->status,
            ]);
        } catch (Throwable $e) {
            /*
             * Kalau ada error sebelum DB sukses,
             * hapus semua file BARU yang tadi
             * telanjur masuk Drive.
             *
             * Foto lama tetap aman.
             */
            $this->cleanupNewUploads(
                $newUploads
            );

            report($e);

            return back()
                ->withInput()
                ->withErrors([
                    $request->type ===
                    'dokumentasi'
                        ? 'images'
                        : 'image'
                    =>
                    'Perubahan gambar gagal disimpan '
                    . 'ke Google Drive. '
                    . 'Data lama tetap dipertahankan.',
                ]);
        }

        /*
         * ==========================================
         * CLEANUP FILE LAMA
         * ==========================================
         *
         * Database sudah berhasil.
         *
         * Baru sekarang kita benar-benar
         * menghapus file yang ditandai.
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
                 * Jangan membuat update post gagal
                 * hanya karena cleanup file lama
                 * bermasalah.
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
         * Hapus record DB.
         */
        $post->delete();

        /*
         * Bersihkan file Drive / local.
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
     * Upload file ke Drive.
     *
     * Database hanya menyimpan:
     *
     * gdrive:FILE_ID
     */
    private function uploadToDrive(
        UploadedFile $file
    ): string {
        return
            'gdrive:'
            . $this
                ->drive
                ->upload(
                    $file
                );
    }

    /**
     * Hapus gambar.
     *
     * Mendukung:
     *
     * - gdrive:FILE_ID
     * - posts/namafile.jpg lama
     */
    private function deleteStoredImage(
        string $storedImage
    ): void {
        /*
         * Google Drive
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
         * Kompatibilitas file lama
         * di storage/app/public.
         */
        Storage::disk(
            'public'
        )->delete(
            $storedImage
        );
    }

    /**
     * Kalau proses gagal, hapus upload
     * baru yang telanjur masuk Drive.
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