import LandingPageLayout from "@/Layouts/LandingPageLayout";
import { Link } from "@inertiajs/react";

export default function PostDetail({ post }) {
    return (
        <LandingPageLayout
            title={`${post.title} - Karang Taruna Putra Giyanti`}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Link
                    href="/#informasi"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mb-8 transition-colors bg-indigo-50 px-4 py-2 rounded-xl text-sm"
                >
                    ← Kembali ke Daftar Informasi
                </Link>

                <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header Artikel */}
                    <div className="p-8 md:p-12 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-6 font-medium">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md border border-indigo-100">
                                Pengumuman Publik
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

                    {/* Gambar Artikel (Jika Ada) */}
                    {post.image && (
                        <div className="w-full bg-slate-100">
                            <img
                                src={`/storage/${post.image}`}
                                alt={post.title}
                                className="w-full max-h-[500px] object-cover"
                            />
                        </div>
                    )}

                    {/* Isi Konten Artikel */}
                    <div className="p-8 md:p-12 bg-white">
                        <div className="prose prose-lg prose-indigo max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>
                    </div>
                </article>
            </div>
        </LandingPageLayout>
    );
}
