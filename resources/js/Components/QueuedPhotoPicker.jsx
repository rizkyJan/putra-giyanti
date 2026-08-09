import { useState } from "react";

function XIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 12 4 4L19 6"
            />
        </svg>
    );
}

function formatSize(bytes) {
    const mb = bytes / (1024 * 1024);

    if (mb < 1) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${mb.toFixed(mb >= 10 ? 1 : 2)} MB`;
}

export default function QueuedPhotoPicker({
    queue,

    multiple = true,

    title = "Pilih Foto",

    description = "Maksimal 50 MB per gambar.",
}) {
    const [notice, setNotice] = useState("");

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files || []);

        /*
         * Supaya file picker bisa
         * digunakan berkali-kali.
         */
        event.target.value = "";

        if (files.length === 0) {
            return;
        }

        try {
            let result;

            if (multiple) {
                result = queue.addFiles(files);
            } else {
                result = await queue.replaceSingleFile(files[0]);
            }

            let message = "";

            if (result.added > 0) {
                message = `${result.added} foto ditambahkan.`;
            }

            if (result.rejected.length > 0) {
                message += ` ${result.rejected.slice(0, 3).join("; ")}`;

                if (result.rejected.length > 3) {
                    message += ` dan ${result.rejected.length - 3} lainnya.`;
                }
            }

            setNotice(message);
        } catch (error) {
            setNotice(error.message);
        }
    };

    const removeItem = async (id) => {
        try {
            await queue.removeItem(id);

            setNotice("Foto dihapus dari daftar.");
        } catch (error) {
            setNotice(error.message);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-bold text-slate-700">{title}</p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                    {description}
                </p>
            </div>

            {/* PICKER */}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <PlusIcon />
                </span>

                <span className="mt-3 font-bold text-indigo-700">
                    {multiple ? "+ Tambah Foto" : "Pilih Gambar"}
                </span>

                <span className="mt-1 max-w-md text-xs leading-5 text-slate-400">
                    {multiple
                        ? "Bisa pilih banyak sekaligus dan bisa klik lagi untuk menambah batch berikutnya."
                        : "Pilih satu gambar. Memilih ulang akan mengganti pilihan sebelumnya."}
                </span>

                <input
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFiles}
                    className="sr-only"
                />
            </label>

            {/* NOTICE */}
            {notice && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    {notice}
                </div>
            )}

            {/* JUMLAH */}
            {queue.items.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">
                        Foto yang dipilih
                    </p>

                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                        {queue.items.length} foto
                    </span>
                </div>
            )}

            {/* PREVIEW */}
            {queue.items.length > 0 && (
                <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {queue.items.map((item, index) => (
                            <div
                                key={item.id}
                                className={`overflow-hidden rounded-xl border-2 bg-white ${
                                    item.status === "done"
                                        ? "border-emerald-300"
                                        : item.status === "error"
                                          ? "border-rose-400"
                                          : "border-slate-100"
                                }`}
                            >
                                <div className="relative aspect-square overflow-hidden bg-slate-100">
                                    <img
                                        src={item.preview}
                                        alt={item.file.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                    />

                                    {/* NOMOR */}
                                    <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
                                        #{index + 1}
                                    </span>

                                    {/* STATUS DONE */}
                                    {item.status === "done" && (
                                        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">
                                            <CheckIcon />
                                            Drive
                                        </span>
                                    )}

                                    {/* HAPUS */}
                                    {item.status !== "uploading" && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white shadow transition hover:bg-rose-600"
                                            title="Hapus dari daftar"
                                        >
                                            <XIcon />
                                        </button>
                                    )}
                                </div>

                                <div className="p-2">
                                    <p
                                        className="truncate text-xs font-semibold text-slate-700"
                                        title={item.file.name}
                                    >
                                        {item.file.name}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        {formatSize(item.file.size)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
