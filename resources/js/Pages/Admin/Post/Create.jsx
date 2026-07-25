import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        content: "",
        image: null,
        status: "publish",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.posts.store"));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Tambah Informasi" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                    Tambah Informasi
                </h3>
                <Link
                    href={route("admin.posts.index")}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition"
                >
                    Kembali
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl">
                <form onSubmit={submit} className="p-6 sm:p-8 space-y-6">
                    {/* Judul */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Judul Informasi / Acara
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-shadow"
                            placeholder="Contoh: Jadwal Jalan Sehat Agustus 2026"
                        />
                        {errors.title && (
                            <p className="text-rose-500 text-sm mt-1">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Gambar */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Poster / Gambar Utama (Opsional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData("image", e.target.files[0])
                            }
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                        />
                        {errors.image && (
                            <p className="text-rose-500 text-sm mt-1">
                                {errors.image}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                            Format yang didukung: JPG, PNG, GIF. Maksimal 2MB.
                        </p>
                    </div>

                    {/* Konten */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Isi Detail Informasi
                        </label>
                        <textarea
                            rows="6"
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-shadow resize-y"
                            placeholder="Tuliskan isi berita, detail acara, lokasi, atau informasi penting lainnya..."
                        ></textarea>
                        {errors.content && (
                            <p className="text-rose-500 text-sm mt-1">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Status Tayang
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="w-full sm:w-1/3 rounded-xl border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-shadow bg-slate-50"
                        >
                            <option value="publish">
                                Publish (Tampil di Website)
                            </option>
                            <option value="draft">
                                Draft (Sembunyikan Sementara)
                            </option>
                        </select>
                        {errors.status && (
                            <p className="text-rose-500 text-sm mt-1">
                                {errors.status}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {processing ? "Menyimpan..." : "Simpan Informasi"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
