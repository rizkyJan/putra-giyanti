<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DriveImageController extends Controller
{
    public function show(
        string $fileId,
        GoogleDriveService $drive
    ): StreamedResponse {

        /*
         * Validasi sederhana File ID Google Drive.
         */
        abort_unless(
            (bool) preg_match(
                '/^[A-Za-z0-9_-]{10,}$/',
                $fileId
            ),
            404
        );

        /*
         * Ambil file private dari Google Drive.
         */
        $response =
            $drive->download(
                $fileId
            );

        if ($response->status() === 404) {
            abort(404);
        }

        abort_if(
            !$response->successful(),
            502,
            'Gagal mengambil gambar dari Google Drive.'
        );

        $psrResponse =
            $response->toPsrResponse();

        $body =
            $psrResponse->getBody();

        $contentType =
            $psrResponse
                ->getHeaderLine(
                    'Content-Type'
                )
            ?: 'application/octet-stream';

        /*
         * Stream gambar supaya tidak perlu
         * menyimpan permanen di Ubuntu.
         */
        return response()->stream(
            function () use ($body): void {

                while (!$body->eof()) {

                    echo $body->read(
                        1024 * 1024
                    );

                    flush();
                }
            },
            200,
            [
                'Content-Type' =>
                    $contentType,

                /*
                 * Browser boleh cache 1 hari.
                 * Ini mengurangi request ke Drive.
                 */
                'Cache-Control' =>
                    'public, max-age=86400',

                'X-Content-Type-Options' =>
                    'nosniff',
            ]
        );
    }
}