import { useEffect, useMemo, useRef, useState } from "react";

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/**
 * ID lokal untuk setiap file.
 */
function makeId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Identitas file untuk mencegah
 * file sama masuk dua kali.
 */
function fileKey(file) {
    return [file.name, file.size, file.lastModified].join("-");
}

function isImage(file) {
    if (file.type && file.type.startsWith("image/")) {
        return true;
    }

    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name || "");
}

/**
 * Ambil CSRF Laravel.
 */
function getCsrfData() {
    const meta = document.querySelector('meta[name="csrf-token"]');

    if (meta?.content) {
        return {
            type: "meta",
            token: meta.content,
        };
    }

    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));

    if (cookie) {
        return {
            type: "cookie",

            token: decodeURIComponent(cookie.split("=").slice(1).join("=")),
        };
    }

    return null;
}

function extractError(response) {
    if (!response) {
        return "Terjadi kesalahan saat upload.";
    }

    if (response.message) {
        return response.message;
    }

    if (response.errors) {
        const firstError = Object.values(response.errors).flat().find(Boolean);

        if (firstError) {
            return firstError;
        }
    }

    return "Terjadi kesalahan saat upload.";
}

/**
 * Upload SATU gambar.
 *
 * Promise baru resolve ketika:
 *
 * browser -> Ubuntu selesai
 * DAN
 * Ubuntu -> Google Drive selesai.
 */
function uploadSingleImage(file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", route("admin.posts.images.upload"));

        xhr.responseType = "json";

        xhr.timeout = 10 * 60 * 1000;

        xhr.setRequestHeader("Accept", "application/json");

        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        const csrf = getCsrfData();

        if (csrf?.type === "meta") {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrf.token);
        }

        if (csrf?.type === "cookie") {
            xhr.setRequestHeader("X-XSRF-TOKEN", csrf.token);
        }

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) {
                return;
            }

            const percentage = Math.round((event.loaded / event.total) * 100);

            onProgress?.(percentage);
        };

        xhr.onload = () => {
            let response = xhr.response;

            if (!response && xhr.responseText) {
                try {
                    response = JSON.parse(xhr.responseText);
                } catch {
                    response = null;
                }
            }

            if (xhr.status >= 200 && xhr.status < 300 && response?.stored) {
                resolve(response);
                return;
            }

            reject(new Error(extractError(response)));
        };

        xhr.onerror = () => {
            reject(new Error("Koneksi terputus saat mengunggah gambar."));
        };

        xhr.ontimeout = () => {
            reject(new Error("Upload terlalu lama dan melewati batas waktu."));
        };

        const formData = new FormData();

        formData.append("image", file);

        if (csrf?.type === "meta") {
            formData.append("_token", csrf.token);
        }

        xhr.send(formData);
    });
}

/**
 * Hapus temporary upload dari Drive.
 */
function deleteTemporaryUpload(stored) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", route("admin.posts.images.delete-temp"));

        xhr.responseType = "json";

        xhr.timeout = 120000;

        xhr.setRequestHeader("Accept", "application/json");

        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        const csrf = getCsrfData();

        if (csrf?.type === "meta") {
            xhr.setRequestHeader("X-CSRF-TOKEN", csrf.token);
        }

        if (csrf?.type === "cookie") {
            xhr.setRequestHeader("X-XSRF-TOKEN", csrf.token);
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
                return;
            }

            reject(new Error(extractError(xhr.response)));
        };

        xhr.onerror = () => {
            reject(new Error("Gagal menghapus temporary upload."));
        };

        const formData = new FormData();

        formData.append("stored", stored);

        if (csrf?.type === "meta") {
            formData.append("_token", csrf.token);
        }

        xhr.send(formData);
    });
}

