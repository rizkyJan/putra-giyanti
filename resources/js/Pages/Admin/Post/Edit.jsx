import AdminLayout from "@/Layouts/AdminLayout";
import QueuedPhotoPicker from "@/Components/QueuedPhotoPicker";
import QueueUploadProgressModal from "@/Components/QueueUploadProgressModal";
import useImageUploadQueue from "@/Hooks/useImageUploadQueue";

import { Head, Link, useForm } from "@inertiajs/react";

import { useMemo, useState } from "react";

function XIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
        >
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
}

function UndoIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 8 4 12l5 4M5 12h8a6 6 0 0 1 6 6"
            />
        </svg>
    );
}

export default function Edit({ auth, post: dataPost }) {
    const form = useForm({
        _method: "PUT",

        title: dataPost.title || "",

        type: dataPost.type || "informasi",

        content: dataPost.content || "",

        status: dataPost.status || "publish",

        uploaded_image: null,

        uploaded_images: [],

        /*
         * Foto LAMA yang akan dihapus.
         */
        remove_images: [],
    });

    const { data, setData, processing, errors } = form;

    /*
     * Queue hanya berisi FOTO BARU.
     *
     * Foto lama tidak masuk queue.
     */
    const queue = useImageUploadQueue();

    const [modalOpen, setModalOpen] = useState(false);

    const [uploadStage, setUploadStage] = useState("uploading");

    const [uploadError, setUploadError] = useState("");

    /*
     * Galeri lama.
     */
    const existingGallery = useMemo(() => {
        if (Array.isArray(dataPost.images_items)) {
            return dataPost.images_items;
        }

        if (!Array.isArray(dataPost.images)) {
            return [];
        }

        return dataPost.images.map((stored, index) => ({
            stored,

            url: dataPost.images_urls?.[index] || null,
        }));
    }, [dataPost]);

    const removeSet = new Set(data.remove_images || []);

    const removeCount = data.remove_images?.length || 0;

    const oldCount = existingGallery.length;

    const newCount = queue.total;

    const finalCount = Math.max(0, oldCount - removeCount + newCount);

    /**
     * Tandai / batalkan hapus
     * foto LAMA.
     */
    const toggleRemoveExisting = (stored) => {
        const current = data.remove_images || [];

        if (current.includes(stored)) {
            setData(
                "remove_images",

                current.filter((item) => item !== stored),
            );

            return;
        }

        setData(
            "remove_images",

            [...current, stored],
        );
    };

    /**
     * Ganti tipe.
     */
    const handleTypeChange = async (event) => {
        const newType = event.target.value;

        try {
            /*
             * Bersihkan foto BARU yang
             * mungkin sudah menjadi
             * temporary upload.
             */
            await queue.clearAll();

            setData("type", newType);

            setData("uploaded_image", null);

            setData("uploaded_images", []);

            setData("remove_images", []);
        } catch (error) {
            window.alert(error.message);
        }
    };

    /**
     * ==========================================
     * QUEUE UPLOAD + FINAL UPDATE
     * ==========================================
     */
    const processSubmit = async () => {
        if (processing) {
            return;
        }

        setUploadError("");

        /*
         * Modal progress hanya diperlukan
         * kalau ada foto BARU.
         *
         * Foto lama yang hanya dihapus
         * tidak perlu masuk upload queue.
         */
        if (queue.total > 0) {
            setModalOpen(true);
            setUploadStage("uploading");
        }

        try {
            /*
             * Upload hanya foto BARU.
             *
             * Foto lama tidak di-upload ulang.
             */
            const uploaded = await queue.uploadAll();

            const refs = uploaded.map((item) => item.stored);

            /*
             * Semua foto baru selesai
             * masuk Drive.
             */
            if (queue.total > 0) {
                setUploadStage("finalizing");
            }

            /*
             * Pisahkan transform.
             */
            form.transform((payload) => ({
                ...payload,

                /*
                 * Jika Informasi,
                 * maksimal satu gambar baru.
                 */
                uploaded_image:
                    data.type === "informasi" ? (refs[0] ?? null) : null,

                /*
                 * Jika Dokumentasi,
                 * seluruh hasil queue
                 * ditambahkan ke galeri lama.
                 */
                uploaded_images: data.type === "dokumentasi" ? refs : [],

                /*
                 * Foto lama yang ditandai X.
                 */
                remove_images: data.remove_images || [],
            }));

            /*
             * Karena kita sudah punya:
             *
             * _method: "PUT"
             *
             * di useForm,
             *
             * tetap submit POST dan Laravel
             * akan memproses sebagai PUT.
             */
            form.post(route("admin.posts.update", dataPost.id), {
                preserveScroll: true,

                onSuccess: () => {
                    /*
                     * Redirect dari controller
                     * akan membawa user ke index.
                     */
                },

                onError: (errors) => {
                    console.error("Final update error:", errors);

                    setModalOpen(true);

                    setUploadStage("error");

                    setUploadError(
                        "Foto baru sudah berhasil masuk Google Drive, tetapi perubahan postingan belum berhasil disimpan. Periksa form lalu coba lagi. Foto yang sudah sukses tidak akan di-upload ulang.",
                    );
                },

                onException: (error) => {
                    console.error("Final update exception:", error);

                    setModalOpen(true);

                    setUploadStage("error");

                    setUploadError(
                        error?.message ||
                            "Terjadi kesalahan saat menyimpan perubahan.",
                    );
                },
            });
        } catch (error) {
            console.error("Queue upload error:", error);

            setModalOpen(true);
            setUploadStage("error");

            setUploadError(
                error?.message || "Terjadi kesalahan saat upload foto.",
            );
        }
    };

    const submit = (event) => {
        event.preventDefault();

        processSubmit();
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`Edit: ${dataPost.title}`} />

            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                        Edit Data
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Hapus foto tertentu dengan X atau tambahkan foto baru
                        tanpa menghapus foto lama.
                    </p>
                </div>

                <Link
                    href={route("admin.posts.index")}
                    className="rounded-xl bg-slate-200 px-4 py-2 text-center font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                    Kembali
                </Link>
            </div>

            <div className="max-w-6xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <form onSubmit={submit} className="space-y-7 p-6 sm:p-8">
                    {/* TITLE */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Judul
                        </label>

                        <input
                            type="text"
                            value={data.title}
                            onChange={(event) =>
                                setData(
                                    "title",

                                    event.target.value,
                                )
                            }
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                        />

                        {errors.title && (
                            <p className="mt-1 text-sm text-rose-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Jenis Postingan
                        </label>

                        <select
                            value={data.type}
                            onChange={handleTypeChange}
                            className="w-full rounded-xl border-slate-300 bg-slate-50 focus:border-indigo-500"
                        >
                            <option value="informasi">
                                Informasi (1 Gambar)
                            </option>

                            <option value="dokumentasi">
                                Dokumentasi (Banyak Foto)
                            </option>
                        </select>
                    </div>

                    {/* ================================================= */}
                    {/* INFORMASI */}
                    {/* ================================================= */}
                    {data.type === "informasi" ? (
                        <section className="space-y-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 sm:p-6">
                            <div>
                                <h4 className="font-bold text-slate-800">
                                    Gambar Informasi
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Kalau tidak memilih gambar baru, gambar lama
                                    tetap digunakan.
                                </p>
                            </div>

                            {dataPost.type === "dokumentasi" && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Anda sedang mengubah Dokumentasi menjadi
                                    Informasi. Galeri lama akan dihapus setelah
                                    data berhasil disimpan.
                                </div>
                            )}

                            {dataPost.type === "informasi" &&
                            dataPost.image_url ? (
                                <div>
                                    <p className="mb-2 text-sm font-bold text-slate-700">
                                        Gambar Saat Ini
                                    </p>

                                    <img
                                        src={dataPost.image_url}
                                        alt={dataPost.title}
                                        className="max-h-72 rounded-xl border border-slate-200 bg-white object-contain"
                                    />
                                </div>
                            ) : null}

                            <QueuedPhotoPicker
                                queue={queue}
                                multiple={false}
                                title="Gambar Baru"
                                description="Kosongkan jika tidak ingin mengganti gambar lama. Jika memilih gambar baru, gambar lama akan diganti setelah proses berhasil."
                            />
                        </section>
                    ) : (
                        /* ================================================= */
                        /* DOKUMENTASI */
                        /* ================================================= */
                        <section className="space-y-6 rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 sm:p-6">
                            {dataPost.type === "informasi" && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Anda sedang mengubah Informasi menjadi
                                    Dokumentasi. Gambar utama lama akan dihapus
                                    setelah perubahan berhasil.
                                </div>
                            )}

                            {/* SUMMARY */}
                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Foto Lama
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-slate-800">
                                        {oldCount}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-rose-500">
                                        Akan Dihapus
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-rose-700">
                                        {removeCount}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                        Foto Baru
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-emerald-700">
                                        {newCount}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                                        Hasil Akhir
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-indigo-700">
                                        {finalCount}
                                    </p>
                                </div>
                            </div>

                            {/* OLD GALLERY */}
                            <div>
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">
                                            Galeri Saat Ini
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Klik X untuk menandai foto yang
                                            ingin dihapus. Klik undo jika salah.
                                        </p>
                                    </div>

                                    {removeCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData("remove_images", [])
                                            }
                                            className="text-sm font-bold text-rose-600 hover:text-rose-700"
                                        >
                                            Batalkan Semua Hapus
                                        </button>
                                    )}
                                </div>

                                {existingGallery.length > 0 ? (
                                    <div className="max-h-[640px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {existingGallery.map(
                                                (item, index) => {
                                                    const marked =
                                                        removeSet.has(
                                                            item.stored,
                                                        );

                                                    return (
                                                        <div
                                                            key={`${item.stored}-${index}`}
                                                            className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${
                                                                marked
                                                                    ? "border-rose-500 bg-rose-50"
                                                                    : "border-slate-100 bg-slate-100"
                                                            }`}
                                                        >
                                                            {item.url ? (
                                                                <img
                                                                    src={
                                                                        item.url
                                                                    }
                                                                    alt={`Foto ${index + 1}`}
                                                                    loading="lazy"
                                                                    className={`h-full w-full object-cover transition ${
                                                                        marked
                                                                            ? "scale-95 opacity-30 grayscale"
                                                                            : "group-hover:scale-[1.03]"
                                                                    }`}
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                                    Preview
                                                                    tidak
                                                                    tersedia
                                                                </div>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleRemoveExisting(
                                                                        item.stored,
                                                                    )
                                                                }
                                                                className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-lg ${
                                                                    marked
                                                                        ? "bg-white text-rose-600"
                                                                        : "bg-slate-900/80 text-white hover:bg-rose-600"
                                                                }`}
                                                                title={
                                                                    marked
                                                                        ? "Batalkan hapus"
                                                                        : "Hapus foto"
                                                                }
                                                            >
                                                                {marked ? (
                                                                    <UndoIcon />
                                                                ) : (
                                                                    <XIcon />
                                                                )}
                                                            </button>

                                                            {!marked && (
                                                                <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-bold text-white">
                                                                    #{index + 1}
                                                                </span>
                                                            )}

                                                            {marked && (
                                                                <span className="absolute inset-x-2 bottom-2 rounded-lg bg-rose-600 px-2 py-1 text-center text-xs font-bold text-white">
                                                                    Akan dihapus
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
                                        Belum ada foto dokumentasi.
                                    </div>
                                )}
                            </div>

                            {/* NEW FILES */}
                            <QueuedPhotoPicker
                                queue={queue}
                                multiple={true}
                                title="Tambah Foto Baru"
                                description="Foto baru akan ditambahkan ke galeri lama. Bisa pilih banyak dan bisa klik Tambah Foto berkali-kali. Maksimal 50 MB per gambar."
                            />
                        </section>
                    )}

                    {/* CONTENT */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Isi Detail / Keterangan
                        </label>

                        <textarea
                            rows="7"
                            value={data.content}
                            onChange={(event) =>
                                setData(
                                    "content",

                                    event.target.value,
                                )
                            }
                            className="w-full resize-y rounded-xl border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                        />

                        {errors.content && (
                            <p className="mt-1 text-sm text-rose-600">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Status Tayang
                        </label>

                        <select
                            value={data.status}
                            onChange={(event) =>
                                setData(
                                    "status",

                                    event.target.value,
                                )
                            }
                            className="w-full rounded-xl border-slate-300 bg-slate-50 sm:w-1/3"
                        >
                            <option value="publish">Publish</option>

                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    {/* ERROR */}
                    {(errors.upload ||
                        errors.uploaded_image ||
                        errors.uploaded_images ||
                        errors.remove_images) && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {errors.upload ||
                                errors.uploaded_image ||
                                errors.uploaded_images ||
                                errors.remove_images}
                        </div>
                    )}

                    {/* SAVE */}
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-400">
                            Foto lama yang tidak ditandai tidak akan di-upload
                            ulang.
                        </p>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
                        >
                            {processing
                                ? "Menyimpan..."
                                : queue.total > 0
                                  ? `Upload ${queue.total} Foto & Simpan`
                                  : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>

            <QueueUploadProgressModal
                show={modalOpen}
                stage={uploadStage}
                stats={queue.stats}
                error={uploadError}
                onRetry={processSubmit}
                onClose={() => setModalOpen(false)}
            />
        </AdminLayout>
    );
}
