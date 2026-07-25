import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-6 sm:justify-center sm:pt-0">
            {/* Bagian Logo Global untuk semua halaman Auth */}
            <div className="flex flex-col items-center mb-6">
                <Link href="/">
                    <img
                        src="/images/putragiyanti.png"
                        alt="Logo Putra Giyanti"
                        className="h-24 w-auto mb-4 drop-shadow-md hover:scale-105 transition-transform duration-300 mx-auto"
                    />
                </Link>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight text-center">
                    KARANG TARUNA
                </h2>
                <h3 className="text-lg font-bold text-indigo-600 tracking-widest text-center">
                    PUTRA GIYANTI
                </h3>
            </div>

            {/* Kotak Form */}
            <div className="mt-2 w-full overflow-hidden bg-white px-8 py-8 shadow-xl sm:max-w-md sm:rounded-2xl border border-slate-100">
                {children}
            </div>
        </div>
    );
}
