import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ auth, posts }) {
    const { flash } = usePage().props;

    // State untuk Pop-up Konfirmasi Hapus
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    // Fungsi untuk membuka modal hapus
    const handleDeleteClick = (id) => {
        setPostToDelete(id);
        setShowDeleteModal(true);
    };

    // Fungsi eksekusi hapus
    const confirmDelete = () => {
        if (postToDelete) {
            router.delete(route("admin.posts.destroy", postToDelete), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                },
            });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Manajemen Informasi & Acara" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                    Informasi & Publikasi
                </h3>
                <Link
                    href={route("admin.posts.create")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                >
                    + Tambah Informasi
                </Link>
            </div>

            {/* Notifikasi Flash Message */}
            {flash?.message && (
                <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium">
                    {flash.message}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                <th className="p-4 font-semibold w-16">No</th>
                                <th className="p-4 font-semibold w-24">
                                    Gambar
                                </th>
                                <th className="p-4 font-semibold">
                                    Judul Informasi
                                </th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Tanggal</th>
                                <th className="p-4 font-semibold text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {!posts.data || posts.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-6 text-center text-slate-500"
                                    >
                                        Belum ada data informasi publik.
                                    </td>
                                </tr>
                            ) : (
                                posts.data.map((post, index) => (
                                    <tr
                                        key={post.id}
                                        className="hover:bg-slate-50 transition"
                                    >
                                        <td className="p-4 text-slate-500 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="p-4">
                                            {post.image_url ||
                                            (post.images_urls && post.images_urls[0]) ? (
                                                <img
                                                    src={
                                                        post.image_url ||
                                                        post.images_urls[0]
                                                    }
                                                    alt={post.title}
                                                    className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 italic border border-slate-200">
                                                    Kosong
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">
                                            {post.title}
                                        </td>
                                        <td className="p-4 text-sm">
                                            {post.status === "publish" ? (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase border border-emerald-200">
                                                    Publish
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase border border-amber-200">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(
                                                post.created_at,
                                            ).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2 items-center flex-wrap max-w-[200px] mx-auto">
                                            <Link
                                                href={route(
                                                    "admin.posts.edit",
                                                    post.id,
                                                )}
                                                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-200 transition flex-1 text-center"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(post.id)
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
            {/* MODAL KONFIRMASI HAPUS INFORMASI */}
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
                                Hapus Informasi?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Informasi
                                atau berita ini akan dihapus secara permanen
                                dari website.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPostToDelete(null);
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
        </AdminLayout>
    );
}
