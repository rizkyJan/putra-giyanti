import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { Link } from "@inertiajs/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, PresentationControls, useGLTF } from "@react-three/drei";
import { motion, useReducedMotion } from "motion/react";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// --- 1. GLOBAL ERROR CATCHER (UNTUK MELIHAT BUG DI LAYAR HP) ---
class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMsg: "", errorStack: "" };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            errorMsg: error.toString(),
            errorStack: errorInfo.componentStack,
        });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-red-600">
                    <h1 className="mb-4 text-2xl font-black">
                        🚨 Bug Terdeteksi!
                    </h1>
                    <p className="mb-4 text-center font-bold text-slate-700">
                        Tolong screenshot layar ini agar kita tahu penyebab
                        blank putihnya:
                    </p>
                    <div className="w-full max-w-lg overflow-auto rounded-xl border border-red-300 bg-red-50 p-4 font-mono text-[11px] leading-relaxed shadow-inner text-red-900">
                        <p className="font-bold border-b border-red-200 pb-2 mb-2">
                            Pesan Error:
                        </p>
                        <p className="mb-4">{this.state.errorMsg}</p>
                        <p className="font-bold border-b border-red-200 pb-2 mb-2">
                            Lokasi (Stack):
                        </p>
                        <pre className="whitespace-pre-wrap">
                            {this.state.errorStack}
                        </pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const MODEL_URL = "/models/logo-putra-giyanti.glb";

const programs = [
    {
        number: "01",
        title: "Kegiatan Warga",
        description:
            "Kerja bakti, kegiatan sosial, olahraga, dan acara lingkungan yang dikerjakan bersama.",
    },
    {
        number: "02",
        title: "Ruang Pemuda",
        description:
            "Tempat menyampaikan ide, belajar mengelola kegiatan, dan memperkuat kebersamaan.",
    },
    {
        number: "03",
        title: "Informasi Terbuka",
        description:
            "Agenda, pengumuman, dan dokumentasi kegiatan yang dapat diakses dengan mudah.",
    },
];

function getPostImageUrl(image) {
    if (!image) return null;
    if (/^https?:\/\//i.test(image)) return image;
    if (image.startsWith("/")) return image;
    return `/storage/${image}`;
}

function formatPostDate(date) {
    if (!date) return "";
    try {
        const safeDate =
            typeof date === "string" ? date.replace(/-/g, "/") : date;
        const parsedDate = new Date(safeDate);
        if (Number.isNaN(parsedDate.getTime())) return "";

        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(parsedDate);
    } catch (e) {
        return "";
    }
}

function ArrowIcon({ className = "h-4 w-4" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-5-5 5 5-5 5"
            />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 3v3m10-3v3M4.5 9h15M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5Z"
            />
        </svg>
    );
}

function ImagePlaceholder() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-[#eee9e2] text-slate-400">
            <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                    d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                />
            </svg>
        </div>
    );
}