export default function useImageUploadQueue() {
    const [items, setItems] = useState([]);

    const itemsRef = useRef([]);

    /**
     * State dan ref selalu sinkron.
     */
    const commitItems = (updater) => {
        setItems((previous) => {
            const next =
                typeof updater === "function" ? updater(previous) : updater;

            itemsRef.current = next;

            return next;
        });
    };

    /**
     * Bersihkan preview ketika
     * component di-unmount.
     *
     * File Drive TIDAK dihapus di sini
     * karena mungkin sudah menjadi bagian
     * dari post yang sukses disimpan.
     */
    useEffect(() => {
        return () => {
            itemsRef.current.forEach((item) => {
                if (item.preview) {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, []);

    const createItem = (file) => ({
        id: makeId(),

        key: fileKey(file),

        file,

        preview: URL.createObjectURL(file),

        status: "queued",

        /*
         * queued
         * uploading
         * done
         * error
         */

        progress: 0,

        stored: null,

        url: null,

        error: null,
    });

    /**
     * Tambahkan banyak file.
     *
     * File baru DITAMBAHKAN,
     * bukan mengganti pilihan sebelumnya.
     */
    const addFiles = (rawFiles) => {
        const selectedFiles = Array.from(rawFiles || []);

        const existingKeys = new Set(itemsRef.current.map((item) => item.key));

        const added = [];

        const rejected = [];

        for (const file of selectedFiles) {
            if (!isImage(file)) {
                rejected.push(`${file.name}: bukan gambar`);

                continue;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                rejected.push(`${file.name}: lebih dari 50 MB`);

                continue;
            }

            const key = fileKey(file);

            if (existingKeys.has(key)) {
                rejected.push(`${file.name}: sudah dipilih`);

                continue;
            }

            existingKeys.add(key);

            added.push(createItem(file));
        }

        if (added.length > 0) {
            commitItems((previous) => [...previous, ...added]);
        }

        return {
            added: added.length,

            rejected,
        };
    };

    /**
     * Untuk Informasi:
     * hanya boleh satu gambar.
     */
    const replaceSingleFile = async (file) => {
        await clearAll();

        return addFiles([file]);
    };

    /**
     * Hapus satu item queue.
     *
     * Kalau item SUDAH masuk Drive,
     * hapus juga temporary file Drive.
     */
    const removeItem = async (id) => {
        const item = itemsRef.current.find((row) => row.id === id);

        if (!item) {
            return;
        }

        if (item.status === "uploading") {
            throw new Error("Foto sedang di-upload dan belum bisa dihapus.");
        }

        if (item.stored) {
            await deleteTemporaryUpload(item.stored);
        }

        if (item.preview) {
            URL.revokeObjectURL(item.preview);
        }

        commitItems((previous) => previous.filter((row) => row.id !== id));
    };

    /**
     * Kosongkan seluruh queue.
     */
    const clearAll = async () => {
        const snapshot = [...itemsRef.current];

        const errors = [];

        for (const item of snapshot) {
            try {
                if (item.stored) {
                    await deleteTemporaryUpload(item.stored);
                }

                if (item.preview) {
                    URL.revokeObjectURL(item.preview);
                }

                commitItems((previous) =>
                    previous.filter((row) => row.id !== item.id),
                );
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors[0]);
        }
    };

    const updateItem = (id, patch) => {
        commitItems((previous) =>
            previous.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          ...patch,
                      }
                    : item,
            ),
        );
    };

    /**
     * =====================================================
     * QUEUE UPLOAD
     * =====================================================
     *
     * SATU FOTO PER REQUEST.
     *
     * Foto yang statusnya DONE dilewati.
     *
     * Jadi bila:
     *
     * 31 foto sukses
     * foto 32 gagal
     *
     * klik Coba Lagi:
     *
     * mulai lagi dari foto 32.
     */
    const uploadAll = async () => {
        const working = itemsRef.current.map((item) => ({
            ...item,
        }));

        for (let index = 0; index < working.length; index += 1) {
            const item = working[index];

            /*
             * Sudah berhasil pada percobaan
             * sebelumnya.
             *
             * Jangan upload ulang.
             */
            if (item.status === "done" && item.stored) {
                continue;
            }

            item.status = "uploading";

            item.progress = 0;

            item.error = null;

            updateItem(item.id, {
                status: "uploading",

                progress: 0,

                error: null,
            });

            try {
                const response = await uploadSingleImage(
                    item.file,

                    (percentage) => {
                        item.progress = percentage;

                        updateItem(item.id, {
                            progress: percentage,
                        });
                    },
                );

                item.status = "done";

                item.progress = 100;

                item.stored = response.stored;

                item.url = response.url;

                updateItem(item.id, {
                    status: "done",

                    progress: 100,

                    stored: response.stored,

                    url: response.url,

                    error: null,
                });
            } catch (error) {
                item.status = "error";

                item.error = error.message;

                updateItem(item.id, {
                    status: "error",

                    error: error.message,
                });

                /*
                 * STOP.
                 *
                 * Foto berikutnya belum
                 * mulai sampai user Retry.
                 */
                throw new Error(`${item.file.name}: ${error.message}`);
            }
        }

        /*
         * Kembalikan daftar yang sudah
         * benar-benar berhasil masuk Drive.
         */
        return working
            .filter((item) => item.status === "done" && item.stored)
            .map((item) => ({
                ...item,
            }));
    };

    /**
     * Statistik real-time.
     */
    const stats = useMemo(() => {
        const total = items.length;

        const completed = items.filter((item) => item.status === "done").length;

        const currentIndex = items.findIndex(
            (item) => item.status === "uploading" || item.status === "error",
        );

        const current = currentIndex >= 0 ? items[currentIndex] : null;

        const overallPercentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,

            completed,

            remaining: Math.max(0, total - completed),

            current,

            currentNumber: currentIndex >= 0 ? currentIndex + 1 : completed,

            currentProgress: current?.progress || 0,

            overallPercentage,
        };
    }, [items]);

    return {
        items,

        total: items.length,

        stats,

        addFiles,

        replaceSingleFile,

        removeItem,

        clearAll,

        uploadAll,
    };
}
