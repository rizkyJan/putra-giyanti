import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ auth, meeting }) {
    // Menggabungkan date dan time dari DB menjadi format YYYY-MM-DDTHH:mm
    const formattedDate =
        meeting.date && meeting.time
            ? `${meeting.date}T${meeting.time.substring(0, 5)}`
            : "";

    const { data, setData, put, processing, errors } = useForm({
        title: meeting.title || "",
        description: meeting.description || "",
        date: formattedDate,
        location: meeting.location || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("admin.meetings.update", meeting.id));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Edit Agenda Rapat" />

            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Edit Agenda Rapat
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
                            />
                            {errors.title && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.title}
                                </div>
                            )}
                        </div>

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
                            />
                            {errors.location && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.location}
                                </div>
                            )}
                        </div>

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
                                className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50"
                            >
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
