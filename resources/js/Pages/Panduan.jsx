import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { motion, useReducedMotion } from "motion/react";
import React from "react";

const steps = [
    {
        id: "1",
        title: "Navigasi & Menu Utama",
        description:
            "Gunakan ikon garis tiga (☰) di pojok kanan atas layar HP Anda untuk membuka menu. Dari sana, Anda dapat berpindah ke berbagai halaman dengan mudah.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        ),
    },
    {
        id: "2",
        title: "Membaca Informasi Terbuka",
        description:
            "Tanpa perlu masuk (login), Anda bisa menggulir layar ke bawah di halaman utama untuk melihat 'Kabar Putra Giyanti' dan membaca detail setiap agenda desa.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 2v7h7"
                />
            </svg>
        ),
    },
    {
        id: "3",
        title: "Masuk (Login) Anggota",
        description:
            "Buka menu (☰) dan pilih opsi 'Masuk'. Fitur ini dikhususkan bagi anggota untuk mendapatkan akses ke informasi internal, laporan, dan fitur khusus.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
            </svg>
        ),
    },
    {
        id: "4",
        title: "Scan Kehadiran Arisan",
        description:
            "Setelah berhasil login, Anda dapat menggunakan menu 'Scan' yang memanfaatkan kamera HP Anda untuk mencatat daftar hadir kegiatan arisan secara otomatis dan akurat.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
            </svg>
        ),
    },
];

export default function Panduan() {
    const reduceMotion = useReducedMotion();

    return (
        <LandingPageLayout title="Panduan - Karang Taruna Putra Giyanti">
            {/* HERO SECTION - Tampilan Premium */}
            <section className="relative isolate overflow-hidden bg-[#3b0509] pt-20 pb-24 sm:pt-28 sm:pb-32">
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at 50% 100%, rgba(253,230,138,0.15), transparent 60%), linear-gradient(180deg, #300407 0%, #57090f 100%)",
                    }}
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                        maskImage:
                            "linear-gradient(to bottom, black, transparent 90%)",
                    }}
                />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-200 backdrop-blur-md"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300"></span>
                        </span>
                        Pusat Bantuan
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="mt-8 text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl"
                    >
                        Panduan Penggunaan
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-red-50/80 sm:text-lg"
                    >
                        Pelajari langkah-langkah mengakses informasi umum, masuk
                        ke sistem, hingga melakukan pemindaian (scan) daftar
                        hadir melalui perangkat Anda.
                    </motion.p>
                </div>
            </section>

            {/* TIMELINE SECTION - Desain Baru yang sangat Estetik */}
            <section className="relative bg-[#f9f8f6] py-20 sm:py-32 overflow-hidden">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        {/* Garis Vertikal Tengah (Desktop) / Kiri (Mobile) */}
                        <div className="absolute left-[39px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-300 via-red-900/20 to-transparent lg:left-1/2 lg:-translate-x-1/2" />

                        <div className="space-y-16 lg:space-y-24">
                            {steps.map((step, index) => {
                                const isEven = index % 2 === 0;

                                return (
                                    <div
                                        key={step.id}
                                        className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between"
                                    >
                                        {/* Spacer untuk Desktop (sisi kosong) */}
                                        <div
                                            className={`hidden lg:block w-[45%] ${isEven ? "order-1" : "order-3"}`}
                                        ></div>

                                        {/* Indikator Angka di Tengah/Kiri */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileInView={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            viewport={{
                                                once: true,
                                                amount: 0.5,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.1,
                                            }}
                                            className="absolute left-[16px] lg:left-1/2 flex h-12 w-12 lg:-translate-x-1/2 items-center justify-center rounded-full border-[6px] border-[#f9f8f6] bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg lg:order-2 z-10"
                                        >
                                            <span className="text-lg font-black text-red-950">
                                                {step.id}
                                            </span>
                                        </motion.div>

                                        {/* Kartu Konten */}
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                x: reduceMotion
                                                    ? 0
                                                    : isEven
                                                      ? 50
                                                      : -50,
                                                y: 30,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                x: 0,
                                                y: 0,
                                            }}
                                            viewport={{
                                                once: true,
                                                amount: 0.2,
                                            }}
                                            transition={{
                                                duration: 0.7,
                                                delay: index * 0.15,
                                                ease: "easeOut",
                                            }}
                                            className={`w-full pl-24 lg:pl-0 lg:w-[45%] ${isEven ? "order-3" : "order-1"}`}
                                        >
                                            <div className="group relative rounded-3xl bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(139,16,25,0.08)] hover:border-red-100">
                                                {/* Ikon besar di pojok kartu */}
                                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-800 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-100">
                                                    {step.icon}
                                                </div>

                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                    {step.title}
                                                </h3>

                                                <p className="mt-4 text-base leading-relaxed text-slate-600">
                                                    {step.description}
                                                </p>

                                                {/* Efek Glow menyala saat dihover */}
                                                <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-300 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
                                            </div>
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* BANNER PENUTUP - Desain 3D Modern */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="relative mt-24 sm:mt-32 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-red-900 to-red-950 px-6 py-16 text-center shadow-2xl sm:px-16"
                    >
                        {/* Lingkaran dekorasi abstrak di banner */}
                        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-800 blur-3xl opacity-50" />
                        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500 blur-3xl opacity-20" />

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-white sm:text-4xl">
                                Sudah Memahami Panduannya?
                            </h3>
                            <p className="mx-auto mt-4 max-w-xl text-lg text-red-100/80">
                                Saatnya mengeksplorasi informasi dan kegiatan
                                terbaru dari Karang Taruna Putra Giyanti.
                            </p>
                            <a
                                href="/"
                                className="mt-10 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-8 py-4 font-black text-red-950 shadow-[0_10px_25px_rgba(251,191,36,0.3)] transition-all hover:bg-amber-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(251,191,36,0.4)]"
                            >
                                Kembali ke Beranda
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </LandingPageLayout>
    );
}
