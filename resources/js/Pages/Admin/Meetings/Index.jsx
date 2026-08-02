import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import QRScanner from "@/Components/QRScanner";

export default function Index({ auth, meetings }) {
    const { flash } = usePage().props;

    // State untuk Scanner
    const [showScanner, setShowScanner] = useState(false);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [scanResult, setScanResult] = useState({ type: null, message: null });

    // State untuk Modal Hapus, Mulai, Akhiri, dan Buka Lagi
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState(null);

    const [showStartModal, setShowStartModal] = useState(false);
    const [meetingToStart, setMeetingToStart] = useState(null);

    const [showEndModal, setShowEndModal] = useState(false);
    const [meetingToEnd, setMeetingToEnd] = useState(null);

    const [showResumeModal, setShowResumeModal] = useState(false);
    const [meetingToResume, setMeetingToResume] = useState(null);

    // ================== HAPUS RAPAT ==================
    const handleDeleteClick = (id) => {
        setMeetingToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (meetingToDelete) {
            router.delete(route("admin.meetings.destroy", meetingToDelete), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setMeetingToDelete(null);
                },
            });
        }
    };

    // ================== MULAI RAPAT ==================
    const handleStartClick = (id) => {
        setMeetingToStart(id);
        setShowStartModal(true);
    };

    const confirmStart = () => {
        if (meetingToStart) {
            router.post(
                route("admin.meetings.start", meetingToStart),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowStartModal(false);
                        setMeetingToStart(null);
                    },
                },
            );
        }
    };

    // ================== AKHIRI RAPAT ==================
    const handleEndClick = (id) => {
        setMeetingToEnd(id);
        setShowEndModal(true);
    };

    const confirmEnd = () => {
        if (meetingToEnd) {
            router.post(
                route("admin.meetings.end", meetingToEnd),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowEndModal(false);
                        setMeetingToEnd(null);
                    },
                },
            );
        }
    };

    // ================== BUKA LAGI RAPAT ==================
    const handleResumeClick = (id) => {
        setMeetingToResume(id);
        setShowResumeModal(true);
    };

    const confirmResume = () => {
        if (meetingToResume) {
            router.post(
                route("admin.meetings.resume", meetingToResume),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowResumeModal(false);
                        setMeetingToResume(null);
                    },
                },
            );
        }
    };

    // ================== SCANNER ==================
    const handleOpenScanner = (meeting) => {
        setActiveMeeting(meeting);
        setShowScanner(true);
        setScanResult({ type: null, message: null });
    };

    const playBeep = () => {
        try {
            const audioCtx = new (
                window.AudioContext || window.webkitAudioContext
            )();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
            console.log("Browser tidak mendukung suara");
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                >
                    + Buat Agenda
                </Link>
            </div>

            {/* Notifikasi */}
            {!showScanner && flash?.success && (
                <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium">
                    {flash.success}
                </div>
            )}
            {!showScanner && flash?.error && (
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
                                <th className="p-4 font-semibold text-center w-[280px]">
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
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase border border-emerald-200">
                                                    Sedang Berlangsung
                                                </span>
                                            )}
                                            {meeting.status === "completed" && (
                                                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase border border-rose-200">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5 w-full">
                                                {/* ================= AKSI SCHEDULED ================= */}
                                                {meeting.status ===
                                                    "scheduled" && (
                                                    <button
                                                        onClick={() =>
                                                            handleStartClick(
                                                                meeting.id,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition w-full shadow-sm"
                                                    >
                                                        🚀 Mulai Rapat
                                                    </button>
                                                )}

                                                {/* ================= AKSI ONGOING ================= */}
                                                {meeting.status ===
                                                    "ongoing" && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleOpenScanner(
                                                                    meeting,
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition w-full flex justify-center items-center gap-1 shadow-sm"
                                                        >
                                                            📷 Buka Scanner
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEndClick(
                                                                    meeting.id,
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition w-full shadow-sm"
                                                        >
                                                            ⏹️ Akhiri Rapat
                                                        </button>
                                                    </>
                                                )}

                                                {/* ================= AKSI COMPLETED ================= */}
                                                {meeting.status ===
                                                    "completed" && (
                                                    <button
                                                        onClick={() =>
                                                            handleResumeClick(
                                                                meeting.id,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 transition w-full shadow-sm"
                                                    >
                                                        🔓 Buka Lagi Absensi
                                                    </button>
                                                )}

                                                {/* Tombol Edit & Hapus (Selalu ada) */}
                                                <div className="flex gap-1.5 mt-1">
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
                                                            handleDeleteClick(
                                                                meeting.id,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-200 transition flex-1"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL KONFIRMASI MULAI RAPAT */}
            {/* ========================================== */}
            {showStartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-100 mb-4">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Mulai Rapat Sekarang?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Sistem akan men-generate QR Code absen untuk
                                semua anggota.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowStartModal(false);
                                        setMeetingToStart(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmStart}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                                >
                                    Ya, Mulai
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL KONFIRMASI AKHIRI RAPAT */}
            {/* ========================================== */}
            {showEndModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-orange-100 mb-4">
                                <span className="text-2xl">⏹️</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Akhiri Rapat?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Sesi absensi akan ditutup. Anggota tidak akan
                                bisa scan QR Code lagi.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowEndModal(false);
                                        setMeetingToEnd(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmEnd}
                                    className="flex-1 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600"
                                >
                                    Akhiri Rapat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL KONFIRMASI BUKA LAGI RAPAT */}
            {/* ========================================== */}
            {showResumeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-cyan-100 mb-4">
                                <span className="text-2xl">🔓</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Buka Lagi Absensi?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Status rapat akan kembali "Berlangsung". Anggota
                                yang telat bisa scan QR Code kembali.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowResumeModal(false);
                                        setMeetingToResume(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmResume}
                                    className="flex-1 px-4 py-2.5 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700"
                                >
                                    Ya, Buka Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL KONFIRMASI HAPUS RAPAT */}
            {/* ========================================== */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 mb-4">
                                <span className="text-2xl">🗑️</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Hapus Agenda Rapat?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Semua data
                                absensi terkait juga akan terhapus.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setMeetingToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFIKASI SCANNER */}
            {scanResult.message && (
                <div
                    className={`fixed top-8 left-1/2 -translate-x-1/2 z-[99999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm w-11/12 max-w-md text-center transition-all duration-300 animate-in fade-in slide-in-from-top-8 border-2 ${
                        scanResult.type === "success"
                            ? "bg-emerald-500 text-white border-emerald-300"
                            : scanResult.type === "error"
                              ? "bg-rose-600 text-white border-rose-400"
                              : "bg-indigo-500 text-white border-indigo-300 animate-pulse"
                    }`}
                >
                    {scanResult.message}
                </div>
            )}

            {/* MODAL SCANNER KAMERA */}
            {showScanner && activeMeeting && (
                <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col relative">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 z-[60]">
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

                        <div className="p-0 bg-black relative flex flex-col">
                            <QRScanner
                                onScanSuccess={(token) => {
                                    setScanResult({
                                        type: "loading",
                                        message: "Memproses QR Code...",
                                    });
                                    router.post(
                                        route("admin.attendances.scan"),
                                        {
                                            meeting_id: activeMeeting.id,
                                            qr_code_token: token,
                                        },
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                            onSuccess: (page) => {
                                                const serverFlash =
                                                    page.props.flash;
                                                const serverErrors =
                                                    page.props.errors;
                                                if (serverFlash?.success) {
                                                    setScanResult({
                                                        type: "success",
                                                        message:
                                                            serverFlash.success,
                                                    });
                                                    playBeep();
                                                } else if (serverFlash?.error) {
                                                    setScanResult({
                                                        type: "error",
                                                        message:
                                                            serverFlash.error,
                                                    });
                                                } else if (
                                                    serverErrors &&
                                                    Object.keys(serverErrors)
                                                        .length > 0
                                                ) {
                                                    setScanResult({
                                                        type: "error",
                                                        message:
                                                            serverErrors[
                                                                Object.keys(
                                                                    serverErrors,
                                                                )[0]
                                                            ],
                                                    });
                                                } else {
                                                    setScanResult({
                                                        type: "success",
                                                        message:
                                                            "✅ Berhasil memproses absen!",
                                                    });
                                                    playBeep();
                                                }
                                                setTimeout(
                                                    () =>
                                                        setScanResult({
                                                            type: null,
                                                            message: null,
                                                        }),
                                                    3000,
                                                );
                                            },
                                            onError: () => {
                                                setScanResult({
                                                    type: "error",
                                                    message:
                                                        "❌ Terjadi kesalahan pada server",
                                                });
                                                setTimeout(
                                                    () =>
                                                        setScanResult({
                                                            type: null,
                                                            message: null,
                                                        }),
                                                    3000,
                                                );
                                            },
                                        },
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
