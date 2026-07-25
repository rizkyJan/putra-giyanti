import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ auth, meetings }) {
    return (
        <AdminLayout user={auth.user}>
            <Head title="Data Absensi" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                    Data Absensi & Rekapitulasi
                </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <p className="text-slate-600 text-sm">
                        Pilih agenda rapat di bawah ini untuk melihat daftar
                        hadir anggota. Hanya rapat dengan status{" "}
                        <b>Sedang Berlangsung</b> atau <b>Selesai</b> yang
                        muncul di sini.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                <th className="p-4 font-semibold">
                                    Judul Rapat
                                </th>
                                <th className="p-4 font-semibold">
                                    Tanggal & Waktu
                                </th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {meetings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="p-6 text-center text-slate-500"
                                    >
                                        Belum ada rapat yang dimulai atau
                                        selesai.
                                    </td>
                                </tr>
                            ) : (
                                meetings.map((meeting) => (
                                    <tr
                                        key={meeting.id}
                                        className="hover:bg-slate-50 transition"
                                    >
                                        <td className="p-4 font-medium">
                                            {meeting.title}
                                            <div className="text-xs text-slate-400 font-normal mt-0.5">
                                                {meeting.location || "-"}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-semibold">
                                                {meeting.date}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {meeting.time} WIB
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {meeting.status === "ongoing" ? (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                                                    Berlangsung
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link
                                                href={route(
                                                    "admin.attendances.show",
                                                    meeting.id,
                                                )}
                                                className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-600 hover:text-white transition"
                                            >
                                                Lihat Rekap Absen
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
