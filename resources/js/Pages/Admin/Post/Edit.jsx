import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, post: dataPost }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        title: dataPost.title,
        type: dataPost.type || "informasi",
        content: dataPost.content,
        image: null,
        images: [],
        status: dataPost.status,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.posts.update", dataPost.id));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`Edit: ${dataPost.title}`} />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Edit Data</h3>
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
                            Judul
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring transition-shadow"
                        />
                    </div>

                    {/* Tipe */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Jenis Postingan
                        </label>
                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 bg-slate-50"
                        >
                            <option value="informasi">
                                Informasi (1 Poster/Gambar)
                            </option>
                            <option value="dokumentasi">
                                Dokumentasi (Banyak Gambar Galeri)
                            </option>
                        </select>
                    </div>

                    {/* Preview & Upload berdasarkan Tipe */}
                    {data.type === "informasi" ? (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Gambar Saat Ini
                            </label>
                            {dataPost.image && dataPost.type === "informasi" ? (
                                <img
                                    src={dataPost.image_url}
                                    alt="Preview"
                                    className="h-32 object-cover rounded-xl border shadow-sm mb-4"
                                />
                            ) : (
                                <div className="mb-4 text-sm text-slate-400 italic">
                                    Belum ada gambar informasi
                                </div>
                            )}

                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Ganti Gambar (Kosongkan jika tidak diganti, maks. 50 MB)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setData("image", e.target.files[0])
                                }
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 cursor-pointer"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Galeri Saat Ini
                            </label>
                            {dataPost.images_urls &&
                            dataPost.type === "dokumentasi" ? (
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {dataPost.images_urls.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt="Preview"
                                            className="h-24 w-24 object-cover rounded-xl border shadow-sm flex-shrink-0"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="mb-4 text-sm text-slate-400 italic">
                                    Belum ada gambar dokumentasi
                                </div>
                            )}

                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Ganti Semua Gambar (Akan menimpa yang lama, maks. 50 MB/file)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                    setData(
                                        "images",
                                        Array.from(e.target.files),
                                    )
                                }
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 cursor-pointer"
                            />
                        </div>
                    )}

                    {/* Konten */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Isi Detail
                        </label>
                        <textarea
                            rows="6"
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            className="w-full rounded-xl border-slate-300 focus:border-indigo-500 resize-y"
                        ></textarea>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Status Tayang
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="w-full sm:w-1/3 rounded-xl border-slate-300 bg-slate-50"
                        >
                            <option value="publish">Publish</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-sm"
                        >
                            {processing ? "Menyimpan..." : "Update Data"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
