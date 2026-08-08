<?php

namespace App\Services;

use Google\Client;
use Google\Http\MediaFileUpload;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\Client\Response as HttpResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class GoogleDriveService
{
    private ?Client $client = null;
    private ?Drive $drive = null;

    private array $state = [];

    public function __construct()
    {
        $this->state = $this->loadState();
    }

    /**
     * Cari folder penyimpanan.
     * Kalau belum ada, otomatis dibuat.
     */
    public function folderId(): string
    {
        if (!empty($this->state['folder_id'])) {
            return $this->state['folder_id'];
        }

        $folderName = 'Putra Giyanti Website Uploads';

        $safeName = str_replace(
            ["\\", "'"],
            ["\\\\", "\\'"],
            $folderName
        );

        $result = $this->drive()->files->listFiles([
            'q' => "name = '{$safeName}'"
                . " and mimeType = 'application/vnd.google-apps.folder'"
                . " and trashed = false",
            'spaces' => 'drive',
            'fields' => 'files(id,name)',
            'pageSize' => 10,
        ]);

        $folders = $result->getFiles();

        if (!empty($folders)) {
            $folderId = $folders[0]->getId();
        } else {
            $metadata = new DriveFile([
                'name' => $folderName,
                'mimeType' => 'application/vnd.google-apps.folder',
            ]);

            $folder = $this->drive()->files->create(
                $metadata,
                [
                    'fields' => 'id',
                ]
            );

            $folderId = $folder->getId();
        }

        if (!$folderId) {
            throw new RuntimeException(
                'Google Drive tidak mengembalikan Folder ID.'
            );
        }

        $this->state['folder_id'] = $folderId;

        $this->saveState();

        return $folderId;
    }

    /**
     * Upload 1 gambar ke Google Drive.
     *
     * Return:
     * Google Drive File ID
     */
    public function upload(UploadedFile $file): string
    {
        if (!$file->isValid()) {
            throw new RuntimeException('File upload tidak valid.');
        }

        $realPath = $file->getRealPath();

        if (!$realPath || !is_file($realPath)) {
            throw new RuntimeException(
                'File temporary upload tidak ditemukan.'
            );
        }

        $extension = strtolower(
            $file->getClientOriginalExtension()
        );

        $filename =
            now()->format('Ymd-His')
            . '-'
            . Str::uuid();

        if ($extension !== '') {
            $filename .= '.' . $extension;
        }

        $metadata = new DriveFile([
            'name' => $filename,
            'parents' => [
                $this->folderId(),
            ],
        ]);

        /*
         * 8 MB per chunk.
         *
         * Google Drive mensyaratkan chunk resumable
         * berupa kelipatan 256 KB selain chunk terakhir.
         */
        $chunkSize = 8 * 1024 * 1024;

        $mimeType =
            $file->getMimeType()
            ?: 'application/octet-stream';

        $client = $this->client();

        /*
         * setDefer(true) membuat files->create()
         * menghasilkan request yang kemudian dipakai
         * oleh MediaFileUpload.
         */
        $client->setDefer(true);

        $handle = null;

        try {
            $request = $this->drive()->files->create(
                $metadata,
                [
                    'fields' => 'id,name,size,mimeType',
                ]
            );

            $media = new MediaFileUpload(
                $client,
                $request,
                $mimeType,
                null,
                true,
                $chunkSize
            );

            $media->setFileSize(
                (int) $file->getSize()
            );

            $handle = fopen(
                $realPath,
                'rb'
            );

            if ($handle === false) {
                throw new RuntimeException(
                    'File tidak dapat dibaca.'
                );
            }

            $status = false;

            while (!$status && !feof($handle)) {
                $chunk = fread(
                    $handle,
                    $chunkSize
                );

                if ($chunk === false) {
                    throw new RuntimeException(
                        'Gagal membaca chunk file.'
                    );
                }

                if ($chunk === '') {
                    break;
                }

                $status = $media->nextChunk(
                    $chunk
                );
            }

            if (!$status) {
                throw new RuntimeException(
                    'Upload Google Drive tidak selesai.'
                );
            }

            $fileId = $status->getId();

            if (!$fileId) {
                throw new RuntimeException(
                    'Google Drive tidak mengembalikan File ID.'
                );
            }

            return $fileId;

        } finally {

            if (is_resource($handle)) {
                fclose($handle);
            }

            $client->setDefer(false);
        }
    }

    /**
     * Hapus file dari Drive.
     */
    public function delete(string $fileId): void
    {
        if ($fileId === '') {
            return;
        }

        try {
            $this->drive()
                ->files
                ->delete($fileId);

        } catch (Throwable $e) {

            /*
             * Kalau sudah terhapus di Drive,
             * tidak perlu membuat aplikasi gagal.
             */
            if ((int) $e->getCode() === 404) {
                return;
            }

            throw $e;
        }
    }

    /**
     * Ambil gambar private dari Drive.
     *
     * Nanti dipakai oleh route:
     * /media/drive/{fileId}
     */
    public function download(
        string $fileId
    ): HttpResponse {

        $client = $this->client();

        $token = $client->getAccessToken();

        $accessToken =
            $token['access_token']
            ?? null;

        if (!$accessToken) {
            throw new RuntimeException(
                'Google Drive access token tidak tersedia.'
            );
        }

        return Http::withToken(
            $accessToken
        )
            ->timeout(120)
            ->withOptions([
                'stream' => true,
            ])
            ->get(
                'https://www.googleapis.com/drive/v3/files/'
                . rawurlencode($fileId),
                [
                    'alt' => 'media',
                ]
            );
    }

    private function drive(): Drive
    {
        if ($this->drive === null) {
            $this->drive = new Drive(
                $this->client()
            );
        }

        return $this->drive;
    }

    private function client(): Client
    {
        if ($this->client !== null) {
            return $this->client;
        }

        $credentialsPath =
            config(
                'services.google_drive.credentials_path'
            );

        if (
            !$credentialsPath
            || !is_file($credentialsPath)
        ) {
            throw new RuntimeException(
                'google-drive-client-secret.json tidak ditemukan.'
            );
        }

        $token =
            $this->state['token']
            ?? null;

        if (
            !is_array($token)
            || empty($token['refresh_token'])
        ) {
            throw new RuntimeException(
                'Refresh token Google Drive tidak ditemukan.'
            );
        }

        $client = new Client();

        $client->setAuthConfig(
            $credentialsPath
        );

        $client->setScopes([
            Drive::DRIVE_FILE,
        ]);

        $client->setAccessType(
            'offline'
        );

        $client->setAccessToken(
            $token
        );

        /*
         * Access token Google hanya sementara.
         * Kalau expired, buat access token baru
         * memakai refresh_token.
         */
        if ($client->isAccessTokenExpired()) {

            $refreshToken =
                $token['refresh_token'];

            $newToken =
                $client
                    ->fetchAccessTokenWithRefreshToken(
                        $refreshToken
                    );

            if (isset($newToken['error'])) {
                throw new RuntimeException(
                    'Refresh Google Drive token gagal: '
                    . (
                        $newToken['error_description']
                        ?? $newToken['error']
                    )
                );
            }

            /*
             * Response refresh biasanya tidak
             * membawa refresh_token baru.
             */
            $newToken['refresh_token'] =
                $refreshToken;

            $client->setAccessToken(
                $newToken
            );

            $this->state['token'] =
                $newToken;

            $this->saveState();
        }

        $this->client = $client;

        return $client;
    }

    /**
     * Mendukung dua format.
     *
     * Format token yang sekarang Anda punya:
     *
     * {
     *   "access_token": "...",
     *   "refresh_token": "..."
     * }
     *
     * Akan otomatis diubah menjadi:
     *
     * {
     *   "token": {...},
     *   "folder_id": "..."
     * }
     */
    private function loadState(): array
    {
        $tokenPath =
            config(
                'services.google_drive.token_path'
            );

        if (
            !$tokenPath
            || !is_file($tokenPath)
        ) {
            return [];
        }

        $decoded =
            json_decode(
                file_get_contents($tokenPath),
                true
            );

        if (!is_array($decoded)) {
            throw new RuntimeException(
                'google-drive-token.json bukan JSON valid.'
            );
        }

        /*
         * Format baru.
         */
        if (
            isset($decoded['token'])
            && is_array($decoded['token'])
        ) {
            return $decoded;
        }

        /*
         * Format token lama/raw yang baru saja
         * kita buat lewat callback.php.
         */
        if (
            isset($decoded['access_token'])
            || isset($decoded['refresh_token'])
        ) {
            return [
                'token' => $decoded,
                'folder_id' => null,
            ];
        }

        throw new RuntimeException(
            'Format google-drive-token.json tidak dikenali.'
        );
    }

    private function saveState(): void
    {
        $tokenPath =
            config(
                'services.google_drive.token_path'
            );

        $directory =
            dirname($tokenPath);

        if (!is_dir($directory)) {
            mkdir(
                $directory,
                0700,
                true
            );
        }

        $json =
            json_encode(
                $this->state,
                JSON_PRETTY_PRINT
                | JSON_UNESCAPED_SLASHES
            );

        if ($json === false) {
            throw new RuntimeException(
                'Gagal encode token Google Drive.'
            );
        }

        if (
            file_put_contents(
                $tokenPath,
                $json . PHP_EOL,
                LOCK_EX
            ) === false
        ) {
            throw new RuntimeException(
                'Gagal menyimpan token Google Drive.'
            );
        }
    }
}