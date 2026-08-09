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

    protected $appends = [
        'image_url',
        'images_urls',
        'images_items',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->storedImageUrl(
            $this->getRawOriginal(
                'image'
            )
        );
    }

    public function getImagesUrlsAttribute(): array
    {
        return collect(
            $this->images ?? []
        )
            ->map(
                fn($image) =>
                $this->storedImageUrl(
                    $image
                )
            )
            ->filter()
            ->values()
            ->all();
    }

    public function getImagesItemsAttribute(): array
    {
        return collect(
            $this->images ?? []
        )
            ->filter(
                fn($image) =>
                is_string($image)
                    && $image !== ''
            )
            ->map(
                fn($image) => [
                    'stored' =>
                    $image,

                    'url' =>
                    $this->storedImageUrl(
                        $image
                    ),
                ]
            )
            ->values()
            ->all();
    }

    private function storedImageUrl(
        ?string $storedImage
    ): ?string {
        if (
            !$storedImage
        ) {
            return null;
        }

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

        return asset(
            'storage/'
                . ltrim(
                    $storedImage,
                    '/'
                )
        );
    }
}
