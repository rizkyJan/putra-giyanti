import { useEffect, useMemo, useRef, useState } from "react";

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/*
 * =============================================
 * HELPERS
 * =============================================
 */

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

function getCsrfData() {
    const meta = document.querySelector('meta[name="csrf-token"]');

    if (meta?.content) {
        return {
            type: "meta",
            token: meta.content,
        };
    }

    const rows = document.cookie ? document.cookie.split("; ") : [];

    const cookie = rows.find((row) => row.startsWith("XSRF-TOKEN="));

    if (!cookie) {
        return null;
    }

    try {
        return {
            type: "cookie",

            token: decodeURIComponent(cookie.split("=").slice(1).join("=")),
        };
    } catch {
        return null;
    }
}

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
        for (const value of Object.values(response.errors)) {
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
 * =============================================
 * UPLOAD SATU FOTO
 * =============================================
 */

function uploadSingleImage(file, onProgress) {
    return new Promise((resolve, reject) => {
        let xhr;

        try {
            xhr = new XMLHttpRequest();

            xhr.open("POST", route("admin.posts.images.upload"), true);

            /*
             * Jangan gunakan:
             *
             * xhr.responseType = "json"
             *
             * Supaya lebih aman di Safari/iPhone.
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
             * Browser -> Ubuntu.
             */
            if (xhr.upload) {
                xhr.upload.onprogress = (event) => {
                    if (!event.lengthComputable || !event.total) {
                        return;
                    }

                    const percentage = Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round((event.loaded / event.total) * 100),
                        ),
                    );

                    onProgress?.(percentage);
                };
            }

            /*
             * Response ini baru datang setelah:
             *
             * Browser -> Ubuntu
             * Ubuntu -> Google Drive
             *
             * selesai.
             */
            xhr.onload = () => {
                const response = parseJsonResponse(xhr);

                if (xhr.status >= 200 && xhr.status < 300 && response?.stored) {
                    resolve(response);
                    return;
                }

                if (xhr.status === 401) {
                    reject(
                        new Error(
                            "Sesi login sudah berakhir. Silakan login kembali.",
                        ),
                    );

                    return;
                }

                if (xhr.status === 419) {
                    reject(
                        new Error(
                            "Sesi keamanan sudah berakhir. Refresh halaman lalu coba lagi.",
                        ),
                    );

                    return;
                }

                if (xhr.status === 413) {
                    reject(
                        new Error("Ukuran gambar terlalu besar untuk server."),
                    );

                    return;
                }

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
                            `Upload gagal. HTTP ${xhr.status}.`,
                        ),
                    ),
                );
            };

            xhr.onerror = () => {
                reject(
                    new Error(
                        "Koneksi terputus. Periksa internet lalu tekan Coba Lagi.",
                    ),
                );
            };

            xhr.ontimeout = () => {
                reject(
                    new Error(
                        "Upload terlalu lama. Tekan Coba Lagi untuk melanjutkan.",
                    ),
                );
            };

            xhr.onabort = () => {
                reject(new Error("Upload dibatalkan."));
            };

            const formData = new FormData();

            formData.append("image", file, file.name);

            if (csrf?.type === "meta") {
                formData.append("_token", csrf.token);
            }

            /*
             * JANGAN set Content-Type manual.
             */
            xhr.send(formData);
        } catch (error) {
            reject(
                new Error(error?.message || "Browser gagal memulai upload."),
            );
        }
    });
}

/*
 * =============================================
 * HAPUS TEMPORARY DRIVE
 * =============================================
 */

function deleteTemporaryUpload(stored) {
    return new Promise((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();

            xhr.open("POST", route("admin.posts.images.delete-temp"), true);

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

            const formData = new FormData();

            formData.append("stored", stored);

            if (csrf?.type === "meta") {
                formData.append("_token", csrf.token);
            }

            xhr.send(formData);
        } catch (error) {
            reject(
                new Error(
                    error?.message || "Gagal menghapus temporary upload.",
                ),
            );
        }
    });
}

/*
 * =============================================
 * HOOK
 * =============================================
 */

