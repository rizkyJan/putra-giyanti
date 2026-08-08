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
     *
     * image_url
     * images_urls
     */
    protected $appends = [
        'image_url',
        'images_urls',
    ];

    /**
     * URL untuk gambar utama.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->storedImageUrl(
            $this->getRawOriginal('image')
        );
    }

    /**
     * URL untuk galeri dokumentasi.
     */
    public function getImagesUrlsAttribute(): array
    {
        return collect(
            $this->images ?? []
        )
            ->map(
                fn ($image) =>
                    $this->storedImageUrl($image)
            )
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Mendukung 3 jenis gambar:
     *
     * 1. Google Drive
     *    gdrive:FILE_ID
     *
     * 2. Gambar lama storage Laravel
     *    posts/abc.jpg
     *
     * 3. URL eksternal
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
         * URL biasa.
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
         * Foto lama tetap menggunakan
         * storage Laravel.
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