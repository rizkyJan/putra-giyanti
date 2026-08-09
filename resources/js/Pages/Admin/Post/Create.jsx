import AdminLayout from "@/Layouts/AdminLayout";
import QueuedPhotoPicker from "@/Components/QueuedPhotoPicker";
import QueueUploadProgressModal from "@/Components/QueueUploadProgressModal";
import useImageUploadQueue from "@/Hooks/useImageUploadQueue";

import { Head, Link, useForm } from "@inertiajs/react";

import { useState } from "react";

export default function Create({ auth }) {
    const form = useForm({
        title: "",

        type: "informasi",

        content: "",

        status: "publish",

        /*
         * Binary file TIDAK masuk form.
         *
         * Hanya hasil queue:
         *
         * gdrive:FILE_ID
         */
        uploaded_image: null,

        uploaded_images: [],
    });

    const { data, setData, processing, errors } = form;

    const queue = useImageUploadQueue();

    const [modalOpen, setModalOpen] = useState(false);

    const [uploadStage, setUploadStage] = useState("uploading");

    const [uploadError, setUploadError] = useState("");

    /**
     * Ganti tipe.
     */
    const handleTypeChange = async (event) => {
        const newType = event.target.value;

        try {
            /*
             * Kalau sebelumnya pernah
             * upload lalu validation gagal,
             * temporary Drive ikut dibersihkan.
             */
            await queue.clearAll();

            setData("type", newType);

            setData("uploaded_image", null);

            setData("uploaded_images", []);
        } catch (error) {
            window.alert(error.message);
        }
    };

    /**
     * =================================================
     * QUEUE -> DRIVE -> SAVE POST
     * =================================================
     */
    const processSubmit = async () => {
        if (processing) {
            return;
        }

        setUploadError("");

        /*
         * Kalau ada foto,
         * tampilkan modal progress.
         */
        if (queue.total > 0) {
            setModalOpen(true);
            setUploadStage("uploading");
        }

        try {
            /*
             * Upload queue satu per satu.
             *
             * Foto yang sudah DONE
             * otomatis dilewati saat retry.
             */
            const uploaded = await queue.uploadAll();
            if (uploaded.length !== queue.total) {
                throw new Error(
                    `Upload belum lengkap. ` +
                        `${uploaded.length} dari ` +
                        `${queue.total} foto berhasil. ` +
                        `Data belum disimpan.`,
                );
            }

            /*
             * Ambil hasil Google Drive:
             *
             * [
             *   "gdrive:AAA",
             *   "gdrive:BBB",
             *   ...
             * ]
             */
            const refs = uploaded.map((item) => item.stored);

            /*
             * Semua gambar sudah berhasil
             * masuk Google Drive.
             *
             * Sekarang masuk tahap simpan
             * data postingan ke database.
             */
            if (queue.total > 0) {
                setUploadStage("finalizing");
            }

            /*
             * PENTING:
             *
             * JANGAN:
             *
             * form
             *   .transform(...)
             *   .post(...)
             *
             * Pisahkan transform dan post.
             */
            form.transform((payload) => ({
                ...payload,

                uploaded_image:
                    data.type === "informasi" ? (refs[0] ?? null) : null,

                uploaded_images: data.type === "dokumentasi" ? refs : [],
            }));

            /*
             * Baru submit form.
             */
            form.post(route("admin.posts.store"), {
                preserveScroll: true,

                onSuccess: () => {
                    /*
                     * Tidak perlu tutup modal
                     * manual karena halaman
                     * akan redirect ke index.
                     */
                },

                onError: (errors) => {
                    console.error("Final save error:", errors);

                    setModalOpen(true);

                    setUploadStage("error");

                    setUploadError(
                        "Semua foto sudah berhasil masuk Google Drive, tetapi data postingan belum berhasil disimpan. Periksa isian form lalu coba lagi. Foto yang sudah sukses tidak akan di-upload ulang.",
                    );
                },

                onException: (error) => {
                    console.error("Final save exception:", error);

                    setModalOpen(true);

                    setUploadStage("error");

                    setUploadError(
                        error?.message ||
                            "Terjadi kesalahan saat menyimpan postingan.",
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
            <Head title="Tambah Data" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                        Tambah Data Baru
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Upload foto menggunakan sistem antrean agar lebih aman
                        untuk banyak gambar.
                    </p>
                </div>

                <Link
                    href={route("admin.posts.index")}
                    className="rounded-xl bg-slate-200 px-4 py-2 text-center font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                    Kembali
                </Link>
            </div>

            <div className="max-w-5xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <form onSubmit={submit} className="space-y-7 p-6 sm:p-8">
                    {/* JUDUL */}
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
                            placeholder="Contoh: Dokumentasi Lomba Anak Anak"
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

                    {/* IMAGE PICKER */}
                    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 sm:p-6">
                        <QueuedPhotoPicker
                            queue={queue}
                            multiple={data.type === "dokumentasi"}
                            title={
                                data.type === "dokumentasi"
                                    ? "Foto Dokumentasi"
                                    : "Gambar Informasi"
                            }
                            description={
                                data.type === "dokumentasi"
                                    ? "Pilih banyak foto. Anda bisa klik Tambah Foto berkali-kali. Saat disimpan, foto akan di-upload satu per satu. Maksimal 50 MB per foto."
                                    : "Pilih satu gambar. Maksimal 50 MB."
                            }
                        />
                    </section>

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
                            placeholder="Tuliskan keterangan..."
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
                        errors.uploaded_images) && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {errors.upload ||
                                errors.uploaded_image ||
                                errors.uploaded_images}
                        </div>
                    )}

                    {/* SAVE */}
                    <div className="border-t border-slate-100 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
                        >
                            {processing
                                ? "Menyimpan..."
                                : data.type === "dokumentasi"
                                  ? `Upload & Simpan ${queue.total} Foto`
                                  : "Simpan Data"}
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
