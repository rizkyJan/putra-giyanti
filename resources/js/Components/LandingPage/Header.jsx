import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo & Nama Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            href="/"
                            className="flex items-center gap-3 group"
                        >
                            {/* Gambar Logo Transparan */}
                            <img
                                src="/images/putragiyanti.png"
                                alt="Logo Putra Giyanti"
                                className="h-10 md:h-12 w-auto object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                            />

                            {/* Teks Brand */}
                            <span className="font-extrabold text-xl text-slate-800 tracking-tight group-hover:text-red-900 transition-colors duration-300">
                                PUTRA GIYANTI
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        <Link
                            href="/"
                            className="text-slate-600 hover:text-red-800 font-medium transition-colors"
                        >
                            Beranda
                        </Link>
                        <a
                            href="/#informasi"
                            className="text-slate-600 hover:text-red-800 font-medium transition-colors"
                        >
                            Informasi & Kegiatan
                        </a>
                        {/* TAMBAHAN MENU SUSUNAN PENGURUS */}
                        <Link
                            href={route("pengurus")}
                            className="text-slate-600 hover:text-red-800 font-medium transition-colors"
                        >
                            Susunan Pengurus
                        </Link>

                        <Link
                            href={route("login")}
                            className="px-5 py-2.5 bg-[#7B0E16] text-white rounded-xl font-semibold hover:bg-[#5B090F] transition-all shadow-sm shadow-red-900/20"
                        >
                            Masuk Sistem
                        </Link>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link
                            href="/"
                            className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Beranda
                        </Link>
                        <a
                            href="/#informasi"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Informasi & Kegiatan
                        </a>
                        {/* TAMBAHAN MENU SUSUNAN PENGURUS MOBILE */}
                        <Link
                            href={route("pengurus")}
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Susunan Pengurus
                        </Link>

                        <div className="pt-4 border-t border-slate-100 mt-2">
                            <Link
                                href={route("login")}
                                className="block w-full text-center px-5 py-3 bg-[#7B0E16] text-white rounded-xl font-semibold hover:bg-[#5B090F] transition-colors"
                            >
                                Masuk Sistem
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
