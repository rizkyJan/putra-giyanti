import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ auth, users }) {
    const { flash } = usePage().props;

    // State untuk Modal Hapus
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // State untuk Modal Status (Aktif/Nonaktif)
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);

    // --- FUNGSI UNTUK HAPUS ---
    const handleDeleteClick = (id) => {
        setUserToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route("admin.users.destroy", userToDelete), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    // --- FUNGSI UNTUK UBAH STATUS ---
    const handleStatusClick = (user) => {
        setUserToToggle(user);
        setShowStatusModal(true);
    };

    const confirmStatusChange = () => {
        if (userToToggle) {
            router.patch(
                route("admin.users.toggle-status", userToToggle.id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowStatusModal(false);
                        setUserToToggle(null);
                    },
                },
            );
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Manajemen Anggota" />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                    Manajemen Anggota
                </h3>
                <Link
                    href={route("admin.users.create")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                    + Tambah Anggota
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                                <th className="p-4 font-semibold">Nama</th>
                                <th className="p-4 font-semibold">Kontak</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold text-center">
                                    Status
                                </th>
                                <th className="p-4 font-semibold text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="p-6 text-center text-slate-500"
                                    >
                                        Belum ada data anggota.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50 transition"
                                    >
                                        <td className="p-4 font-medium">
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div>{user.email}</div>
                                            <div className="text-slate-400">
                                                {user.whatsapp_number || "-"}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {/* Label status diubah menjadi tombol */}
                                            <button
                                                onClick={() =>
                                                    handleStatusClick(user)
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:shadow-md transition-all ${user.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}
                                                title={`Klik untuk ${user.is_active ? "menonaktifkan" : "mengaktifkan"} anggota ini`}
                                            >
                                                {user.is_active
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </button>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <Link
                                                href={route(
                                                    "admin.users.edit",
                                                    user.id,
                                                )}
                                                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-200 transition"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(user.id)
                                                }
                                                className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-200 transition"
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

            {/* Modal Konfirmasi Ubah Status (BARU) */}
            {showStatusModal && userToToggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div
                                className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${userToToggle.is_active ? "bg-rose-100" : "bg-emerald-100"}`}
                            >
                                {userToToggle.is_active ? (
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
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="h-7 w-7 text-emerald-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {userToToggle.is_active
                                    ? "Nonaktifkan Akun?"
                                    : "Aktifkan Akun?"}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                {userToToggle.is_active
                                    ? `Apakah Anda yakin ingin menonaktifkan ${userToToggle.name}? Mereka tidak akan bisa masuk ke dalam sistem.`
                                    : `Apakah Anda yakin ingin mengaktifkan ${userToToggle.name}? Mereka akan diberi akses masuk ke dalam sistem.`}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setUserToToggle(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmStatusChange}
                                    className={`flex-1 px-4 py-2.5 font-semibold rounded-xl text-white transition-colors shadow-sm ${userToToggle.is_active ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"}`}
                                >
                                    Ya,{" "}
                                    {userToToggle.is_active
                                        ? "Nonaktifkan"
                                        : "Aktifkan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus (LAMA - Tetap Dipertahankan) */}
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
                                Hapus Anggota?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Semua data
                                terkait anggota ini mungkin akan terhapus.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
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
