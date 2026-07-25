import { useState } from "react";
import { Link } from "@inertiajs/react";

export default function Header({ user, toggleSidebar }) {
    // State untuk mengontrol tampilan modal logout
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="flex justify-between items-center px-4 md:px-6 h-16">
                    {/* Kiri: Tombol Hamburger & Judul */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
                            Panel Admin
                        </h2>
                    </div>

                    {/* Kanan: Profil User & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-700 font-medium hidden md:block">
                                {user?.name}
                            </span>
                        </div>

                        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

                        {/* Tombol pemicu modal logout */}
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 text-sm font-semibold rounded-xl hover:bg-rose-100 transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                ></path>
                            </svg>
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Pop-up Modal Konfirmasi Logout */}
            {showLogoutModal && (
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
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    ></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Keluar Aplikasi
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Apakah kamu yakin ingin mengakhiri sesi ini dan
                                keluar?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200"
                                >
                                    Ya, Keluar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
