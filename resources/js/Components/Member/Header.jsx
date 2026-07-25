import { useState } from "react";
import { Link } from "@inertiajs/react";

export default function Header({ setIsOpen, title }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 sticky top-0">
                <div className="flex items-center gap-4">
                    {/* Tombol Hamburger */}
                    <button
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg focus:outline-none transition-colors"
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
                            ></path>
                        </svg>
                    </button>
                    {title && (
                        <h2 className="text-lg font-bold text-slate-800 leading-tight hidden sm:block">
                            {title}
                        </h2>
                    )}
                </div>

                <div className="flex items-center">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="text-sm font-semibold text-rose-600 hover:text-white hover:bg-rose-600 px-4 py-2 rounded-xl transition-all duration-200"
                    >
                        Log Out
                    </button>
                </div>
            </header>

            {/* Pop-up Modal Konfirmasi Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
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
                                Konfirmasi
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Kamu yakin ingin keluar dari halaman anggota?
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