function PostImage({ src, alt, className = "" }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) return <ImagePlaceholder />;
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.045] ${className}`}
        />
    );
}

function LogoModel({ reduceMotion }) {
    const group = useRef(null);
    const { scene: originalScene } = useGLTF(MODEL_URL);

    const scene = useMemo(() => {
        if (!originalScene) return new THREE.Scene();
        const clonedScene = originalScene.clone(true);

        clonedScene.traverse((object) => {
            if (!object.isMesh) return;
            const oldMaterial = object.material;
            const materialName = oldMaterial?.name?.toLowerCase() ?? "";
            const map = oldMaterial?.map ?? null;

            if (map) {
                map.colorSpace = THREE.SRGBColorSpace;
                map.anisotropy = 1;
                map.needsUpdate = true;
            }

            if (materialName.includes("gold")) {
                object.material = new THREE.MeshStandardMaterial({
                    color: "#f4b73b",
                    metalness: 0.6,
                    roughness: 0.3,
                });
                return;
            }

            if (
                materialName.includes("edge") ||
                object.name === "edge" ||
                object.name === "back"
            ) {
                object.material = new THREE.MeshStandardMaterial({
                    color: "#52070c",
                    metalness: 0.2,
                    roughness: 0.4,
                });
                return;
            }

            object.material = new THREE.MeshStandardMaterial({
                map,
                color: "#ffffff",
                transparent: oldMaterial?.transparent ?? false,
                opacity: oldMaterial?.opacity ?? 1,
                alphaTest: oldMaterial?.alphaTest ?? 0,
                side: oldMaterial?.side ?? THREE.FrontSide,
                metalness: 0.1,
                roughness: 0.3,
            });
        });

        return clonedScene;
    }, [originalScene]);

    useEffect(() => {
        return () => {
            scene.traverse((object) => {
                if (!object.isMesh) return;
                object.material?.dispose?.();
            });
        };
    }, [scene]);

    useFrame((state, delta) => {
        if (!group.current || reduceMotion) return;
        const time = state.clock.getElapsedTime();
        const targetRotationY =
            state.pointer.x * 0.15 + Math.sin(time * 0.52) * 0.035;
        const targetRotationX = -state.pointer.y * 0.08 + 0.025;
        const easing = Math.min(1, delta * 3.8);

        group.current.rotation.y +=
            (targetRotationY - group.current.rotation.y) * easing;
        group.current.rotation.x +=
            (targetRotationX - group.current.rotation.x) * easing;
        group.current.position.y = Math.sin(time * 0.85) * 0.045;
    });

    return (
        <group
            ref={group}
            scale={0.94}
            position={[0, -0.02, 0]}
            rotation={[0.025, 0, 0]}
        >
            <primitive object={scene} />
        </group>
    );
}

function ModelLoader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3 text-white/70">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-300" />
                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em]">
                    Memuat logo
                </span>
            </div>
        </Html>
    );
}

function LogoScene() {
    const reduceMotion = useReducedMotion();
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // PERBAIKAN BUG SSR: Pastikan window/navigator ada sebelum dicek
        if (typeof window !== "undefined" && typeof navigator !== "undefined") {
            const checkIOS =
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" &&
                    navigator.maxTouchPoints > 1);
            setIsIOS(checkIOS);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.9,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto h-[420px] w-full max-w-[620px] sm:h-[520px] lg:h-[610px]"
        >
            <motion.div
                aria-hidden="true"
                animate={
                    reduceMotion
                        ? undefined
                        : {
                              scale: [0.96, 1.06, 0.96],
                              opacity: [0.35, 0.72, 0.35],
                          }
                }
                transition={{
                    duration: 5.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute inset-[13%]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(248,113,113,0.3) 0%, transparent 65%)",
                }}
            />

            <motion.div
                aria-hidden="true"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[8%] rounded-full border border-amber-200/20"
            >
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-200 shadow-[0_0_18px_rgba(253,230,138,.9)]" />
            </motion.div>

            <motion.div
                aria-hidden="true"
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[18%] rounded-full border border-dashed border-white/15"
            />

            <div
                className="absolute inset-x-[15%] bottom-[7%] h-16"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
                }}
            />

            {isIOS ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/images/putragiyanti.png"
                        alt="Logo Putra Giyanti"
                        className="w-56 sm:w-72 object-contain animate-pulse drop-shadow-2xl"
                    />
                </div>
            ) : (
                <Canvas
                    shadows={false}
                    dpr={[1, 1]} // Paksa resolusi standar agar tidak memberatkan Safari
                    camera={{
                        position: [0, 0, 7.4],
                        fov: 31,
                        near: 0.1,
                        far: 50,
                    }}
                    gl={{
                        alpha: true,
                        antialias: false,
                        powerPreference: "low-power",
                        preserveDrawingBuffer: false,
                    }}
                    className="relative z-10 cursor-grab active:cursor-grabbing"
                >
                    <ambientLight intensity={1.5} color="#ffffff" />
                    <directionalLight
                        position={[5, 8, 5]}
                        intensity={2.5}
                        color="#fff2d0"
                    />
                    <directionalLight
                        position={[-5, -2, -5]}
                        intensity={1}
                        color="#ff324f"
                    />
                    <pointLight
                        position={[0, 2, 4]}
                        intensity={3}
                        color="#ffc847"
                        distance={10}
                    />

                    <Suspense fallback={<ModelLoader />}>
                        <PresentationControls
                            global
                            cursor
                            snap
                            speed={1}
                            rotation={[0.02, 0, 0]}
                            polar={[-0.1, 0.15]}
                            azimuth={[-0.3, 0.3]}
                            config={{ mass: 1, tension: 150, friction: 20 }}
                        >
                            <Float
                                speed={reduceMotion ? 0 : 1}
                                rotationIntensity={reduceMotion ? 0 : 0.05}
                                floatIntensity={reduceMotion ? 0 : 0.15}
                            >
                                <LogoModel reduceMotion={reduceMotion} />
                            </Float>
                        </PresentationControls>
                    </Suspense>
                </Canvas>
            )}
        </motion.div>
    );
}

function StandardPostCard({ post, index }) {
    const imageUrl = getPostImageUrl(post.image);
    const formattedDate = formatPostDate(post.created_at);

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
            className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(15,23,42,.11)]"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <PostImage src={imageUrl} alt={post.title} />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                {formattedDate && (
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md">
                        <CalendarIcon />
                        {formattedDate}
                    </div>
                )}
            </div>
            <div className="flex flex-grow flex-col p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
                    Informasi
                </p>
                <h3 className="mt-3 line-clamp-2 text-xl font-black leading-snug text-slate-950 transition-colors group-hover:text-red-800">
                    {post.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-grow text-sm leading-7 text-slate-600">
                    {post.content}
                </p>
                <Link
                    href={route("post.show", post.slug)}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-red-800 transition hover:text-red-950"
                >
                    Baca selengkapnya <ArrowIcon />
                </Link>
            </div>
        </motion.article>
    );
}

export default function Welcome({ posts = [] }) {
    const reduceMotion = useReducedMotion();
    const postList = Array.isArray(posts) ? posts : [];

    return (
        // --- 2. BUNGKUS SELURUH HALAMAN AGAR ERROR TERTANGKAP ---
        <GlobalErrorBoundary>
            <LandingPageLayout title="Beranda - Karang Taruna Putra Giyanti">
                {/* HERO */}
                <section className="relative isolate overflow-hidden bg-[#3b0509]">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(circle at 12% 15%, rgba(255,211,94,.13), transparent 26%), radial-gradient(circle at 83% 25%, rgba(255,255,255,.08), transparent 21%), linear-gradient(122deg,#300407 0%,#57090f 48%,#8b1019 100%)",
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      x: ["-7%", "7%", "-7%"],
                                      y: ["0%", "5%", "0%"],
                                  }
                        }
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -left-52 top-10 h-[560px] w-[560px]"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(253,230,138,0.1) 0%, transparent 70%)",
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

                    <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-16">
                        <div className="order-2 text-center lg:order-1 lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55 }}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-100 backdrop-blur-md"
                            >
                                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(253,224,71,.9)]" />{" "}
                                Karang Taruna Desa Giyanti
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 26 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.08 }}
                                className="mt-6 text-4xl font-black leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-[4.45rem]"
                            >
                                Putra Giyanti{" "}
                                <span className="mt-3 block bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                    aktif di lingkungan sendiri.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.18 }}
                                className="mx-auto mt-6 max-w-2xl text-base leading-8 text-red-50/75 sm:text-lg lg:mx-0 lg:max-w-xl"
                            >
                                Lihat agenda, pengumuman, dan dokumentasi
                                kegiatan Karang Taruna Putra Giyanti dalam satu
                                tempat.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.27 }}
                                className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
                            >
                                <motion.a
                                    href="#informasi"
                                    whileHover={
                                        reduceMotion
                                            ? undefined
                                            : { y: -3, scale: 1.01 }
                                    }
                                    whileTap={
                                        reduceMotion
                                            ? undefined
                                            : { scale: 0.98 }
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 py-3.5 font-black text-red-950 shadow-[0_14px_38px_rgba(251,191,36,.2)] transition hover:bg-amber-200"
                                >
                                    Lihat kegiatan <ArrowIcon />
                                </motion.a>
                                <motion.a
                                    href="#program"
                                    whileHover={
                                        reduceMotion ? undefined : { y: -3 }
                                    }
                                    whileTap={
                                        reduceMotion
                                            ? undefined
                                            : { scale: 0.98 }
                                    }
                                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] px-6 py-3.5 font-bold text-white backdrop-blur-md transition hover:bg-white/[0.13]"
                                >
                                    Tentang Putra Giyanti
                                </motion.a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.42 }}
                                className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm font-semibold text-red-50/60 lg:justify-start"
                            >
                                {[
                                    "Kegiatan pemuda",
                                    "Informasi warga",
                                    "Dokumentasi acara",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                                        {item}
                                    </span>
                                ))}
                            </motion.div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <LogoScene />
                        </div>
                    </div>

                    <div className="relative z-10 border-t border-white/10 bg-black/10">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.23em] text-white/45 sm:px-6 sm:text-xs lg:px-8">
                            <span>Gotong Royong</span>
                            <span className="hidden h-1 w-1 rounded-full bg-amber-300 sm:block" />
                            <span>Kreatif</span>
                            <span className="hidden h-1 w-1 rounded-full bg-amber-300 sm:block" />
                            <span>Peduli</span>
                            <span className="hidden h-1 w-1 rounded-full bg-amber-300 sm:block" />
                            <span>Kompak</span>
                        </div>
                    </div>
                </section>

                {/* PROGRAM */}
                <section
                    id="program"
                    className="scroll-mt-24 overflow-hidden bg-[#fffaf3] py-16 sm:py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                            className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"
                        >
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
                                    Yang Kami Kerjakan
                                </p>
                                <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                    Kegiatan yang dekat dengan pemuda dan warga.
                                </h2>
                            </div>
                            <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
                                Putra Giyanti menjadi tempat pemuda ikut
                                mengambil peran, menyampaikan ide, dan
                                mengerjakan kegiatan bersama.
                            </p>
                        </motion.div>

                        <div className="mt-11 grid gap-5 md:grid-cols-3">
                            {programs.map((item, index) => (
                                <motion.article
                                    key={item.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                        duration: 0.55,
                                        delay: index * 0.08,
                                    }}
                                    whileHover={
                                        reduceMotion
                                            ? undefined
                                            : { y: -7, rotateX: 1.2 }
                                    }
                                    className="group relative overflow-hidden rounded-[1.5rem] border border-red-900/10 bg-white p-6 shadow-[0_12px_35px_rgba(68,9,14,.06)] transition-shadow hover:shadow-[0_22px_55px_rgba(68,9,14,.12)] sm:p-7"
                                >
                                    <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-amber-100/70 transition-transform duration-500 group-hover:scale-125" />
                                    <div className="relative flex items-center justify-between">
                                        <span className="text-sm font-black text-red-800">
                                            {item.number}
                                        </span>
                                        <span className="h-px w-12 bg-red-800/25 transition-all duration-300 group-hover:w-20" />
                                    </div>
                                    <h3 className="relative mt-8 text-xl font-black text-slate-950">
                                        {item.title}
                                    </h3>
                                    <p className="relative mt-3 leading-7 text-slate-600">
                                        {item.description}
                                    </p>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* INFORMASI */}
                <section
                    id="informasi"
                    className="scroll-mt-24 bg-[#f3f1ed] py-16 sm:py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.6 }}
                            className="mb-10 flex flex-col gap-4 sm:mb-12 lg:flex-row lg:items-end lg:justify-between"
                        >
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
                                    Kabar Putra Giyanti
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                    Kegiatan dan informasi terbaru
                                </h2>
                            </div>
                            <p className="max-w-xl leading-7 text-slate-600">
                                Pengumuman, agenda, dan dokumentasi kegiatan
                                terbaru Putra Giyanti.
                            </p>
                        </motion.div>

                        {postList.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {postList.map((post, index) => (
                                    <StandardPostCard
                                        key={post.id}
                                        post={post}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
                            >
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-800">
                                    <svg
                                        className="h-7 w-7"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 5.5h16v13H4v-13Zm0 3.5 8 5 8-5"
                                        />
                                    </svg>
                                </div>
                                <p className="mt-5 text-lg font-black text-slate-900">
                                    Belum ada informasi yang dipublikasikan.
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Informasi terbaru akan tampil di bagian ini.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </section>
            </LandingPageLayout>
        </GlobalErrorBoundary>
    );
}
