import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { motion } from "motion/react";
import React from "react";

// Komponen Card dengan desain interaktif
function MemberCard({ title, members, delay = 0, variant = "default" }) {
    // Styling berdasarkan level kepengurusan
    const styles = {
        pelindung:
            "border-amber-400/40 ring-4 ring-amber-400/20 bg-gradient-to-br from-[#260305] via-[#4b070c] to-[#7f1018] shadow-[0_18px_45px_rgba(127,16,24,0.22)]",

        pembina:
            "border-amber-500/30 ring-4 ring-amber-500/20 bg-gradient-to-br from-slate-900 via-[#3b0509] to-[#600810] shadow-[0_15px_40px_rgba(251,191,36,0.15)]",

        ketua: "border-amber-300 ring-4 ring-amber-500/10 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 shadow-amber-900/10",

        inti: "border-red-200 ring-4 ring-red-900/5 bg-gradient-to-br from-red-50/80 via-white to-rose-50/50 shadow-red-900/10",

        default:
            "border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50",
    };

    const badgeStyles = {
        pelindung:
            "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 text-[#3b0509] shadow-lg shadow-amber-500/30",

        pembina:
            "bg-gradient-to-r from-amber-200 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/30",

        ketua: "bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-md shadow-amber-500/20",

        inti: "bg-gradient-to-r from-red-700 to-red-900 text-white shadow-md shadow-red-900/20",

        default: "bg-white text-slate-700 border border-slate-200 shadow-sm",
    };

    // Mode gelap untuk Pelindung dan Pembina
    const isDark = variant === "pembina" || variant === "pelindung";

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, scale: 1.015 }}
            className={`relative flex flex-col items-center rounded-[2rem] border p-7 sm:p-9 transition-all duration-500 ${styles[variant]} group z-10 hover:z-20`}
        >
            {/* Efek cahaya saat hover */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-white/0 to-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            {/* Label jabatan */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative mb-8 inline-flex px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.25em] ${badgeStyles[variant]}`}
            >
                {title}
            </motion.div>

            {/* Daftar nama */}
            <div className="flex flex-wrap justify-center gap-3 relative z-10">
                {members.map((name, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.07, y: -3 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                        }}
                        className={`group/chip flex cursor-default items-center gap-2.5 rounded-xl border px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md ${
                            isDark
                                ? "border-white/10 bg-white/10 hover:bg-white/20 hover:border-amber-400"
                                : "border-slate-200/80 bg-white hover:border-amber-400"
                        }`}
                    >
                        <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300 ${
                                isDark
                                    ? "bg-black/20 text-amber-200 group-hover/chip:bg-amber-400 group-hover/chip:text-slate-900"
                                    : "bg-slate-100 text-slate-400 group-hover/chip:bg-amber-100 group-hover/chip:text-amber-700"
                            }`}
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>

                        <span
                            className={`text-sm font-bold transition-colors duration-300 ${
                                isDark
                                    ? "text-amber-50 group-hover/chip:text-white"
                                    : "text-slate-700 group-hover/chip:text-slate-950"
                            }`}
                        >
                            {name}
                        </span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

