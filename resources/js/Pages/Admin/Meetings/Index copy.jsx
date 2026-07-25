import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner"; // Import library scanner

export default function Index({ auth, meetings }) {
    const { flash } = usePage().props;

    // State untuk kontrol Modal Scanner
    const [showScanner, setShowScanner] = useState(false);
    const [activeMeeting, setActiveMeeting] = useState(null);

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus agenda rapat ini?")) {
            router.delete(route("admin.meetings.destroy", id));
        }
    };

    const handleStartMeeting = (id) => {
        if (
            confirm(
                "Mulai rapat sekarang? Sistem akan men-generate QR Code absen untuk semua anggota.",
            )
        ) {
            router.post(route("admin.meetings.start", id));
        }
    };

    // Fungsi membuka modal scanner
    const handleOpenScanner = (meeting) => {
        setActiveMeeting(meeting);
        setShowScanner(true);
    };

    // Fungsi saat QR Code berhasil terbaca oleh kamera
    const handleScan = (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0) {
            // Ambil teks dari QR Code yang discan
            const token = detectedCodes[0].rawValue;

            // Tutup kamera sebentar agar tidak men-scan berkali-kali secara beruntun
            setShowScanner(false);

            // Tembak data ke backend Laravel untuk memproses kehadiran
            // Pastikan kamu nanti membuat route 'admin.attendances.scan' di web.php
            router.post(
                route("admin.attendances.scan"),
                {
                    meeting_id: activeMeeting.id,
                    qr_code_token: token,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Bisa ditambahkan feedback tambahan jika perlu
                    },
                },
            );
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Manajemen Rapat" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                    Manajemen Rapat
                </h3>
                <Link
                    href={route("admin.meetings.create")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                    + Buat Agenda Rapat
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-medium">
                    {flash.error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                <th className="p-4 font-semibold">
                                    Judul Rapat
                                </th>
                                <th className="p-4 font-semibold">
                                    Waktu Pelaksanaan
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
                                        Belum ada agenda rapat.
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
                                            <div className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-xs">
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
                                            {meeting.status === "scheduled" && (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                                                    Terjadwal
                                                </span>
                                            )}
                                            {meeting.status === "ongoing" && (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                                                    Sedang Berlangsung
                                                </span>
                                            )}
                                            {meeting.status === "completed" && (
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2 items-center flex-wrap max-w-[250px] mx-auto">
                                            {meeting.status === "scheduled" && (
                                                <button
                                                    onClick={() =>
                                                        handleStartMeeting(
                                                            meeting.id,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition w-full mb-1"
                                                >
                                                    🚀 Mulai Rapat
                                                </button>
                                            )}

                                            {meeting.status === "ongoing" && (
                                                <button
                                                    onClick={() =>
                                                        handleOpenScanner(
                                                            meeting,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition w-full mb-1 flex justify-center items-center gap-1"
                                                >
                                                    📷 Buka Scanner
                                                </button>
                                            )}

                                            <Link
                                                href={route(
                                                    "admin.meetings.edit",
                                                    meeting.id,
                                                )}
                                                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-200 transition flex-1 text-center"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(meeting.id)
                                                }
                                                className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-200 transition flex-1"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL SCANNER KAMERA */}
            {showScanner && activeMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Scanner Absensi
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Rapat: {activeMeeting.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowScanner(false)}
                                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 bg-black relative">
                            {/* Komponen Kamera */}
                            <Scanner
                                onScan={handleScan}
                                formats={["qr_code"]}
                                styles={{
                                    container: {
                                        borderRadius: "0.5rem",
                                        overflow: "hidden",
                                    },
                                    video: { objectFit: "cover" },
                                }}
                            />

                            {/* Overlay Target UI */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-emerald-400 border-dashed rounded-xl opacity-70"></div>
                            </div>
                        </div>

                        <div className="p-5 bg-white text-center">
                            <p className="text-sm font-medium text-slate-600">
                                Arahkan kamera ke QR Code milik anggota.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
