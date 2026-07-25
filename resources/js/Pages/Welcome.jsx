import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { Link } from "@inertiajs/react";

export default function Welcome({ posts }) {
    return (
        <LandingPageLayout title="Beranda - Karang Taruna Putra Giyanti">
            {/* HERO SECTION */}
            <section className="relative bg-indigo-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 flex flex-col items-center text-center">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/30 text-indigo-100 text-sm font-semibold mb-6 border border-indigo-400/30 backdrop-blur-sm">
                        Selamat Datang di Website Resmi
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-tight">
                        Wadah Berkreasi & Mengabdi Pemuda{" "}
                        <span className="text-amber-400">Putra Giyanti</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-10 leading-relaxed">
                        Mewujudkan pemuda yang aktif, kreatif, dan inovatif
                        dalam memajukan lingkungan serta menjaga silaturahmi
                        antar warga.
                    </p>
                    <a
                        href="#informasi"
                        className="px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-bold hover:bg-slate-50 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
                    >
                        Lihat Informasi Terbaru ↓
                    </a>
                </div>
            </section>

            {/* INFORMASI SECTION */}
            <section
                id="informasi"
                className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-16"
            >
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Kegiatan & Informasi Terbaru
                    </h2>
                    <div className="w-20 h-1.5 bg-indigo-600 rounded-full mx-auto mt-4 mb-4"></div>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Update seputar acara, rapat, dan pengumuman penting dari
                        Karang Taruna Putra Giyanti.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                            >
                                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                                    {post.image ? (
                                        <img
                                            src={`/storage/${post.image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 border-b border-slate-200">
                                            <svg
                                                className="w-12 h-12 opacity-50"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                ></path>
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 shadow-sm">
                                        {new Date(
                                            post.created_at,
                                        ).toLocaleDateString("id-ID", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                        {post.content}
                                    </p>
                                    <Link
                                        href={route("post.show", post.slug)}
                                        className="inline-flex items-center text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition"
                                    >
                                        Baca Selengkapnya
                                        <span className="ml-1 group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-slate-100 rounded-3xl shadow-sm">
                            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                📭
                            </div>
                            <p className="text-lg font-medium text-slate-600">
                                Belum ada informasi yang dipublikasikan.
                            </p>
                            <p className="text-sm mt-1">
                                Nantikan pembaruan informasi dari kami
                                selanjutnya.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </LandingPageLayout>
    );
}
