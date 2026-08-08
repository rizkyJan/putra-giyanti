import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { Link } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";

export default function PostDetail({ post }) {
    // Label Dinamis
    const typeLabel =
        post.type === "dokumentasi"
            ? "Dokumentasi Kegiatan"
            : "Pengumuman Publik";
    const typeColor =
        post.type === "dokumentasi"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-indigo-50 text-indigo-700 border-indigo-100";

    return (
        <LandingPageLayout
            title={`${post.title} - Karang Taruna Putra Giyanti`}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Link
                    href="/#informasi"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mb-8 transition-colors bg-indigo-50 px-4 py-2 rounded-xl text-sm"
                >
                    ← Kembali ke Beranda
                </Link>

                <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header Artikel */}
                    <div className="p-8 md:p-12 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-6 font-medium">
                            <span
                                className={`px-3 py-1 rounded-md border ${typeColor}`}
                            >
                                {typeLabel}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                📅{" "}
                                {new Date(post.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    },
                                )}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 leading-[1.2]">
                            {post.title}
                        </h1>
                    </div>

                    {/* Jika Tipe Informasi -> Tampilkan 1 Gambar (Utuh / object-contain) */}
                    {post.type === "informasi" && post.image && (
                        <div className="w-full bg-[#f8fafc] flex justify-center border-b border-slate-100">
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full max-h-[600px] object-contain"
                            />
                        </div>
                    )}

                    {/* Jika Tipe Dokumentasi -> Tampilkan Grid Banyak Gambar (Rapi / object-cover) */}
                    {post.type === "dokumentasi" &&
                        post.images_urls &&
                        post.images_urls.length > 0 && (
                            <div className="w-full bg-slate-50 p-6 md:p-10 border-b border-slate-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {post.images_urls.map((img, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-black/5"
                                        >
                                            <img
                                                src={img}
                                                alt={`${post.title} - ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Isi Konten Artikel */}
                    <div className="p-8 md:p-12 bg-white">
                        <div className="prose prose-lg prose-indigo max-w-none text-slate-600 leading-relaxed">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                </article>
            </div>
        </LandingPageLayout>
    );
}
