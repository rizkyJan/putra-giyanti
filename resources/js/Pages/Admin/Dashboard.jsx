import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ auth }) {
    return (
        <AdminLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-800">
                    Selamat Datang, {auth.user.name}! 👋
                </h3>
                <p className="text-slate-500 mt-1">
                    Ini adalah pusat kendali sistem absensi Karang Taruna.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Widget 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            ></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Total Anggota
                        </p>
                        <h4 className="text-2xl font-bold text-slate-800">0</h4>
                    </div>
                </div>

                {/* Widget 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            ></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Total Rapat
                        </p>
                        <h4 className="text-2xl font-bold text-slate-800">0</h4>
                    </div>
                </div>

                {/* Widget 3 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                        <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            ></path>
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Absensi Bulan Ini
                        </p>
                        <h4 className="text-2xl font-bold text-slate-800">0</h4>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
