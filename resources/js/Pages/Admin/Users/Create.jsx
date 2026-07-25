import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        whatsapp_number: "",
        role: "anggota",
        is_active: true,
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.users.store"));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Tambah Anggota" />

            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">
                        Tambah Anggota Baru
                    </h3>
                    <Link
                        href={route("admin.users.index")}
                        className="text-slate-500 hover:text-slate-700 underline"
                    >
                        Kembali
                    </Link>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Input Nama */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.name && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.email && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Input WA */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                No. WhatsApp
                            </label>
                            <input
                                type="text"
                                value={data.whatsapp_number}
                                onChange={(e) =>
                                    setData("whatsapp_number", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: 08123456789"
                            />
                            {errors.whatsapp_number && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.whatsapp_number}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Input Role */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="anggota">Anggota</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Status Aktif */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={data.is_active ? "1" : "0"}
                                    onChange={(e) =>
                                        setData(
                                            "is_active",
                                            e.target.value === "1",
                                        )
                                    }
                                    className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="1">Aktif</option>
                                    <option value="0">Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        {/* Input Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.password && (
                                <div className="text-rose-500 text-sm mt-1">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Tombol Simpan */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {processing ? "Menyimpan..." : "Simpan Anggota"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
