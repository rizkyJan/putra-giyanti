import MemberLayout from "@/Layouts/MemberLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Dashboard({ auth, upcomingMeetings }) {
    // State untuk mengontrol Modal QR
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    // Fungsi mengecek waktu (menentukan tombol aktif atau tidak)
    const checkIsTime = (date, time) => {
        if (!date || !time) return false;
        const meetingDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        return now >= meetingDateTime;
    };

    // Fungsi saat tombol absen diklik
    const handleAbsenClick = (meeting) => {
        setSelectedMeeting(meeting);
        setShowQRModal(true);
    };

    return (
        <MemberLayout user={auth.user} header="Beranda Anggota">
            <Head title="Dashboard Anggota" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6 bg-gradient-to-br from-white to-indigo-50/30">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                    Halo, {auth.user.name}! 👋
                </h1>
                <p className="text-slate-600">
                    Selamat datang di portal anggota Karang Taruna. Pantau
                    jadwal rapat dan kelola kehadiranmu di sini.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>🗓️</span> Agenda Rapat Mendatang
                    </h3>
                </div>

                <div className="p-6">
                    {upcomingMeetings && upcomingMeetings.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Belum ada jadwal rapat dalam waktu dekat.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingMeetings.map((meeting) => {
                                // Tombol aktif jika sudah waktunya ATAU jika status rapat sudah 'ongoing'
                                const isTime =
                                    checkIsTime(meeting.date, meeting.time) ||
                                    meeting.status === "ongoing";

                                return (
                                    <div
                                        key={meeting.id}
                                        className="p-5 border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-300 transition group bg-white flex flex-col justify-between"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition">
                                                {meeting.title}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                                {meeting.description ||
                                                    "Tidak ada deskripsi."}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-500">
                                                    📅
                                                </span>
                                                <span className="font-medium">
                                                    {meeting.date}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-500">
                                                    ⏰
                                                </span>
                                                <span className="font-medium">
                                                    {meeting.time} WIB
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-indigo-500">
                                                    📍
                                                </span>
                                                <span className="font-medium truncate">
                                                    {meeting.location || "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            {isTime ? (
                                                <button
                                                    onClick={() =>
                                                        handleAbsenClick(
                                                            meeting,
                                                        )
                                                    }
                                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
                                                >
                                                    Mulai Absen (Tampilkan QR)
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full py-2 bg-slate-100 text-slate-400 font-semibold rounded-lg text-sm cursor-not-allowed"
                                                >
                                                    Belum Waktunya Absen
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal QR Code */}
            {showQRModal && selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                                Absensi Rapat
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                {selectedMeeting.title}
                            </p>

                            {/* AREA QR CODE ASLI */}
                            <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center mb-6 border-2 border-slate-200">
                                {/* 
                                   Kita pakai tag <img> dan memanggil API Generator QR.
                                   Datanya diambil dari qr_code_token. Jika token dari controller belum masuk,
                                   sistem akan otomatis membuat fallback token unik dari ID rapat dan ID user.
                                */}
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${
                                        selectedMeeting.attendance
                                            ?.qr_code_token ||
                                        `token-rapat-${selectedMeeting.id}-user-${auth.user.id}`
                                    }`}
                                    alt="QR Code Absensi"
                                    className="w-48 h-48 object-contain rounded-lg shadow-sm bg-white p-2"
                                />
                                <span className="text-sm font-medium text-slate-600 mt-4">
                                    Tunjukkan QR Code ini ke Admin
                                </span>
                            </div>

                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MemberLayout>
    );
}
