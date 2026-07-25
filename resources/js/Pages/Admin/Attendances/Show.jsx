import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Show({ auth, meeting, attendances }) {
    const { flash } = usePage().props;

    // State untuk mengontrol Modal Set Hadir Manual
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

    // Menghitung statistik absensi
    const totalMembers = attendances.length;
    const hadirCount = attendances.filter((a) => a.status === "hadir").length;
    const pendingCount = attendances.filter(
        (a) => a.status === "pending",
    ).length;

    // Fungsi format tanggal untuk jam scan (Aman untuk iOS/Mobile)
    const formatTime = (dateString) => {
        if (!dateString) return "-";

        const safeDateString = dateString.includes("T")
            ? dateString
            : dateString.replace(" ", "T");
        const date = new Date(safeDateString);

        if (isNaN(date.getTime())) return "Waktu tidak valid";

        return (
            date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }) + " WIB"
        );
    };

    // Buka Modal & Simpan ID
    const handleSetHadirClick = (attendanceId) => {
        setSelectedAttendanceId(attendanceId);
        setShowConfirmModal(true);
    };

    // Eksekusi Set Hadir setelah dikonfirmasi di Modal
    const confirmSetHadir = () => {
        if (selectedAttendanceId) {
            router.post(
                `/admin/attendances/${selectedAttendanceId}/manual`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Tutup modal jika sukses
                        setShowConfirmModal(false);
                        setSelectedAttendanceId(null);
                    },
                    onError: (errors) => {
                        console.error("Gagal update manual:", errors);
                        setShowConfirmModal(false);
                        setSelectedAttendanceId(null);
                        alert(
                            "Gagal memproses data. Cek console untuk detailnya.",
                        );
                    },
                },
            );
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`Detail Absen: ${meeting.title}`} />

            <div className="flex items-center gap-4 mb-6">
                <Link
                    href={route("admin.attendances.index")}
                    className="p-2 bg-white text-slate-500 hover:text-indigo-600 rounded-xl shadow-sm transition"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        ></path>
                    </svg>
                </Link>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                        {meeting.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {meeting.date} • {meeting.location}
                    </p>
                </div>
            </div>

            {/* 🔥 BLOK NOTIFIKASI FLASH */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-medium">
                    {flash.error}
                </div>
            )}

            {/* Kotak Statistik Ringkas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                        Total Anggota
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                        {totalMembers}
                    </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-sm text-emerald-600 font-medium mb-1">
                        Sudah Hadir
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                        {hadirCount}
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                    <p className="text-sm text-amber-600 font-medium mb-1">
                        Belum Hadir (Pending)
                    </p>
                    <p className="text-2xl font-bold text-amber-700">
                        {pendingCount}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                <th className="p-4 font-semibold">
                                    Nama Anggota
                                </th>
                                <th className="p-4 font-semibold">
                                    Token QR (ID Unik)
                                </th>
                                <th className="p-4 font-semibold">
                                    Status Absen
                                </th>
                                <th className="p-4 font-semibold">
                                    Waktu Scan
                                </th>
                                <th className="p-4 font-semibold text-center">
                                    Aksi Manual
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {attendances.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-6 text-center text-slate-500"
                                    >
                                        Data absensi belum di-generate. Pastikan
                                        rapat sudah dimulai.
                                    </td>
                                </tr>
                            ) : (
                                attendances.map((attendance) => (
                                    <tr
                                        key={attendance.id}
                                        className="hover:bg-slate-50 transition"
                                    >
                                        <td className="p-4 font-medium">
                                            {attendance.user?.name ||
                                                "User Dihapus"}
                                        </td>
                                        <td className="p-4 text-xs font-mono text-slate-400">
                                            {attendance.qr_code_token.substring(
                                                0,
                                                15,
                                            )}
                                            ...
                                        </td>
                                        <td className="p-4 text-sm">
                                            {attendance.status ===
                                                "pending" && (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">
                                                    Pending
                                                </span>
                                            )}
                                            {attendance.status === "hadir" && (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                                                    Hadir
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-medium">
                                            {formatTime(attendance.scanned_at)}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleSetHadirClick(
                                                        attendance.id,
                                                    )
                                                }
                                                disabled={
                                                    attendance.status ===
                                                    "hadir"
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                    attendance.status ===
                                                    "hadir"
                                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                        : "bg-slate-800 text-white hover:bg-slate-700 shadow-sm"
                                                }`}
                                            >
                                                Set Hadir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* POP-UP MODAL KONFIRMASI SET HADIR MANUAL   */}
            {/* ========================================== */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            {/* Icon Checklist Hijau */}
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mb-4">
                                <svg
                                    className="h-7 w-7 text-emerald-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Tandai Hadir?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Apakah kamu yakin ingin menandai anggota ini
                                sebagai "Hadir" secara manual?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setSelectedAttendanceId(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmSetHadir}
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                                >
                                    Ya, Hadirkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
