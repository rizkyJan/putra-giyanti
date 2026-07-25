import { useState, useEffect } from "react";
import Sidebar from "@/Components/Member/Sidebar";
import Header from "@/Components/Member/Header";
import Footer from "@/Components/Member/Footer";

export default function MemberLayout({ user, header, children }) {
    // Default false agar di HP tidak menutupi layar saat pertama dimuat
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Cek ukuran layar: Buka otomatis HANYA jika dibuka di laptop/desktop
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                user={user}
            />

            {/* Area Konten Utama: Bergeser ke kanan (lg:ml-64) jika sidebar terbuka */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative ${
                    isSidebarOpen ? "lg:ml-64" : "ml-0"
                }`}
            >
                <Header setIsOpen={setIsSidebarOpen} title={header} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
                    {/* --- DEKORASI BACKGROUND --- */}
                    <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-indigo-50/80 via-slate-50/50 to-transparent -z-10 pointer-events-none"></div>
                    <div
                        className="absolute inset-0 -z-20 pointer-events-none opacity-[0.35]"
                        style={{
                            backgroundImage:
                                "radial-gradient(#cbd5e1 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    ></div>
                    {/* --- SELESAI DEKORASI --- */}

                    <div className="p-4 sm:p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
