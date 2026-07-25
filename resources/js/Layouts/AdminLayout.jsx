import { useState } from "react";
import Sidebar from "@/Components/Admin/Sidebar";
import Header from "@/Components/Admin/Header";
import Footer from "@/Components/Admin/Footer";

export default function AdminLayout({ user, children }) {
    // State untuk kontrol sidebar (Default terbuka di desktop)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Overlay gelap untuk mobile saat sidebar terbuka */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Component */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Area Konten Utama (Bergeser jika sidebar terbuka) */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative ${
                    isSidebarOpen ? "lg:ml-64" : "ml-0"
                }`}
            >
                {/* Kirim fungsi toggle ke Header */}
                <Header
                    user={user}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Area Main dengan tambahan efek visual */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
                    {/* --- DEKORASI BACKGROUND MULAI DARI SINI --- */}

                    {/* 1. Gradient halus di bagian atas (indigo memudar ke transparan) */}
                    <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-indigo-50/80 via-slate-50/50 to-transparent -z-10 pointer-events-none"></div>

                    {/* 2. Pola Titik (Dot Grid) yang sangat tipis agar tidak polos */}
                    <div
                        className="absolute inset-0 -z-20 pointer-events-none opacity-[0.35]"
                        style={{
                            backgroundImage:
                                "radial-gradient(#cbd5e1 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    ></div>

                    {/* --- DEKORASI BACKGROUND SELESAI --- */}

                    {/* Kontainer children diberi padding agar rapi */}
                    <div className="p-4 md:p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