export default function useImageUploadQueue() {
    const [items, setItems] = useState([]);

    /*
     * Ini sekarang menjadi SOURCE OF TRUTH.
     */
    const itemsRef = useRef([]);

    /*
     * =========================================
     * UPDATE STATE SYNCHRONOUS
     * =========================================
     *
     * INI PERBAIKAN UTAMANYA.
     *
     * Dulu itemsRef diubah di callback setItems.
     * Itu bisa terlambat.
     *
     * Sekarang:
     *
     * 1. hitung next
     * 2. ubah itemsRef LANGSUNG
     * 3. baru render React
     */
    const replaceItems = (next) => {
        itemsRef.current = next;

        setItems(next);
    };

    const mutateItems = (updater) => {
        const previous = itemsRef.current;

        const next = updater(previous);

        itemsRef.current = next;

        setItems(next);

        return next;
    };

    const updateItem = (id, patch) => {
        return mutateItems((previous) =>
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
     * Cleanup preview.
     */
    useEffect(() => {
        return () => {
            itemsRef.current.forEach((item) => {
                if (item.preview) {
                    try {
                        URL.revokeObjectURL(item.preview);
                    } catch {
                        //
                    }
                }
            });
        };
    }, []);

    const createItem = (file) => {
        let preview = null;

        try {
            preview = URL.createObjectURL(file);
        } catch {
            preview = null;
        }

        return {
            id: makeId(),

            key: fileKey(file),

            file,

            preview,

            status: "queued",

            progress: 0,

            stored: null,

            url: null,

            error: null,
        };
    };

    /*
     * =========================================
     * ADD FILE
     * =========================================
     */
    const addFiles = (rawFiles) => {
        const selected = Array.from(rawFiles || []);

        const existingKeys = new Set(itemsRef.current.map((item) => item.key));

        const added = [];

        const rejected = [];

        for (const file of selected) {
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
            mutateItems((previous) => [...previous, ...added]);
        }

        return {
            added: added.length,

            rejected,
        };
    };

    /*
     * Informasi = satu gambar.
     */
    const replaceSingleFile = async (file) => {
        await clearAll();

        return addFiles([file]);
    };

    /*
     * =========================================
     * REMOVE
     * =========================================
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
            try {
                URL.revokeObjectURL(item.preview);
            } catch {
                //
            }
        }

        mutateItems((previous) => previous.filter((row) => row.id !== id));
    };

    /*
     * =========================================
     * CLEAR ALL
     * =========================================
     */
    const clearAll = async () => {
        const snapshot = [...itemsRef.current];

        for (const item of snapshot) {
            if (item.status === "uploading") {
                throw new Error("Upload sedang berjalan.");
            }

            if (item.stored) {
                await deleteTemporaryUpload(item.stored);
            }

            if (item.preview) {
                try {
                    URL.revokeObjectURL(item.preview);
                } catch {
                    //
                }
            }
        }

        replaceItems([]);
    };

    /*
     * =========================================
     * UPLOAD QUEUE
     * =========================================
     */
    const uploadAll = async () => {
        /*
         * Jangan pakai snapshot untuk
         * hasil akhir.
         *
         * Setiap iterasi selalu ambil
         * itemsRef.current terbaru.
         */

        const totalAtStart = itemsRef.current.length;

        for (let index = 0; index < totalAtStart; index += 1) {
            /*
             * Selalu ambil data terbaru.
             */
            let item = itemsRef.current[index];

            if (!item) {
                throw new Error(`Data foto ke-${index + 1} tidak ditemukan.`);
            }

            /*
             * Sudah selesai dari percobaan
             * sebelumnya -> jangan upload ulang.
             */
            if (item.status === "done" && item.stored) {
                continue;
            }

            /*
             * Mulai.
             */
            updateItem(item.id, {
                status: "uploading",

                progress: 0,

                error: null,
            });

            try {
                const response = await uploadSingleImage(
                    item.file,

                    (percentage) => {
                        /*
                         * Update progress synchronous.
                         */
                        updateItem(item.id, {
                            progress: percentage,
                        });
                    },
                );

                /*
                 * Google Drive benar-benar
                 * sudah selesai.
                 */
                updateItem(item.id, {
                    status: "done",

                    progress: 100,

                    stored: response.stored,

                    url: response.url,

                    error: null,
                });
            } catch (error) {
                const message = error?.message || "Upload gagal.";

                updateItem(item.id, {
                    status: "error",

                    error: message,
                });

                /*
                 * STOP.
                 *
                 * Jangan simpan post dalam
                 * keadaan sebagian.
                 */
                throw new Error(`${item.file.name}: ${message}`);
            }
        }

        /*
         * =====================================
         * HARD VALIDATION
         * =====================================
         *
         * Jangan pernah final-save jika
         * jumlah hasil Drive tidak sama
         * dengan jumlah foto queue.
         */
        const latest = itemsRef.current;

        const completed = latest.filter(
            (item) => item.status === "done" && item.stored,
        );

        if (completed.length !== latest.length) {
            throw new Error(
                `Upload belum lengkap. ` +
                    `${completed.length} dari ` +
                    `${latest.length} foto berhasil. ` +
                    `Tekan Coba Lagi untuk melanjutkan.`,
            );
        }

        /*
         * Kembalikan copy terbaru.
         */
        return completed.map((item) => ({
            ...item,
        }));
    };

    /*
     * =========================================
     * STATISTIK
     * =========================================
     */
    const stats = useMemo(() => {
        const total = items.length;

        const completed = items.filter(
            (item) => item.status === "done" && item.stored,
        ).length;

        const remaining = Math.max(0, total - completed);

        const currentIndex = items.findIndex(
            (item) => item.status === "uploading" || item.status === "error",
        );

        const current = currentIndex >= 0 ? items[currentIndex] : null;

        const overallPercentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,

            completed,

            /*
             * Sekarang ini PASTI:
             *
             * total - completed.
             */
            remaining,

            current,

            currentNumber:
                currentIndex >= 0
                    ? currentIndex + 1
                    : completed < total
                      ? completed + 1
                      : total,

            currentProgress: current ? Number(current.progress || 0) : 0,

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
