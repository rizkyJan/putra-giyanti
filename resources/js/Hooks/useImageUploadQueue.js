import { useEffect, useMemo, useRef, useState } from "react";

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

function makeId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fileKey(file) {
    return [file.name, file.size, file.lastModified].join("-");
}

function isImage(file) {
    if (!file) {
        return false;
    }

    if (typeof file.type === "string" && file.type.startsWith("image/")) {
        return true;
    }

    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name || "");
}

/*
 * ======================================================
 * CSRF
 * ======================================================
 */
function getCsrfData() {
    const meta = document.querySelector('meta[name="csrf-token"]');

    if (meta && meta.content) {
        return {
            type: "meta",
            token: meta.content,
        };
    }

    const cookieRows = document.cookie ? document.cookie.split("; ") : [];

    const xsrfCookie = cookieRows.find((row) => row.startsWith("XSRF-TOKEN="));

    if (xsrfCookie) {
        try {
            return {
                type: "cookie",

                token: decodeURIComponent(
                    xsrfCookie.split("=").slice(1).join("="),
                ),
            };
        } catch {
            return null;
        }
    }

    return null;
}

/*
 * ======================================================
 * RESPONSE PARSER
 * ======================================================
 *
 * Jangan gunakan:
 *
 * xhr.responseType = "json"
 *
 * agar lebih kompatibel dengan Safari/iPhone.
 */
function parseJsonResponse(xhr) {
    const text = typeof xhr.responseText === "string" ? xhr.responseText : "";

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function extractError(response, fallback = "Terjadi kesalahan saat upload.") {
    if (!response) {
        return fallback;
    }

    if (typeof response.message === "string" && response.message) {
        return response.message;
    }

    if (response.errors && typeof response.errors === "object") {
        const values = Object.values(response.errors);

        for (const value of values) {
            if (Array.isArray(value) && value.length > 0) {
                return value[0];
            }

            if (typeof value === "string" && value) {
                return value;
            }
        }
    }

    return fallback;
}

/*
 * ======================================================
 * UPLOAD SATU FOTO
 * ======================================================
 *
 * Browser
 *   ↓
 * Laravel / Ubuntu
 *   ↓
 * Google Drive
 *   ↓
 * response JSON
 *
 * Promise baru resolve kalau Google Drive
 * sudah benar-benar selesai.
 */
function uploadSingleImage(file, onProgress) {
    return new Promise((resolve, reject) => {
        let xhr;

        try {
            xhr = new XMLHttpRequest();

            xhr.open("POST", route("admin.posts.images.upload"), true);

            /*
             * PENTING:
             *
             * Jangan:
             *
             * xhr.responseType = "json";
             *
             * Safari tertentu bisa bermasalah.
             * Kita JSON.parse(responseText)
             * secara manual.
             */

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

            /*
             * ==================================
             * PROGRESS BROWSER -> SERVER
             * ==================================
             */
            if (xhr.upload) {
                xhr.upload.onprogress = (event) => {
                    if (!event.lengthComputable || !event.total) {
                        return;
                    }

                    const percentage = Math.min(
                        100,
                        Math.max(
                            0,
                            Math.round((event.loaded / event.total) * 100),
                        ),
                    );

                    if (typeof onProgress === "function") {
                        onProgress(percentage);
                    }
                };
            }

            /*
             * ==================================
             * SERVER RESPONSE
             * ==================================
             */
            xhr.onload = () => {
                const response = parseJsonResponse(xhr);

                if (xhr.status >= 200 && xhr.status < 300 && response?.stored) {
                    resolve(response);

                    return;
                }

                /*
                 * Session / login habis.
                 */
                if (xhr.status === 401) {
                    reject(
                        new Error(
                            "Sesi login sudah berakhir. Silakan login kembali.",
                        ),
                    );

                    return;
                }

                /*
                 * CSRF / session.
                 */
                if (xhr.status === 419) {
                    reject(
                        new Error(
                            "Sesi keamanan sudah berakhir. Refresh halaman lalu coba lagi.",
                        ),
                    );

                    return;
                }

                /*
                 * File terlalu besar di Nginx.
                 */
                if (xhr.status === 413) {
                    reject(
                        new Error("Ukuran gambar terlalu besar untuk server."),
                    );

                    return;
                }

                /*
                 * Validasi Laravel.
                 */
                if (xhr.status === 422) {
                    reject(
                        new Error(
                            extractError(
                                response,
                                "Gambar tidak lolos validasi.",
                            ),
                        ),
                    );

                    return;
                }

                reject(
                    new Error(
                        extractError(
                            response,
                            `Upload gagal. Server mengembalikan HTTP ${xhr.status}.`,
                        ),
                    ),
                );
            };

            /*
             * Network error.
             */
            xhr.onerror = () => {
                reject(
                    new Error(
                        "Koneksi ke server terputus. Periksa internet lalu tekan Coba Lagi.",
                    ),
                );
            };

            /*
             * Timeout.
             */
            xhr.ontimeout = () => {
                reject(
                    new Error(
                        "Upload terlalu lama dan melewati batas waktu. Tekan Coba Lagi untuk melanjutkan.",
                    ),
                );
            };

            /*
             * Request dibatalkan.
             */
            xhr.onabort = () => {
                reject(new Error("Upload dibatalkan."));
            };

            /*
             * ==================================
             * FORM DATA
             * ==================================
             */
            const formData = new FormData();

            formData.append("image", file, file.name);

            /*
             * Tambahkan _token juga sebagai
             * fallback selain header.
             */
            if (csrf?.type === "meta") {
                formData.append("_token", csrf.token);
            }

            /*
             * Jangan set Content-Type manual.
             *
             * Browser harus membuat
             * multipart boundary sendiri.
             */
            xhr.send(formData);
        } catch (error) {
            console.error("XHR initialization error:", error);

            reject(
                new Error(
                    error?.message ||
                        "Browser tidak dapat memulai proses upload.",
                ),
            );
        }
    });
}

/*
 * ======================================================
 * HAPUS TEMPORARY UPLOAD
 * ======================================================
 */
function deleteTemporaryUpload(stored) {
    return new Promise((resolve, reject) => {
        let xhr;

        try {
            xhr = new XMLHttpRequest();

            xhr.open("POST", route("admin.posts.images.delete-temp"), true);

            /*
             * Sama:
             * jangan pakai responseType json.
             */

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
                const response = parseJsonResponse(xhr);

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(response);

                    return;
                }

                reject(
                    new Error(
                        extractError(
                            response,
                            `Gagal menghapus temporary upload. HTTP ${xhr.status}.`,
                        ),
                    ),
                );
            };

            xhr.onerror = () => {
                reject(
                    new Error(
                        "Koneksi terputus saat menghapus temporary upload.",
                    ),
                );
            };

            xhr.ontimeout = () => {
                reject(
                    new Error(
                        "Proses menghapus temporary upload terlalu lama.",
                    ),
                );
            };

            const formData = new FormData();

            formData.append("stored", stored);

            if (csrf?.type === "meta") {
                formData.append("_token", csrf.token);
            }

            xhr.send(formData);
        } catch (error) {
            console.error("Delete temporary XHR error:", error);

            reject(
                new Error(
                    error?.message ||
                        "Browser gagal menghapus temporary upload.",
                ),
            );
        }
    });
}

