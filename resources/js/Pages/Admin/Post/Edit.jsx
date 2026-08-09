import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

/*
 * 50 MB per gambar.
 *
 * Ini hanya validasi frontend untuk UX.
 * Backend Laravel tetap menjadi validasi utama.
 */
const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/*
 * Digunakan untuk mendeteksi file yang sama
 * jika user menambah foto beberapa kali.
 */
function fileKey(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

/*
 * Cek sederhana file gambar.
 */
function isImageFile(file) {
    if (file.type?.startsWith("image/")) {
        return true;
    }

    return /\.(jpe?g|png|gif|webp)$/i.test(
        file.name || "",
    );
}

/*
 * Format ukuran file agar enak dibaca.
 */
function formatFileSize(bytes) {
    if (
        !Number.isFinite(bytes) ||
        bytes <= 0
    ) {
        return "0 MB";
    }

    const mb =
        bytes /
        (1024 * 1024);

    if (mb < 1) {
        return `${
            Math.max(
                1,
                Math.round(
                    bytes / 1024,
                ),
            )
        } KB`;
    }

    return `${
        mb.toFixed(
            mb >= 10
                ? 1
                : 2,
        )
    } MB`;
}

/*
 * Icon X.
 */
function XIcon({
    className = "h-4 w-4",
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6 6 18"
            />
        </svg>
    );
}

/*
 * Icon batal/undo.
 */
function UndoIcon({
    className = "h-4 w-4",
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 8 4 12l5 4M5 12h8a6 6 0 0 1 6 6"
            />
        </svg>
    );
}

/*
 * Icon tambah.
 */
function PlusIcon({
    className = "h-5 w-5",
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                d="M12 5v14M5 12h14"
            />
        </svg>
    );
}

export default function Edit({
    auth,
    post: dataPost,
}) {
    /*
     * images
     * =
     * HANYA foto BARU.
     *
     * remove_images
     * =
     * foto LAMA yang dipilih X.
     */
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        _method: "PUT",

        title:
            dataPost.title || "",

        type:
            dataPost.type ||
            "informasi",

        content:
            dataPost.content || "",

        /*
         * Gambar baru Informasi.
         */
        image: null,

        /*
         * Gambar BARU Dokumentasi.
         */
        images: [],

        /*
         * Gambar LAMA yang
         * akan dihapus.
         */
        remove_images: [],

        status:
            dataPost.status ||
            "publish",
    });

    /*
     * Pesan validasi frontend.
     */
    const [
        fileMessage,
        setFileMessage,
    ] = useState("");

    /*
     * ==========================================
     * GALERI LAMA
     * ==========================================
     *
     * images_items berasal dari Post.php.
     *
     * Fallback tetap disediakan supaya aman
     * kalau browser masih membawa cache lama.
     */
    const existingGallery =
        useMemo(
            () => {
                if (
                    Array.isArray(
                        dataPost.images_items,
                    )
                ) {
                    return (
                        dataPost.images_items
                    );
                }

                if (
                    !Array.isArray(
                        dataPost.images,
                    )
                ) {
                    return [];
                }

                return dataPost.images.map(
                    (
                        stored,
                        index,
                    ) => ({
                        stored,

                        url:
                            dataPost
                                .images_urls?.[
                                index
                            ] ?? null,
                    }),
                );
            },
            [dataPost],
        );

    /*
     * ==========================================
     * PREVIEW GAMBAR INFORMASI BARU
     * ==========================================
     */
    const mainImagePreview =
        useMemo(
            () => {
                if (!data.image) {
                    return null;
                }

                return URL.createObjectURL(
                    data.image,
                );
            },
            [data.image],
        );

    /*
     * Bersihkan Object URL dari memory browser.
     */
    useEffect(
        () => {
            return () => {
                if (
                    mainImagePreview
                ) {
                    URL.revokeObjectURL(
                        mainImagePreview,
                    );
                }
            };
        },
        [mainImagePreview],
    );

    /*
     * ==========================================
     * PREVIEW FOTO DOKUMENTASI BARU
     * ==========================================
     */
    const newImagePreviews =
        useMemo(
            () => {
                return (
                    data.images || []
                ).map(
                    (file) => ({
                        file,

                        key:
                            fileKey(
                                file,
                            ),

                        url:
                            URL.createObjectURL(
                                file,
                            ),
                    }),
                );
            },
            [data.images],
        );

    /*
     * Bersihkan URL preview.
     */
    useEffect(
        () => {
            return () => {
                newImagePreviews.forEach(
                    (item) => {
                        URL.revokeObjectURL(
                            item.url,
                        );
                    },
                );
            };
        },
        [newImagePreviews],
    );

    /*
     * Set agar pengecekan foto yang
     * ditandai hapus cepat.
     */
    const removeSet =
        new Set(
            data.remove_images || [],
        );

    /*
     * ==========================================
     * STATISTIK GALERI
     * ==========================================
     */
    const existingCount =
        existingGallery.length;

    const removeCount =
        data.remove_images?.length ||
        0;

    const newCount =
        data.images?.length || 0;

    const finalCount =
        Math.max(
            0,
            existingCount -
                removeCount +
                newCount,
        );

    /*
     * Laravel kadang mengembalikan:
     *
     * images
     *
     * atau:
     *
     * images.0
     * images.1
     */
    const galleryError =
        errors.images ||
        Object.entries(
            errors,
        ).find(
            ([key]) =>
                key.startsWith(
                    "images.",
                ),
        )?.[1];

    /*
     * ==========================================
     * GANTI TIPE POSTINGAN
     * ==========================================
     */
    const handleTypeChange =
        (event) => {
            const nextType =
                event.target.value;

            setData(
                "type",
                nextType,
            );

            /*
             * Reset file yang belum disimpan
             * agar tidak salah terkirim.
             */
            setData(
                "image",
                null,
            );

            setData(
                "images",
                [],
            );

            setData(
                "remove_images",
                [],
            );

            setFileMessage("");
        };

    /*
     * ==========================================
     * PILIH GAMBAR INFORMASI
     * ==========================================
     */
    const handleMainImage =
        (event) => {
            const file =
                event.target
                    .files?.[0] ||
                null;

            if (!file) {
                setData(
                    "image",
                    null,
                );

                return;
            }

            if (
                !isImageFile(
                    file,
                )
            ) {
                setData(
                    "image",
                    null,
                );

                setFileMessage(
                    "File yang dipilih harus berupa gambar.",
                );

                event.target.value =
                    "";

                return;
            }

            if (
                file.size >
                MAX_IMAGE_SIZE
            ) {
                setData(
                    "image",
                    null,
                );

                setFileMessage(
                    `Gambar ${file.name} lebih dari 50 MB dan tidak ditambahkan.`,
                );

                event.target.value =
                    "";

                return;
            }

            setData(
                "image",
                file,
            );

            setFileMessage("");
        };

    /*
     * ==========================================
     * TAMBAH FOTO DOKUMENTASI
     * ==========================================
     *
     * Fungsi ini TIDAK mengganti array.
     *
     * Batch pertama:
     * A B C
     *
     * klik Tambah Foto lagi:
     * D E
     *
     * hasil:
     * A B C D E
     */
    const handleNewGalleryFiles =
        (event) => {
            const selectedFiles =
                Array.from(
                    event.target
                        .files || [],
                );

            /*
             * Kosongkan input DOM.
             *
             * Tujuannya supaya tombol
             * bisa dipakai berkali-kali,
             * termasuk memilih file yang
             * sama lagi setelah di-X.
             */
            event.target.value =
                "";

            if (
                selectedFiles.length ===
                0
            ) {
                return;
            }

            const currentFiles =
                Array.isArray(
                    data.images,
                )
                    ? data.images
                    : [];

            /*
             * Hindari file sama masuk dua kali.
             */
            const currentKeys =
                new Set(
                    currentFiles.map(
                        fileKey,
                    ),
                );

            const acceptedFiles =
                [];

            const rejectedMessages =
                [];

            selectedFiles.forEach(
                (file) => {
                    /*
                     * Bukan gambar.
                     */
                    if (
                        !isImageFile(
                            file,
                        )
                    ) {
                        rejectedMessages.push(
                            `${file.name}: bukan file gambar`,
                        );

                        return;
                    }

                    /*
                     * Lebih dari 50 MB.
                     */
                    if (
                        file.size >
                        MAX_IMAGE_SIZE
                    ) {
                        rejectedMessages.push(
                            `${file.name}: lebih dari 50 MB`,
                        );

                        return;
                    }

                    const key =
                        fileKey(
                            file,
                        );

                    /*
                     * Sudah ada di daftar.
                     */
                    if (
                        currentKeys.has(
                            key,
                        )
                    ) {
                        return;
                    }

                    currentKeys.add(
                        key,
                    );

                    acceptedFiles.push(
                        file,
                    );
                },
            );

            /*
             * TAMBAHKAN ke pilihan lama.
             *
             * Bukan:
             *
             * setData("images", acceptedFiles)
             *
             * tetapi:
             *
             * current + accepted.
             */
            if (
                acceptedFiles.length >
                0
            ) {
                setData(
                    "images",
                    [
                        ...currentFiles,
                        ...acceptedFiles,
                    ],
                );
            }

            /*
             * Pesan jika ada file invalid.
             */
            if (
                rejectedMessages.length >
                0
            ) {
                const preview =
                    rejectedMessages
                        .slice(
                            0,
                            3,
                        )
                        .join(
                            "; ",
                        );

                const suffix =
                    rejectedMessages.length >
                    3
                        ? `; dan ${
                              rejectedMessages.length -
                              3
                          } file lainnya`
                        : "";

                setFileMessage(
                    `Ada file yang dilewati: ${preview}${suffix}.`,
                );
            } else if (
                acceptedFiles.length >
                0
            ) {
                setFileMessage(
                    `${acceptedFiles.length} foto baru ditambahkan ke daftar. `
                    + `Klik Tambah Foto lagi jika masih ada foto lain.`,
                );
            }
        };

    /*
     * ==========================================
     * X FOTO BARU
     * ==========================================
     *
     * Foto belum pernah masuk Drive,
     * jadi cukup dikeluarkan dari array frontend.
     */
    const removeNewImage =
        (indexToRemove) => {
            setData(
                "images",

                data.images.filter(
                    (
                        _,
                        index,
                    ) =>
                        index !==
                        indexToRemove,
                ),
            );
        };

    /*
     * ==========================================
     * X FOTO LAMA
     * ==========================================
     *
     * Belum langsung menghapus Drive.
     *
     * Hanya menambahkan ID/path
     * ke remove_images.
     */
    const toggleRemoveExisting =
        (storedImage) => {
            if (!storedImage) {
                return;
            }

            const current =
                Array.isArray(
                    data.remove_images,
                )
                    ? data.remove_images
                    : [];

            /*
             * Kalau sudah ditandai,
             * klik lagi = batal hapus.
             */
            if (
                current.includes(
                    storedImage,
                )
            ) {
                setData(
                    "remove_images",

                    current.filter(
                        (image) =>
                            image !==
                            storedImage,
                    ),
                );

                return;
            }

            /*
             * Tandai untuk dihapus.
             */
            setData(
                "remove_images",

                [
                    ...current,
                    storedImage,
                ],
            );
        };

    /*
     * ==========================================
     * SUBMIT
     * ==========================================
     */
    const submit =
        (event) => {
            event.preventDefault();

            post(
                route(
                    "admin.posts.update",
                    dataPost.id,
                ),

                {
                    /*
                     * Wajib karena ada File object.
                     */
                    forceFormData: true,

                    preserveScroll: true,
                },
            );
        };

    return (
        <AdminLayout
            user={auth.user}
        >
            <Head
                title={`Edit: ${dataPost.title}`}
            />

            {/* ============================= */}
            {/* HEADER */}
            {/* ============================= */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                        Edit Data
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Tambah foto baru tanpa
                        menghapus galeri lama,
                        atau tandai foto tertentu
                        saja untuk dihapus.
                    </p>
                </div>

                <Link
                    href={route(
                        "admin.posts.index",
                    )}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                    Kembali
                </Link>
            </div>

            {/* ============================= */}
            {/* FORM */}
            {/* ============================= */}
            <div className="max-w-6xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <form
                    onSubmit={submit}
                    className="space-y-7 p-6 sm:p-8"
                >
                    {/* ============================= */}
                    {/* JUDUL */}
                    {/* ============================= */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Judul
                        </label>

                        <input
                            type="text"
                            value={
                                data.title
                            }
                            onChange={(
                                event,
                            ) =>
                                setData(
                                    "title",

                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="w-full rounded-xl border-slate-300 transition-shadow focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                        />

                        {errors.title && (
                            <p className="mt-1 text-sm text-rose-600">
                                {
                                    errors.title
                                }
                            </p>
                        )}
                    </div>

                    {/* ============================= */}
                    {/* TIPE */}
                    {/* ============================= */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Jenis Postingan
                        </label>

                        <select
                            value={
                                data.type
                            }
                            onChange={
                                handleTypeChange
                            }
                            className="w-full rounded-xl border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                        >
                            <option value="informasi">
                                Informasi (1
                                Poster/Gambar)
                            </option>

                            <option value="dokumentasi">
                                Dokumentasi
                                (Banyak Gambar
                                Galeri)
                            </option>
                        </select>

                        {errors.type && (
                            <p className="mt-1 text-sm text-rose-600">
                                {
                                    errors.type
                                }
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* INFORMASI */}
                    {/* ================================================= */}
                    {data.type ===
                    "informasi" ? (
                        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 sm:p-6">
                            <div className="mb-4">
                                <h4 className="font-bold text-slate-800">
                                    Poster /
                                    Gambar
                                    Informasi
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Kosongkan
                                    pilihan file
                                    jika gambar
                                    lama tidak
                                    ingin diganti.
                                    Maksimal 50 MB.
                                </p>
                            </div>

                            {dataPost.type ===
                                "dokumentasi" && (
                                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Anda sedang
                                    mengubah
                                    Dokumentasi
                                    menjadi
                                    Informasi.
                                    Setelah
                                    disimpan,
                                    galeri
                                    dokumentasi
                                    lama akan
                                    dihapus.
                                </div>
                            )}

                            <div className="grid gap-5 md:grid-cols-2">
                                {/* GAMBAR LAMA */}
                                <div>
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Gambar Saat
                                        Ini
                                    </p>

                                    {dataPost.image_url &&
                                    dataPost.type ===
                                        "informasi" ? (
                                        <img
                                            src={
                                                dataPost.image_url
                                            }
                                            alt="Gambar saat ini"
                                            className="h-52 w-full rounded-xl border border-slate-200 bg-white object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                                            Belum ada
                                            gambar
                                            informasi
                                        </div>
                                    )}
                                </div>

                                {/* GAMBAR BARU */}
                                <div>
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Gambar
                                        Pengganti
                                    </p>

                                    {mainImagePreview ? (
                                        <div className="relative h-52 overflow-hidden rounded-xl border-2 border-indigo-300 bg-white">
                                            <img
                                                src={
                                                    mainImagePreview
                                                }
                                                alt="Gambar pengganti"
                                                className="h-full w-full object-contain"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        "image",
                                                        null,
                                                    )
                                                }
                                                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white shadow transition hover:bg-rose-600"
                                                title="Batalkan gambar pengganti"
                                            >
                                                <XIcon />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-white text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                                            <PlusIcon className="h-8 w-8 text-indigo-500" />

                                            <span className="mt-2 text-sm font-bold text-indigo-700">
                                                Pilih
                                                gambar
                                                pengganti
                                            </span>

                                            <span className="mt-1 text-xs text-slate-400">
                                                JPG, PNG,
                                                GIF, WEBP
                                                · maks. 50
                                                MB
                                            </span>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handleMainImage
                                                }
                                                className="sr-only"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {errors.image && (
                                <p className="mt-3 text-sm font-medium text-rose-600">
                                    {
                                        errors.image
                                    }
                                </p>
                            )}
                        </section>
                    ) : (
                        /* ================================================= */
                        /* DOKUMENTASI */
                        /* ================================================= */
                        <section className="space-y-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 sm:p-6">
                            {/* Jika mengubah Informasi menjadi Dokumentasi */}
                            {dataPost.type ===
                                "informasi" && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Anda sedang
                                    mengubah
                                    Informasi
                                    menjadi
                                    Dokumentasi.
                                    Setelah
                                    disimpan,
                                    gambar utama
                                    lama tidak
                                    digunakan
                                    lagi.
                                </div>
                            )}

                            {/* ============================= */}
                            {/* JUDUL GALERI */}
                            {/* ============================= */}
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800">
                                        Kelola
                                        Galeri
                                        Dokumentasi
                                    </h4>

                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                                        Klik tombol
                                        X pada foto
                                        lama jika
                                        ingin
                                        menghapusnya.
                                        Foto yang
                                        tidak
                                        ditandai akan
                                        tetap ada.
                                        Foto baru
                                        akan
                                        ditambahkan,
                                        bukan
                                        mengganti
                                        galeri lama.
                                    </p>
                                </div>

                                {removeCount >
                                    0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                "remove_images",
                                                [],
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Batalkan
                                        Semua Hapus
                                    </button>
                                )}
                            </div>

                            {/* ============================= */}
                            {/* RINGKASAN JUMLAH */}
                            {/* ============================= */}
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                {/* Lama */}
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Foto Lama
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-slate-800">
                                        {
                                            existingCount
                                        }
                                    </p>
                                </div>

                                {/* Hapus */}
                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                                        Akan Dihapus
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-rose-700">
                                        {
                                            removeCount
                                        }
                                    </p>
                                </div>

                                {/* Baru */}
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                        Foto Baru
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-emerald-700">
                                        {
                                            newCount
                                        }
                                    </p>
                                </div>

                                {/* Hasil */}
                                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                                        Setelah
                                        Disimpan
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-indigo-700">
                                        {
                                            finalCount
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* ================================================= */}
                            {/* FOTO LAMA */}
                            {/* ================================================= */}
                            <div>
                                <div className="mb-3">
                                    <p className="text-sm font-bold text-slate-700">
                                        Galeri Saat
                                        Ini
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        X = tandai
                                        hapus. Foto
                                        belum
                                        dihapus
                                        sampai Anda
                                        menekan
                                        Simpan
                                        Perubahan.
                                    </p>
                                </div>

                                {existingGallery.length >
                                0 ? (
                                    /*
                                     * max-height dibuat supaya
                                     * 78+ foto tidak membuat
                                     * halaman terlalu panjang.
                                     */
                                    <div className="max-h-[640px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {existingGallery.map(
                                                (
                                                    item,
                                                    index,
                                                ) => {
                                                    const markedForDelete =
                                                        removeSet.has(
                                                            item.stored,
                                                        );

                                                    return (
                                                        <div
                                                            key={`${item.stored}-${index}`}
                                                            className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                                                                markedForDelete
                                                                    ? "border-rose-500 bg-rose-50"
                                                                    : "border-slate-100 bg-slate-100 hover:border-indigo-300"
                                                            }`}
                                                        >
                                                            {/* FOTO */}
                                                            {item.url ? (
                                                                <img
                                                                    src={
                                                                        item.url
                                                                    }
                                                                    alt={`Galeri ${index + 1}`}
                                                                    loading="lazy"
                                                                    className={`h-full w-full object-cover transition ${
                                                                        markedForDelete
                                                                            ? "scale-95 opacity-35 grayscale"
                                                                            : "group-hover:scale-[1.03]"
                                                                    }`}
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center p-4 text-center text-xs text-slate-400">
                                                                    Preview
                                                                    tidak
                                                                    tersedia
                                                                </div>
                                                            )}

                                                            {/* X / UNDO */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleRemoveExisting(
                                                                        item.stored,
                                                                    )
                                                                }
                                                                className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition ${
                                                                    markedForDelete
                                                                        ? "bg-white text-rose-600 hover:bg-slate-100"
                                                                        : "bg-slate-900/80 text-white hover:bg-rose-600"
                                                                }`}
                                                                title={
                                                                    markedForDelete
                                                                        ? "Batalkan hapus"
                                                                        : "Hapus foto ini"
                                                                }
                                                            >
                                                                {markedForDelete ? (
                                                                    <UndoIcon />
                                                                ) : (
                                                                    <XIcon />
                                                                )}
                                                            </button>

                                                            {/* NOMOR FOTO */}
                                                            {!markedForDelete && (
                                                                <div className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-bold text-white">
                                                                    #
                                                                    {index +
                                                                        1}
                                                                </div>
                                                            )}

                                                            {/* LABEL DELETE */}
                                                            {markedForDelete && (
                                                                <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-center">
                                                                    <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                                                                        Akan
                                                                        dihapus
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-400">
                                        Belum ada
                                        gambar
                                        dokumentasi.
                                    </div>
                                )}
                            </div>

                            {/* ================================================= */}
                            {/* TAMBAH FOTO BARU */}
                            {/* ================================================= */}
                            <div>
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            Tambah
                                            Foto Baru
                                        </p>

                                        <p className="text-xs leading-5 text-slate-400">
                                            Bisa pilih
                                            berkali-kali.
                                            Pilihan
                                            berikutnya
                                            akan
                                            ditambahkan
                                            ke daftar,
                                            bukan
                                            mengganti
                                            pilihan
                                            sebelumnya.
                                            Maksimal 50
                                            MB per
                                            foto.
                                        </p>
                                    </div>

                                    {newCount >
                                        0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    "images",
                                                    [],
                                                )
                                            }
                                            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                                        >
                                            Hapus Semua
                                            Foto Baru
                                        </button>
                                    )}
                                </div>

                                {/* Tombol Add Foto */}
                                <label
                                    htmlFor="new-gallery-images"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white px-6 py-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50"
                                >
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <PlusIcon className="h-6 w-6" />
                                    </span>

                                    <span className="mt-3 font-bold text-emerald-800">
                                        + Tambah
                                        Foto
                                    </span>

                                    <span className="mt-1 text-xs text-slate-400">
                                        Pilih satu
                                        atau banyak
                                        gambar. Anda
                                        bisa klik
                                        lagi untuk
                                        menambah
                                        batch
                                        berikutnya.
                                    </span>

                                    <input
                                        id="new-gallery-images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={
                                            handleNewGalleryFiles
                                        }
                                        className="sr-only"
                                    />
                                </label>

                                {/* Pesan frontend */}
                                {fileMessage && (
                                    <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                                        {
                                            fileMessage
                                        }
                                    </div>
                                )}

                                {/* ================================================= */}
                                {/* PREVIEW FOTO BARU */}
                                {/* ================================================= */}
                                {newImagePreviews.length >
                                    0 && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-bold text-slate-700">
                                                Foto
                                                Baru
                                                yang
                                                Akan
                                                Ditambahkan
                                            </p>

                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                                {
                                                    newCount
                                                }{" "}
                                                foto
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {newImagePreviews.map(
                                                (
                                                    item,
                                                    index,
                                                ) => (
                                                    <div
                                                        key={
                                                            item.key
                                                        }
                                                        className="group relative overflow-hidden rounded-xl border-2 border-emerald-200 bg-emerald-50"
                                                    >
                                                        <div className="relative aspect-square overflow-hidden">
                                                            {/* PREVIEW */}
                                                            <img
                                                                src={
                                                                    item.url
                                                                }
                                                                alt={`Foto baru ${index + 1}`}
                                                                loading="lazy"
                                                                className="h-full w-full object-cover"
                                                            />

                                                            {/* BADGE BARU */}
                                                            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white shadow">
                                                                Baru
                                                            </span>

                                                            {/* X */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeNewImage(
                                                                        index,
                                                                    )
                                                                }
                                                                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg transition hover:bg-rose-600"
                                                                title="Batalkan foto baru ini"
                                                            >
                                                                <XIcon />
                                                            </button>
                                                        </div>

                                                        {/* FILE INFO */}
                                                        <div className="p-2.5">
                                                            <p
                                                                className="truncate text-xs font-semibold text-slate-700"
                                                                title={
                                                                    item
                                                                        .file
                                                                        .name
                                                                }
                                                            >
                                                                {
                                                                    item
                                                                        .file
                                                                        .name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                {formatFileSize(
                                                                    item
                                                                        .file
                                                                        .size,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ERROR BACKEND */}
                                {galleryError && (
                                    <p className="mt-3 text-sm font-medium text-rose-600">
                                        {
                                            galleryError
                                        }
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ================================================= */}
                    {/* KONTEN */}
                    {/* ================================================= */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Isi Detail /
                            Keterangan
                        </label>

                        <textarea
                            rows="7"
                            value={
                                data.content
                            }
                            onChange={(
                                event,
                            ) =>
                                setData(
                                    "content",

                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="w-full resize-y rounded-xl border-slate-300 transition-shadow focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            placeholder="Tuliskan keterangan..."
                        />

                        {errors.content && (
                            <p className="mt-1 text-sm text-rose-600">
                                {
                                    errors.content
                                }
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* STATUS */}
                    {/* ================================================= */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Status Tayang
                        </label>

                        <select
                            value={
                                data.status
                            }
                            onChange={(
                                event,
                            ) =>
                                setData(
                                    "status",

                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="w-full rounded-xl border-slate-300 bg-slate-50 sm:w-1/3"
                        >
                            <option value="publish">
                                Publish
                            </option>

                            <option value="draft">
                                Draft
                            </option>
                        </select>

                        {errors.status && (
                            <p className="mt-1 text-sm text-rose-600">
                                {
                                    errors.status
                                }
                            </p>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* SIMPAN */}
                    {/* ================================================= */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-400">
                            Foto lama yang tidak
                            ditandai X tidak akan
                            di-upload ulang dan
                            tetap tersimpan seperti
                            sekarang.
                        </p>

                        <button
                            type="submit"
                            disabled={
                                processing
                            }
                            className="inline-flex min-w-44 items-center justify-center rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing
                                ? "Menyimpan Perubahan..."
                                : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}