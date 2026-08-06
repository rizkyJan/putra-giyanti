import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { Link } from "@inertiajs/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { useMemo, useState } from "react";

const logoMeanings = [
    {
        id: "bentuk",
        number: "01",
        title: "Bentuk Logo",
        summary:
            "Mengambil inspirasi dari lambang Keraton Yogyakarta dan Keraton Surakarta.",
        descriptions: [
            "Nama Putra Giyanti berkaitan dengan sejarah Perjanjian Giyanti yang menjadi salah satu cikal bakal terbentuknya Kesultanan Yogyakarta dan Kasunanan Surakarta.",
            "Bentuk dasar logo mengambil inspirasi dari dua lambang keraton tersebut sebagai pengingat sejarah yang berada dekat dengan wilayah Desa Janti.",
        ],
        points: [
            {
                x: 494,
                y: 228,
                marker: "1",
                label: "Bentuk dasar logo",
            },
        ],
    },
    {
        id: "mahkota",
        number: "02",
        title: "Mahkota dan Bunga Teratai",
        summary:
            "Bunga teratai yang mulai mekar menggambarkan remaja dengan semangat sosial.",
        descriptions: [
            "Pada bagian atas logo terdapat bunga teratai yang mulai mekar.",
            "Bunga tersebut melambangkan unsur remaja yang dijiwai semangat kemasyarakatan dan kepedulian sosial.",
        ],
        points: [
            {
                x: 320,
                y: 108,
                marker: "2",
                label: "Mahkota dan bunga teratai",
            },
        ],
    },
    {
        id: "empat-daun",
        number: "03",
        title: "Empat Helai Daun Bunga",
        summary: "Melambangkan empat fungsi utama Karang Taruna.",
        descriptions: [
            "Empat helai daun bunga di bagian bawah melambangkan empat fungsi Karang Taruna.",
        ],
        bullets: [
            "Memupuk kreativitas untuk belajar bertanggung jawab.",
            "Membina kegiatan sosial, rekreatif, edukatif, ekonomis produktif, dan kegiatan praktis lainnya.",
            "Mengembangkan dan mewujudkan harapan serta cita-cita anak dan remaja melalui bimbingan dan interaksi secara individual maupun kelompok.",
            "Menanamkan pengertian, kesadaran, penghayatan, dan pengamalan Pancasila.",
        ],
        points: [
            {
                x: 320,
                y: 169,
                marker: "3",
                label: "Empat helai daun bagian bawah",
            },
        ],
    },
    {
        id: "tujuh-daun",
        number: "04",
        title: "Tujuh Helai Daun Bunga",
        summary: "Melambangkan tujuh unsur kepribadian anak dan remaja.",
        descriptions: [
            "Tujuh helai daun bunga di bagian atas menggambarkan tujuh kepribadian yang perlu dimiliki anak dan remaja.",
        ],
        bullets: [
            "Taat: bertakwa kepada Tuhan Yang Maha Esa.",
            "Tanggap: penuh perhatian dan peka terhadap masalah.",
            "Tanggon: kuat serta memiliki daya tahan fisik dan mental.",
            "Tandas: tegas, pasti, tidak ragu, dan teguh pendirian.",
            "Tangkas: sigap, gesit, cepat bergerak, dan dinamis.",
            "Terampil: mampu berkreasi dan menghasilkan karya praktis.",
            "Tulus: sederhana, ikhlas, rela memberi, dan jujur.",
        ],
        points: [
            {
                x: 320,
                y: 132,
                marker: "4",
                label: "Tujuh helai daun bagian atas",
            },
        ],
    },
    {
        id: "kapas-padi",
        number: "05",
        title: "Kapas dan Padi",
        summary: "Melambangkan sandang, pangan, kesusilaan, dan kesejahteraan.",
        descriptions: [
            "Kapas melambangkan sandang, sedangkan padi melambangkan pangan.",
            "Sandang menjadi cerminan makna kesusilaan. Filosofi tersebut mengingatkan bahwa keluhuran sikap dan kesusilaan lebih utama daripada sekadar mencari rezeki.",
        ],
        points: [
            {
                x: 142,
                y: 428,
                marker: "K",
                label: "Kapas",
            },
            {
                x: 518,
                y: 432,
                marker: "P",
                label: "Padi",
            },
        ],
    },
    {
        id: "aksara",
        number: "06",
        title: "Tulisan Aksara Jawa",
        summary: "Tulisan ꦗꦤ꧀ꦠꦶ dibaca Janti.",
        descriptions: [
            "Tulisan aksara Jawa yang digunakan adalah ꦗꦤ꧀ꦠꦶ.",
            "Tulisan tersebut dibaca “Janti”, yaitu nama desa tempat Karang Taruna Putra Giyanti tumbuh dan bergerak.",
        ],
        points: [
            {
                x: 319,
                y: 340,
                marker: "6",
                label: "Aksara Jawa Janti",
            },
        ],
    },
    {
        id: "warna",
        number: "07",
        title: "Arti Warna",
        summary:
            "Putih, merah, dan kuning memiliki makna karakter yang berbeda.",
        descriptions: [
            "Warna dalam logo tidak hanya berfungsi sebagai unsur visual, tetapi juga membawa nilai dan harapan bagi anggota Putra Giyanti.",
        ],
        bullets: [
            "Putih: kesucian, tidak tercela, dan tidak ternoda.",
            "Merah: keberanian, kesabaran, ketenangan, kemampuan mengendalikan diri, dan tekad pantang mundur.",
            "Kuning: keagungan dan keluhuran budi pekerti.",
        ],
        points: [
            {
                x: 320,
                y: 494,
                marker: "7",
                label: "Warna logo",
            },
        ],
    },
];

function ArrowLeftIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
                d="M19 12H5m6 6-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function InformationIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path
                d="M12 10v6m0-9h.01"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function FilosofiLogo() {
    const reduceMotion = useReducedMotion();

    const [activeId, setActiveId] = useState("mahkota");
    const [hoveredPointKey, setHoveredPointKey] = useState(null);

    const activeMeaning =
        logoMeanings.find((item) => item.id === activeId) ?? logoMeanings[0];

    const hotspots = useMemo(
        () =>
            logoMeanings.flatMap((meaning) =>
                meaning.points.map((point, index) => ({
                    ...point,
                    id: meaning.id,
                    title: meaning.title,
                    summary: meaning.summary,
                    key: `${meaning.id}-${index}`,
                })),
            ),
        [],
    );

    const hoveredPoint = hotspots.find(
        (point) => point.key === hoveredPointKey,
    );

    function activatePoint(point) {
        setActiveId(point.id);
    }

    function handlePointKeyDown(event, point) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activatePoint(point);
        }
    }

    return (
        <LandingPageLayout title="Filosofi Logo - Putra Giyanti">
            {/* HEADER */}
            <section className="relative isolate overflow-hidden bg-[#3b0509]">
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at 16% 20%, rgba(253,224,71,.16), transparent 28%), radial-gradient(circle at 85% 35%, rgba(255,255,255,.08), transparent 24%), linear-gradient(125deg,#310407 0%,#610a12 55%,#8b1019 100%)",
                    }}
                />

                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)",
                        backgroundSize: "70px 70px",
                    }}
                />

                <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-red-50/70 transition hover:text-amber-300"
                        >
                            <ArrowLeftIcon />
                            Kembali ke beranda
                        </Link>
                    </motion.div>

                    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: 0.08,
                            }}
                        >
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">
                                Identitas Putra Giyanti
                            </p>

                            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                                Filosofi di balik setiap bagian logo.
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-8 text-red-50/75 sm:text-lg">
                                Arahkan kursor atau tekan titik pada logo untuk
                                mengetahui arti dari setiap bagiannya.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: 0.18,
                            }}
                            className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-5 text-red-50/80 backdrop-blur-md sm:p-6"
                        >
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                                Dasar Nama
                            </p>

                            <p className="mt-3 leading-7">
                                Nama Putra Giyanti berkaitan dengan sejarah
                                Perjanjian Giyanti yang menjadi bagian dari
                                cikal bakal terbentuknya Kesultanan Yogyakarta
                                dan Kasunanan Surakarta.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* INTERACTIVE LOGO */}
            <section className="overflow-hidden bg-[#fffaf3] py-14 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                        {/* LOGO */}
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.65 }}
                        >
                            <div className="relative rounded-[2rem] border border-red-900/10 bg-white p-4 shadow-[0_25px_70px_rgba(75,10,17,.10)] sm:p-8">
                                <div className="relative mx-auto aspect-square w-full max-w-[640px]">
                                    <svg
                                        viewBox="0 0 640 640"
                                        className="h-full w-full"
                                        role="img"
                                        aria-labelledby="logo-title logo-description"
                                    >
                                        <title id="logo-title">
                                            Logo Karang Taruna Putra Giyanti
                                        </title>

                                        <desc id="logo-description">
                                            Logo interaktif dengan titik yang
                                            dapat dipilih untuk melihat
                                            filosofinya.
                                        </desc>

                                        <defs>
                                            <filter
                                                id="markerShadow"
                                                x="-80%"
                                                y="-80%"
                                                width="260%"
                                                height="260%"
                                            >
                                                <feDropShadow
                                                    dx="0"
                                                    dy="4"
                                                    stdDeviation="5"
                                                    floodColor="#450a0a"
                                                    floodOpacity="0.35"
                                                />
                                            </filter>
                                        </defs>

                                        <image
                                            href="/images/putragiyanti.png"
                                            x="0"
                                            y="0"
                                            width="640"
                                            height="640"
                                            preserveAspectRatio="xMidYMid meet"
                                        />

                                        {hotspots.map((point) => {
                                            const isActive =
                                                activeId === point.id;

                                            return (
                                                <g
                                                    key={point.key}
                                                    transform={`translate(${point.x} ${point.y})`}
                                                    role="button"
                                                    tabIndex="0"
                                                    aria-label={`Lihat arti ${point.label}`}
                                                    className="cursor-pointer outline-none"
                                                    onClick={() =>
                                                        activatePoint(point)
                                                    }
                                                    onMouseEnter={() => {
                                                        setHoveredPointKey(
                                                            point.key,
                                                        );
                                                        activatePoint(point);
                                                    }}
                                                    onMouseLeave={() =>
                                                        setHoveredPointKey(null)
                                                    }
                                                    onFocus={() => {
                                                        setHoveredPointKey(
                                                            point.key,
                                                        );
                                                        activatePoint(point);
                                                    }}
                                                    onBlur={() =>
                                                        setHoveredPointKey(null)
                                                    }
                                                    onKeyDown={(event) =>
                                                        handlePointKeyDown(
                                                            event,
                                                            point,
                                                        )
                                                    }
                                                >
                                                    {/* Area klik lebih besar */}
                                                    <circle
                                                        r="34"
                                                        fill="transparent"
                                                    />

                                                    {isActive && (
                                                        <motion.circle
                                                            r="28"
                                                            fill="none"
                                                            stroke="#facc15"
                                                            strokeWidth="3"
                                                            initial={{
                                                                opacity: 0,
                                                                scale: 0.75,
                                                            }}
                                                            animate={
                                                                reduceMotion
                                                                    ? {
                                                                          opacity: 0.8,
                                                                      }
                                                                    : {
                                                                          opacity:
                                                                              [
                                                                                  0.2,
                                                                                  0.85,
                                                                                  0.2,
                                                                              ],
                                                                          scale: [
                                                                              0.8,
                                                                              1.16,
                                                                              0.8,
                                                                          ],
                                                                      }
                                                            }
                                                            transition={{
                                                                duration: 1.8,
                                                                repeat: reduceMotion
                                                                    ? 0
                                                                    : Infinity,
                                                            }}
                                                        />
                                                    )}

                                                    <circle
                                                        r="20"
                                                        fill={
                                                            isActive
                                                                ? "#facc15"
                                                                : "#ffffff"
                                                        }
                                                        stroke={
                                                            isActive
                                                                ? "#7f1d1d"
                                                                : "#991b1b"
                                                        }
                                                        strokeWidth="3"
                                                        filter="url(#markerShadow)"
                                                    />

                                                    <text
                                                        textAnchor="middle"
                                                        dominantBaseline="central"
                                                        fill="#450a0a"
                                                        fontSize="13"
                                                        fontWeight="900"
                                                        pointerEvents="none"
                                                    >
                                                        {point.marker}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* TOOLTIP DESKTOP */}
                                    <AnimatePresence>
                                        {hoveredPoint && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 8,
                                                    scale: 0.96,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: 6,
                                                    scale: 0.97,
                                                }}
                                                transition={{
                                                    duration: 0.18,
                                                }}
                                                className="pointer-events-none absolute z-30 hidden w-64 -translate-x-1/2 -translate-y-[calc(100%+20px)] rounded-xl border border-white/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-md md:block"
                                                style={{
                                                    left: `${
                                                        (hoveredPoint.x / 640) *
                                                        100
                                                    }%`,
                                                    top: `${
                                                        (hoveredPoint.y / 640) *
                                                        100
                                                    }%`,
                                                }}
                                            >
                                                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                                                    {hoveredPoint.label}
                                                </p>

                                                <p className="mt-2 text-sm font-bold">
                                                    {hoveredPoint.title}
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-white/70">
                                                    {hoveredPoint.summary}
                                                </p>

                                                <span className="absolute bottom-[-7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-slate-950" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold leading-6 text-amber-950 sm:hidden">
                                    Tekan salah satu titik pada logo untuk
                                    menampilkan keterangannya.
                                </div>
                            </div>

                            {/* PILIHAN BAGIAN */}
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {logoMeanings.map((item) => {
                                    const isActive = activeId === item.id;

                                    return (
                                        <button
                                            type="button"
                                            key={item.id}
                                            onClick={() => setActiveId(item.id)}
                                            aria-pressed={isActive}
                                            className={`rounded-xl border px-3 py-3 text-left transition ${
                                                isActive
                                                    ? "border-red-800 bg-red-800 text-white shadow-lg"
                                                    : "border-red-900/10 bg-white text-slate-700 hover:border-red-800/30 hover:bg-red-50"
                                            }`}
                                        >
                                            <span
                                                className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                                                    isActive
                                                        ? "text-amber-300"
                                                        : "text-red-800"
                                                }`}
                                            >
                                                {item.number}
                                            </span>

                                            <span className="mt-1 block text-xs font-bold leading-5">
                                                {item.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* DETAIL */}
                        <div className="lg:sticky lg:top-28">
                            <AnimatePresence mode="wait">
                                <motion.article
                                    key={activeMeaning.id}
                                    initial={{
                                        opacity: 0,
                                        x: 20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: -12,
                                    }}
                                    transition={{
                                        duration: reduceMotion ? 0 : 0.3,
                                    }}
                                    className="overflow-hidden rounded-[2rem] border border-red-900/10 bg-white shadow-[0_24px_70px_rgba(75,10,17,.10)]"
                                >
                                    <div className="bg-gradient-to-br from-[#4a060b] via-[#740d15] to-[#991b1b] p-6 text-white sm:p-8">
                                        <div className="flex items-start justify-between gap-5">
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                                                    Bagian{" "}
                                                    {activeMeaning.number}
                                                </p>

                                                <h2 className="mt-3 text-2xl font-black tracking-[-0.025em] sm:text-3xl">
                                                    {activeMeaning.title}
                                                </h2>
                                            </div>

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-300">
                                                <InformationIcon />
                                            </div>
                                        </div>

                                        <p className="mt-5 leading-7 text-red-50/80">
                                            {activeMeaning.summary}
                                        </p>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                                            {activeMeaning.descriptions.map(
                                                (description, index) => (
                                                    <p
                                                        key={`${activeMeaning.id}-description-${index}`}
                                                    >
                                                        {description}
                                                    </p>
                                                ),
                                            )}
                                        </div>

                                        {activeMeaning.bullets &&
                                            activeMeaning.bullets.length >
                                                0 && (
                                                <ol className="mt-6 space-y-3">
                                                    {activeMeaning.bullets.map(
                                                        (bullet, index) => (
                                                            <li
                                                                key={`${activeMeaning.id}-bullet-${index}`}
                                                                className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                                                            >
                                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black text-red-800">
                                                                    {index + 1}
                                                                </span>

                                                                <span>
                                                                    {bullet}
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ol>
                                            )}

                                        {activeMeaning.id === "aksara" && (
                                            <div className="mt-7 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-center">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">
                                                    Aksara Jawa
                                                </p>

                                                <p className="mt-4 font-['Noto_Sans_Javanese',sans-serif] text-4xl font-bold leading-relaxed text-red-900 sm:text-5xl">
                                                    ꦗꦤ꧀ꦠꦶ
                                                </p>

                                                <p className="mt-3 font-black text-slate-900">
                                                    Janti
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.article>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* PENUTUP */}
            <section className="bg-[#f1eee9] py-14 sm:py-20">
                <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-red-800">
                            Putra Giyanti
                        </p>

                        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                            Logo sebagai identitas, nilai, dan pengingat
                            tanggung jawab bersama.
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
                            Setiap bagian logo membawa harapan agar pemuda Putra
                            Giyanti tumbuh menjadi pribadi yang aktif, kreatif,
                            peduli, dan berguna untuk masyarakat.
                        </p>

                        <Link
                            href="/"
                            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-red-800 px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-red-900"
                        >
                            <ArrowLeftIcon />
                            Kembali ke beranda
                        </Link>
                    </motion.div>
                </div>
            </section>
        </LandingPageLayout>
    );
}
