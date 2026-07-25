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

    // State untuk Pop-up Hapus Rapat
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState(null);

    // State untuk Pop-up Mulai Rapat
    const [showStartModal, setShowStartModal] = useState(false);
    const [meetingToStart, setMeetingToStart] = useState(null);

    // ==========================================
    // FUNGSI UNTUK HAPUS RAPAT
    // ==========================================
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

    // ==========================================
    // FUNGSI UNTUK MULAI RAPAT
    // ==========================================
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

    // ==========================================
    // FUNGSI UNTUK SCANNER
    // ==========================================
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
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
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

            {/* Notifikasi halaman utama */}
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
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase border border-emerald-200">
                                                    Sedang Berlangsung
                                                </span>
                                            )}
                                            {meeting.status === "completed" && (
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase border border-indigo-200">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2 items-center flex-wrap max-w-[250px] mx-auto">
                                            {meeting.status === "scheduled" && (
                                                <button
                                                    onClick={() =>
                                                        handleStartClick(
                                                            meeting.id,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition w-full mb-1 shadow-sm"
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
                                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition w-full mb-1 flex justify-center items-center gap-1 shadow-sm"
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
                                                    handleDeleteClick(
                                                        meeting.id,
                                                    )
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

            {/* ========================================== */}
            {/* MODAL KONFIRMASI MULAI RAPAT */}
            {/* ========================================== */}
            {showStartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-100 mb-4">
                                <svg
                                    className="h-7 w-7 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Mulai Rapat Sekarang?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Sistem akan men-generate QR Code absen unik
                                untuk semua anggota. Pastikan semua persiapan
                                sudah selesai.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowStartModal(false);
                                        setMeetingToStart(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmStart}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                                >
                                    Ya, Mulai
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
                                <svg
                                    className="h-7 w-7 text-rose-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Hapus Agenda Rapat?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Semua data
                                absensi yang terkait dengan rapat ini juga akan
                                terhapus.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setMeetingToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* TOAST NOTIFIKASI SCANNER FIXED AREA */}
            {/* ========================================== */}
            {scanResult.message && (
                <div
                    className={`fixed top-8 left-1/2 -translate-x-1/2 z-[99999] px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-bold text-[16px] w-11/12 max-w-md text-center transition-all duration-300 animate-in fade-in slide-in-from-top-8 border-2 ${
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

            {/* ========================================== */}
            {/* MODAL SCANNER KAMERA */}
            {/* ========================================== */}
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

                                                setTimeout(() => {
                                                    setScanResult({
                                                        type: null,
                                                        message: null,
                                                    });
                                                }, 3000);
                                            },
                                            onError: (err) => {
                                                console.error(
                                                    "Gagal hit server:",
                                                    err,
                                                );
                                                setScanResult({
                                                    type: "error",
                                                    message:
                                                        "❌ Terjadi kesalahan pada server",
                                                });

                                                setTimeout(() => {
                                                    setScanResult({
                                                        type: null,
                                                        message: null,
                                                    });
                                                }, 3000);
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
