import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function Sidebar({ isOpen }) {
    const { url } = usePage();

    // State untuk mengontrol menu yang terbuka
    const [activeMenu, setActiveMenu] = useState("");

    const isActive = (path) => url.startsWith(path);

    // Fungsi untuk toggle menu
    const toggleMenu = (menu) => {
        setActiveMenu(activeMenu === menu ? "" : menu);
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 shadow-xl transition-transform duration-300 ease-in-out transform flex flex-col
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
            <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800 shrink-0">
                <span className="text-xl font-bold text-white tracking-wider">
                    PUTRA GIYANTI
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
                {/* Menu Dashboard (Single) */}
                <Link
                    href={route("admin.dashboard")}
                    className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 group ${
                        isActive("/admin/dashboard") || url === "/admin"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "hover:bg-slate-800 hover:text-white"
                    }`}
                >
                    <span>🏠</span>
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* --- GROUP 1: DATA ORGANISASI --- */}
                <div>
                    <button
                        onClick={() => toggleMenu("organisasi")}
                        className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span>👥</span>
                            <span className="font-medium text-sm">
                                Data Organisasi
                            </span>
                        </div>
                        <span
                            className={`transform transition-transform ${activeMenu === "organisasi" || isActive("/admin/users") ? "rotate-90" : ""}`}
                        >
                            ▶
                        </span>
                    </button>
                    {/* Sub-menu */}
                    <div
                        className={`mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1 transition-all overflow-hidden ${activeMenu === "organisasi" || isActive("/admin/users") ? "block" : "hidden"}`}
                    >
                        <Link
                            href={route("admin.users.index")}
                            className={`block py-2 px-4 rounded-lg text-sm transition-colors ${
                                isActive("/admin/users")
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            }`}
                        >
                            Manajemen Anggota
                        </Link>
                    </div>
                </div>

                {/* --- GROUP 2: MANAJEMEN KEGIATAN --- */}
                <div>
                    <button
                        onClick={() => toggleMenu("kegiatan")}
                        className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span>📅</span>
                            <span className="font-medium text-sm">
                                Kegiatan & Absensi
                            </span>
                        </div>
                        <span
                            className={`transform transition-transform ${activeMenu === "kegiatan" || isActive("/admin/meetings") || isActive("/admin/attendances") ? "rotate-90" : ""}`}
                        >
                            ▶
                        </span>
                    </button>
                    {/* Sub-menu */}
                    <div
                        className={`mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1 transition-all overflow-hidden ${activeMenu === "kegiatan" || isActive("/admin/meetings") || isActive("/admin/attendances") ? "block" : "hidden"}`}
                    >
                        <Link
                            href={route("admin.meetings.index")}
                            className={`block py-2 px-4 rounded-lg text-sm transition-colors ${
                                isActive("/admin/meetings")
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            }`}
                        >
                            Manajemen Rapat
                        </Link>
                        <Link
                            href={route("admin.attendances.index")}
                            className={`block py-2 px-4 rounded-lg text-sm transition-colors ${
                                isActive("/admin/attendances")
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            }`}
                        >
                            Data Kehadiran
                        </Link>
                    </div>
                </div>

                {/* --- GROUP 3: PUBLIKASI --- */}
                <div>
                    <button
                        onClick={() => toggleMenu("publikasi")}
                        className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span>📢</span>
                            <span className="font-medium text-sm">
                                Publikasi Publik
                            </span>
                        </div>
                        <span
                            className={`transform transition-transform ${activeMenu === "publikasi" || isActive("/admin/posts") ? "rotate-90" : ""}`}
                        >
                            ▶
                        </span>
                    </button>
                    {/* Sub-menu */}
                    <div
                        className={`mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1 transition-all overflow-hidden ${activeMenu === "publikasi" || isActive("/admin/posts") ? "block" : "hidden"}`}
                    >
                        <Link
                            href={route("admin.posts.index")}
                            className={`block py-2 px-4 rounded-lg text-sm transition-colors ${
                                isActive("/admin/posts")
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            }`}
                        >
                            Informasi & Acara
                        </Link>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
