import { Link } from "@inertiajs/react";

export default function Sidebar({ isOpen, setIsOpen, user }) {
    return (
        <>
            {/* Overlay Background (Hanya aktif di Mobile saat Sidebar terbuka) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Area Sidebar - Selalu fixed agar bisa di-animasikan dengan translate */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-800 text-white flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                }`}
            >
                {/* Header Sidebar dengan Tombol X untuk Mobile */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700/50 shrink-0">
                    <span className="text-xl font-extrabold tracking-wider text-white">
                        PUTRA GIYANTI
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-lg transition"
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
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>

                {/* Navigasi Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link
                        href={route("member.dashboard")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                            route().current("member.dashboard")
                                ? "bg-indigo-900 text-white font-semibold shadow-inner"
                                : "text-indigo-100 hover:bg-indigo-700/50 hover:text-white"
                        }`}
                    >
                        <span>🏠</span>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                </nav>

                {/* Profil User di Bawah */}
                <div className="p-4 border-t border-indigo-700/50 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-indigo-500">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-semibold truncate w-full">
                                {user?.name || "Anggota"}
                            </p>
                            <p className="text-indigo-300 text-xs">Anggota</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