export default function Pengurus() {
    return (
        <LandingPageLayout title="Susunan Pengurus - Karang Taruna Putra Giyanti">
            {/* HERO SECTION */}
            <section className="relative isolate overflow-hidden bg-[#3b0509]">
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at 12% 15%, rgba(255,211,94,.13), transparent 26%), radial-gradient(circle at 83% 25%, rgba(255,255,255,.08), transparent 21%), linear-gradient(122deg,#300407 0%,#57090f 48%,#8b1019 100%)",
                    }}
                />

                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.105]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)",
                        backgroundSize: "72px 72px",
                        maskImage:
                            "linear-gradient(to bottom, black, transparent 92%)",
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center sm:py-32 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-100 backdrop-blur-md"
                    >
                        <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(253,224,71,.9)]" />
                        Karang Taruna Putra Giyanti
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.75,
                            delay: 0.08,
                        }}
                        className="text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl md:text-6xl"
                    >
                        Susunan{" "}
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
                            Pengurus
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.18,
                        }}
                        className="mx-auto mt-6 max-w-2xl text-base leading-8 text-red-50/80 sm:text-lg"
                    >
                        Mengenal lebih dekat formasi penggerak kegiatan pemuda
                        dan masyarakat di lingkungan Putra Giyanti.
                    </motion.p>
                </div>
            </section>

            {/* KONTEN PENGURUS */}
            <section className="bg-[#fffaf3] py-20 sm:py-28 relative overflow-hidden">
                {/* Ornamen background */}
                <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-amber-200/30 blur-[100px]" />

                <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[600px] w-[600px] rounded-full bg-red-200/20 blur-[120px]" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ================================================== */}
                    {/* 1. PELINDUNG WILAYAH */}
                    {/* ================================================== */}
                    <div className="mb-24">
                        <div className="text-center mb-10">
                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-red-900">
                                Pelindung Wilayah
                            </h2>

                            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-red-800" />
                        </div>

                        {/* RW 08 - paling atas */}
                        <div className="max-w-3xl mx-auto mb-6">
                            <MemberCard
                                title="RW 08"
                                members={["Mulyanto Gendut"]}
                                variant="pelindung"
                                delay={0.1}
                            />
                        </div>

                        {/* RT 05 & RT 06 */}
                        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                            <MemberCard
                                title="RT 05"
                                members={["Wahyono"]}
                                variant="pelindung"
                                delay={0.2}
                            />

                            <MemberCard
                                title="RT 06"
                                members={["Daryanto"]}
                                variant="pelindung"
                                delay={0.3}
                            />
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* 2. PEMBINA */}
                    {/* ================================================== */}
                    <div className="mb-24">
                        <div className="text-center mb-10">
                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-amber-600">
                                Penasihat & Pembina
                            </h2>

                            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-amber-500/30" />
                        </div>

                        <div className="max-w-3xl mx-auto">
                            <MemberCard
                                title="Pembina"
                                members={["Joko Sutarjo"]}
                                variant="pembina"
                                delay={0.1}
                            />
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* 3. PENGURUS INTI */}
                    {/* ================================================== */}
                    <div className="mb-24">
                        <div className="text-center mb-12">
                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-red-800">
                                Pengurus Inti
                            </h2>

                            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-red-800/20" />
                        </div>

                        {/* Ketua & Wakil Ketua */}
                        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-6">
                            <MemberCard
                                title="Ketua"
                                members={["Danang Jaya Satria", "Amir"]}
                                variant="ketua"
                                delay={0.2}
                            />

                            <MemberCard
                                title="Wakil Ketua"
                                members={["Novia", "Eva Merita"]}
                                variant="inti"
                                delay={0.3}
                            />
                        </div>

                        {/* Sekretaris & Bendahara */}
                        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                            <MemberCard
                                title="Sekretaris"
                                members={["Gendis", "Annisa Miftahul Jannah"]}
                                variant="inti"
                                delay={0.4}
                            />

                            <MemberCard
                                title="Bendahara"
                                members={[
                                    "Rossi Dela Melani",
                                    "Rizky Januar Afrizal",
                                ]}
                                variant="inti"
                                delay={0.5}
                            />
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* 4. DIVISI / SEKSI */}
                    {/* ================================================== */}
                    <div>
                        <div className="text-center mb-12">
                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">
                                Bidang & Seksi
                            </h2>

                            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-slate-200" />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* HUMAS */}
                            <MemberCard
                                title="Humas"
                                members={[
                                    "Ramadhani Budi Junior",
                                    "Raditya Fajar Maryance",
                                    "Diki",
                                    "Onki",
                                    "Jacquline",
                                    "Nabila",
                                    "Laily",
                                ]}
                                delay={0.1}
                            />

                            {/* PERLENGKAPAN */}
                            <MemberCard
                                title="Perlengkapan (Perkap)"
                                members={[
                                    "Imam Prasetyo Jati Pranoto",
                                    "Drean Milyawan",
                                    "Kholbun Salim",
                                    "Riski Gendut",
                                ]}
                                delay={0.2}
                            />

                            {/* SINOMAN */}
                            <MemberCard
                                title="PJ Sinoman"
                                members={[
                                    "Febriyanti Hanung Pratiwi",
                                    "Azizah",
                                    "Wiwit",
                                ]}
                                delay={0.3}
                            />

                            {/* DEKORASI */}
                            <MemberCard
                                title="PJ Dekorasi"
                                members={[
                                    "Danang Jaya Satria",
                                    "Jimmy",
                                    "Seluruh Anggota",
                                ]}
                                delay={0.4}
                            />

                            {/* INFORMASI */}
                            <MemberCard
                                title="Informasi"
                                members={["Anggun"]}
                                delay={0.5}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </LandingPageLayout>
    );
}