/*
 * ======================================================
 * QUEUE HOOK
 * ======================================================
 */
export default function useImageUploadQueue() {
    const [items, setItems] = useState([]);

    /*
     * itemsRef diperlukan karena queue berjalan
     * asynchronous.
     */
    const itemsRef = useRef([]);

    /*
     * Sinkronkan state + ref.
     */
    const commitItems = (updater) => {
        setItems((previous) => {
            const next =
                typeof updater === "function" ? updater(previous) : updater;

            itemsRef.current = next;

            return next;
        });
    };

    /*
     * Cleanup object URLs ketika component
     * benar-benar hilang.
     */
    useEffect(() => {
        return () => {
            itemsRef.current.forEach((item) => {
                if (item.preview) {
                    try {
                        URL.revokeObjectURL(item.preview);
                    } catch {
                        // Tidak perlu menggagalkan app.
                    }
                }
            });
        };
    }, []);

    /*
     * Buat item queue.
     */
    const createItem = (file) => ({
        id: makeId(),

        key: fileKey(file),

        file,

        preview: URL.createObjectURL(file),

        /*
         * queued
         * uploading
         * done
         * error
         */
        status: "queued",

        progress: 0,

        stored: null,

        url: null,

        error: null,
    });

    /*
     * ==================================================
     * TAMBAH FILE
     * ==================================================
     */
    const addFiles = (rawFiles) => {
        const selectedFiles = Array.from(rawFiles || []);

        const existingKeys = new Set(itemsRef.current.map((item) => item.key));

        const added = [];

        const rejected = [];

        selectedFiles.forEach((file) => {
            if (!isImage(file)) {
                rejected.push(`${file.name}: bukan file gambar`);

                return;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                rejected.push(`${file.name}: lebih dari 50 MB`);

                return;
            }

            const key = fileKey(file);

            if (existingKeys.has(key)) {
                rejected.push(`${file.name}: sudah dipilih`);

                return;
            }

            existingKeys.add(key);

            try {
                added.push(createItem(file));
            } catch (error) {
                /*
                 * Kalau browser gagal membuat
                 * object URL, jangan sampai
                 * seluruh upload mati.
                 */
                console.error("Preview error:", error);

                added.push({
                    id: makeId(),

                    key,

                    file,

                    preview: null,

                    status: "queued",

                    progress: 0,

                    stored: null,

                    url: null,

                    error: null,
                });
            }
        });

        if (added.length > 0) {
            commitItems((previous) => [...previous, ...added]);
        }

        return {
            added: added.length,

            rejected,
        };
    };

    /*
     * Informasi hanya satu gambar.
     */
    const replaceSingleFile = async (file) => {
        await clearAll();

        return addFiles([file]);
    };

    /*
     * ==================================================
     * REMOVE SATU FOTO
     * ==================================================
     */
    const removeItem = async (id) => {
        const item = itemsRef.current.find((row) => row.id === id);

        if (!item) {
            return;
        }

        if (item.status === "uploading") {
            throw new Error("Foto sedang diproses dan belum bisa dihapus.");
        }

        /*
         * Kalau sudah berhasil ke Drive
         * tetapi belum menjadi post,
         * hapus temporary Drive-nya.
         */
        if (item.stored) {
            await deleteTemporaryUpload(item.stored);
        }

        if (item.preview) {
            try {
                URL.revokeObjectURL(item.preview);
            } catch {
                // Abaikan.
            }
        }

        commitItems((previous) => previous.filter((row) => row.id !== id));
    };

    /*
     * ==================================================
     * CLEAR ALL
     * ==================================================
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
                    try {
                        URL.revokeObjectURL(item.preview);
                    } catch {
                        // Abaikan.
                    }
                }

                commitItems((previous) =>
                    previous.filter((row) => row.id !== item.id),
                );
            } catch (error) {
                errors.push(error?.message || "Gagal membersihkan file.");
            }
        }

        if (errors.length > 0) {
            throw new Error(errors[0]);
        }
    };

    /*
     * Update item.
     */
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

    /*
     * ==================================================
     * QUEUE
     * ==================================================
     *
     * SATU FOTO PER REQUEST.
     */
    const uploadAll = async () => {
        /*
         * Ambil snapshot terbaru.
         */
        const working = itemsRef.current.map((item) => ({
            ...item,
        }));

        for (let index = 0; index < working.length; index += 1) {
            const item = working[index];

            /*
             * Kalau sudah berhasil pada
             * percobaan sebelumnya,
             * skip.
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

                item.error = null;

                updateItem(item.id, {
                    status: "done",

                    progress: 100,

                    stored: response.stored,

                    url: response.url,

                    error: null,
                });
            } catch (error) {
                console.error("Upload queue item error:", error);

                item.status = "error";

                item.error = error?.message || "Upload gagal.";

                updateItem(item.id, {
                    status: "error",

                    error: item.error,
                });

                /*
                 * STOP di foto gagal.
                 *
                 * Retry nanti melanjutkan
                 * dari sini.
                 */
                throw new Error(`${item.file.name}: ${item.error}`);
            }
        }

        /*
         * Jangan gunakan working saja,
         * ambil state/ref yang paling baru.
         */
        return itemsRef.current
            .filter((item) => item.status === "done" && item.stored)
            .map((item) => ({
                ...item,
            }));
    };

    /*
     * ==================================================
     * STATS
     * ==================================================
     */
    const stats = useMemo(() => {
        const total = items.length;

        const completed = items.filter((item) => item.status === "done").length;

        const currentIndex = items.findIndex(
            (item) => item.status === "uploading" || item.status === "error",
        );

        const current = currentIndex >= 0 ? items[currentIndex] : null;

        /*
         * Progress keseluruhan dihitung
         * berdasarkan jumlah FOTO yang
         * benar-benar selesai ke Drive.
         *
         * Bukan berdasarkan byte palsu.
         */
        const overallPercentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,

            completed,

            remaining: Math.max(0, total - completed),

            current,

            currentNumber:
                currentIndex >= 0
                    ? currentIndex + 1
                    : Math.min(completed + 1, total),

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
