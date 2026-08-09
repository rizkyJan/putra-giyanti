<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'image',
        'content',
        'status',
        'type',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    /*
     * Otomatis dikirim ke React/Inertia.
     */
    protected $appends = [
        'image_url',
        'images_urls',

        /*
         * Khusus halaman Edit.
         *
         * Berisi:
         *
         * [
         *   {
         *      stored: "gdrive:FILE_ID",
         *      url: "/media/drive/FILE_ID"
         *   }
         * ]
         */
        'images_items',
    ];

    /**
     * URL gambar utama Informasi.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->storedImageUrl(
            $this->getRawOriginal(
                'image'
            )
        );
    }

    /**
     * URL galeri.
     *
     * Tetap dipakai Welcome/PostDetail.
     */
    public function getImagesUrlsAttribute(): array
    {
        return collect(
            $this->images ?? []
        )
            ->map(
                fn ($image) =>
                    $this->storedImageUrl(
                        $image
                    )
            )
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Data khusus halaman Edit.
     *
     * Tidak hanya URL,
     * tetapi juga nilai yang tersimpan DB.
     */
    public function getImagesItemsAttribute(): array
    {
        return collect(
            $this->images ?? []
        )
            ->filter(
                fn ($image) =>
                    is_string($image)
                    && $image !== ''
            )
            ->map(
                fn ($image) => [
                    /*
                     * Nilai database.
                     *
                     * Contoh:
                     * gdrive:1ABCDEF
                     */
                    'stored' =>
                        $image,

                    /*
                     * URL untuk <img>.
                     */
                    'url' =>
                        $this->storedImageUrl(
                            $image
                        ),
                ]
            )
            ->values()
            ->all();
    }

    /**
     * Ubah nilai database menjadi URL browser.
     *
     * Mendukung:
     *
     * 1. Google Drive
     * 2. URL eksternal
     * 3. Foto lama storage Laravel
     */
    private function storedImageUrl(
        ?string $storedImage
    ): ?string {
        if (!$storedImage) {
            return null;
        }

        /*
         * Google Drive.
         */
        if (
            Str::startsWith(
                $storedImage,
                'gdrive:'
            )
        ) {
            return route(
                'drive.image',
                [
                    'fileId' =>
                        Str::after(
                            $storedImage,
                            'gdrive:'
                        ),
                ]
            );
        }

        /*
         * URL eksternal.
         */
        if (
            Str::startsWith(
                $storedImage,
                [
                    'http://',
                    'https://',
                ]
            )
        ) {
            return $storedImage;
        }

        /*
         * Foto lama tetap didukung.
         *
         * Contoh:
         *
         * posts/gallery/abc.jpg
         *
         * menjadi:
         *
         * /storage/posts/gallery/abc.jpg
         */
        return asset(
            'storage/'
            . ltrim(
                $storedImage,
                '/'
            )
        );
    }
}