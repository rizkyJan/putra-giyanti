import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        date: "",
        location: "", // Tambahkan state location
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.meetings.store"));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Buat Agenda Rapat" />

            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Buat Agenda Rapat Baru
                    </h3>
                    <Link
                        href={route("admin.meetings.index")}
                        className="text-slate-500 hover:text-slate-700 underline"
                    >
                        Kembali
                    </Link>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Judul Rapat */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Judul Rapat
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Cth: Rapat Rutin Bulanan"
                            />
                            {errors.title && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.title}
                                </div>
                            )}
                        </div>

                        {/* Waktu Pelaksanaan */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Waktu Pelaksanaan
                            </label>
                            <input
                                type="datetime-local"
                                value={data.date}
                                onChange={(e) =>
                                    setData("date", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.date && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.date}
                                </div>
                            )}
                        </div>

                        {/* Lokasi */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Lokasi
                            </label>
                            <input
                                type="text"
                                value={data.location}
                                onChange={(e) =>
                                    setData("location", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Cth: Balai Desa / Rumah Sdr. Budi"
                            />
                            {errors.location && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.location}
                                </div>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Keterangan / Deskripsi
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                rows="3"
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                            {errors.description && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.description}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {processing ? "Menyimpan..." : "Simpan Agenda"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
