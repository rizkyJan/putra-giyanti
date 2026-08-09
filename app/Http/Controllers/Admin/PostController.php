<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class PostController extends Controller
{
    public function __construct(
        private GoogleDriveService $drive
    ) {}

    public function index()
    {
        $posts =
            Post::latest()
            ->paginate(10);

        return Inertia::render(
            'Admin/Post/Index',
            [
                'posts' =>
                $posts,
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'Admin/Post/Create'
        );
    }

    public function store(
        Request $request
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
             * Hasil upload queue untuk
             * Informasi.
             */
            'uploaded_image' => [
                'nullable',
                'string',
            ],

            /*
             * Hasil upload queue untuk
             * Dokumentasi.
             */
            'uploaded_images' => [
                'nullable',
                'array',
            ],

            'uploaded_images.*' => [
                'string',
            ],

            'status' => [
                'required',
                'in:draft,publish',
            ],
        ]);

        $imagePath =
            null;

        $imagesPaths =
            [];

        $usedTempUploads =
            [];

        /*
         * =================================
         * INFORMASI
         * =================================
         */
        if (
            $request->type ===
            'informasi'
        ) {
            $requestedImage =
                $request->input(
                    'uploaded_image'
                );

            if ($requestedImage) {
                $imagePath =
                    $this
                    ->resolveTempUpload(
                        $requestedImage,
                        'uploaded_image'
                    );

                $usedTempUploads[] =
                    $imagePath;
            }
        }

        /*
         * =================================
         * DOKUMENTASI
         * =================================
         */
        if (
            $request->type ===
            'dokumentasi'
        ) {
            $imagesPaths =
                $this
                ->resolveTempUploads(
                    $request->input(
                        'uploaded_images',
                        []
                    ),
                    'uploaded_images'
                );

            $usedTempUploads =
                $imagesPaths;
        }

        try {
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

            /*
             * Sekarang file bukan temporary lagi.
             */
            $this->consumeTempUploads(
                $usedTempUploads
            );
        } catch (Throwable $e) {
            report($e);

            /*
             * Jangan hapus temp upload.
             *
             * User bisa memperbaiki form lalu
             * klik Simpan lagi tanpa upload ulang.
             */
            return back()
                ->withInput()
                ->withErrors([
                    'upload' =>
                    'Data postingan gagal disimpan. '
                        . 'Foto yang sudah berhasil di-upload '
                        . 'tidak perlu di-upload ulang.',
                ]);
        }

        return redirect()
            ->route(
                'admin.posts.index'
            )
            ->with(
                'message',
                'Data berhasil disimpan. '
                    . 'Semua foto berhasil diunggah ke Google Drive!'
            );
    }

    public function edit(
        Post $post
    ) {
        return Inertia::render(
            'Admin/Post/Edit',
            [
                'post' =>
                $post,
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

            'uploaded_image' => [
                'nullable',
                'string',
            ],

            'uploaded_images' => [
                'nullable',
                'array',
            ],

            'uploaded_images.*' => [
                'string',
            ],

            'remove_images' => [
                'nullable',
                'array',
            ],

            'remove_images.*' => [
                'string',
            ],

            'status' => [
                'required',
                'in:draft,publish',
            ],
        ]);

        /*
         * Data lama.
         */
        $oldImage =
            $post->getRawOriginal(
                'image'
            );

        $oldImages =
            array_values(
                array_filter(
                    $post->images ??
                        []
                )
            );

        $imagePath =
            $oldImage;

        $imagesPaths =
            $oldImages;

        /*
         * File lama yang baru dihapus
         * SETELAH DB sukses.
         */
        $deleteAfterSuccess =
            [];

        /*
         * File queue baru yang setelah DB
         * sukses tidak lagi dianggap temporary.
         */
        $usedTempUploads =
            [];

        /*
         * =================================
         * INFORMASI
         * =================================
         */
        if (
            $request->type ===
            'informasi'
        ) {
            /*
             * Jika sebelumnya dokumentasi,
             * galeri lama akan dihapus.
             */
            if (
                !empty($oldImages)
            ) {
                $deleteAfterSuccess =
                    array_merge(
                        $deleteAfterSuccess,
                        $oldImages
                    );
            }

            $imagesPaths =
                [];

            /*
             * Berubah Dokumentasi -> Informasi.
             */
            if (
                $post->type !==
                'informasi'
            ) {
                $imagePath =
                    null;
            }

            /*
             * Gambar baru hasil queue.
             */
            $requestedNewImage =
                $request->input(
                    'uploaded_image'
                );

            if (
                $requestedNewImage
            ) {
                $newImage =
                    $this
                    ->resolveTempUpload(
                        $requestedNewImage,
                        'uploaded_image'
                    );

                $imagePath =
                    $newImage;

                $usedTempUploads[] =
                    $newImage;

                /*
                 * Gambar lama dihapus setelah DB sukses.
                 */
                if ($oldImage) {
                    $deleteAfterSuccess[] =
                        $oldImage;
                }
            }
        } else {
            /*
             * =================================
             * DOKUMENTASI
             * =================================
             */

            /*
             * Dokumentasi tidak menggunakan
             * gambar utama.
             */
            if ($oldImage) {
                $deleteAfterSuccess[] =
                    $oldImage;
            }

            $imagePath =
                null;

            /*
             * Kalau sebelumnya Informasi,
             * galeri awal kosong.
             */
            $baseImages =
                $post->type ===
                'dokumentasi'
                ? $oldImages
                : [];

            /*
             * Foto lama yang dipilih X.
             */
            $requestedRemove =
                $request->input(
                    'remove_images',
                    []
                );

            /*
             * Hanya gambar milik post ini
             * yang boleh dihapus.
             */
            $removeImages =
                array_values(
                    array_intersect(
                        $requestedRemove,
                        $baseImages
                    )
                );

            /*
             * Sisakan yang tidak di-X.
             */
            $imagesPaths =
                array_values(
                    array_filter(
                        $baseImages,
                        fn($image) =>
                        !in_array(
                            $image,
                            $removeImages,
                            true
                        )
                    )
                );

            $deleteAfterSuccess =
                array_merge(
                    $deleteAfterSuccess,
                    $removeImages
                );

            /*
             * Foto BARU hasil queue.
             */
            $newImages =
                $this
                ->resolveTempUploads(
                    $request->input(
                        'uploaded_images',
                        []
                    ),
                    'uploaded_images'
                );

            /*
             * Tambah.
             * BUKAN replace.
             */
            $imagesPaths =
                array_values(
                    array_merge(
                        $imagesPaths,
                        $newImages
                    )
                );

            $usedTempUploads =
                $newImages;
        }

        try {
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

            /*
             * Queue upload sudah resmi
             * menjadi bagian post.
             */
            $this->consumeTempUploads(
                $usedTempUploads
            );
        } catch (Throwable $e) {
            report($e);

            return back()
                ->withInput()
                ->withErrors([
                    'upload' =>
                    'Perubahan data gagal disimpan. '
                        . 'Foto baru yang sudah berhasil di-upload '
                        . 'tidak perlu di-upload ulang.',
                ]);
        }

        /*
         * DB berhasil.
         *
         * Baru hapus gambar lama.
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
                report($e);
            }
        }

        return redirect()
            ->route(
                'admin.posts.index'
            )
            ->with(
                'message',
                'Data berhasil diperbarui. '
                    . 'Perubahan galeri sudah tersimpan!'
            );
    }

    public function destroy(
        Post $post
    ) {
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
                        $post->images ??
                            []
                    )
                )
            );

        $post->delete();

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
     * ==========================================
     * TEMP UPLOAD SECURITY
     * ==========================================
     */

    private function getTempUploads(): array
    {
        return array_values(
            array_filter(
                session()->get(
                    'post_temp_uploads',
                    []
                ),
                fn($item) =>
                is_string(
                    $item
                ) &&
                    $item !== ''
            )
        );
    }

    /**
     * Validasi satu temporary upload.
     */
    private function resolveTempUpload(
        string $stored,
        string $field
    ): string {
        $allowed =
            $this->getTempUploads();

        if (
            !in_array(
                $stored,
                $allowed,
                true
            )
        ) {
            throw ValidationException::withMessages([
                $field =>
                'File upload tidak dikenali '
                    . 'atau session upload sudah berakhir.',
            ]);
        }

        return $stored;
    }

    /**
     * Validasi banyak temporary upload.
     */
    private function resolveTempUploads(
        array $requested,
        string $field
    ): array {
        $requested =
            array_values(
                array_unique(
                    array_filter(
                        $requested,
                        fn($item) =>
                        is_string(
                            $item
                        ) &&
                            $item !== ''
                    )
                )
            );

        if (
            empty($requested)
        ) {
            return [];
        }

        $allowed =
            $this->getTempUploads();

        $invalid =
            array_diff(
                $requested,
                $allowed
            );

        if (
            !empty($invalid)
        ) {
            throw ValidationException::withMessages([
                $field =>
                'Ada file upload yang tidak dikenali '
                    . 'atau session upload sudah berakhir.',
            ]);
        }

        /*
         * Urutan tetap mengikuti queue frontend.
         */
        return $requested;
    }

    /**
     * Hapus temporary marker dari session.
     *
     * FILE DRIVE TIDAK DIHAPUS.
     *
     * File sekarang resmi menjadi milik post.
     */
    private function consumeTempUploads(
        array $used
    ): void {
        if (
            empty($used)
        ) {
            return;
        }

        $current =
            $this->getTempUploads();

        $remaining =
            array_values(
                array_filter(
                    $current,
                    fn($item) =>
                    !in_array(
                        $item,
                        $used,
                        true
                    )
                )
            );

        session()->put(
            'post_temp_uploads',
            $remaining
        );
    }

    /**
     * Hapus gambar lama.
     *
     * Support:
     *
     * gdrive:FILE_ID
     * posts/abc.jpg
     */
    private function deleteStoredImage(
        string $storedImage
    ): void {
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

            $this->drive->delete(
                $fileId
            );

            return;
        }

        Storage::disk(
            'public'
        )->delete(
            $storedImage
        );
    }
}
