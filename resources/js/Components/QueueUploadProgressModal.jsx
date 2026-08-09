function CheckIcon() {
    return (
        <svg
            className="h-5 w-5"
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

export default function QueueUploadProgressModal({
    show,

    stage,

    stats,

    error,

    onRetry,

    onClose,
}) {
    if (!show) {
        return null;
    }

    const {
        total = 0,
        completed = 0,
        remaining = 0,
        current = null,
        currentNumber = 0,
        currentProgress = 0,
        overallPercentage = 0,
    } = stats || {};

    const waitingForDrive =
        stage === "uploading" &&
        current?.status === "uploading" &&
        currentProgress >= 100;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="p-6 sm:p-8">
                    {/* ================================= */}
                    {/* ERROR */}
                    {/* ================================= */}
                    {stage === "error" ? (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl">
                                !
                            </div>

                            <div className="mt-5 text-center">
                                <h3 className="text-xl font-black text-slate-800">
                                    Proses Terhenti
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-rose-600">
                                    {error || "Terjadi kesalahan."}
                                </p>
                            </div>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">
                                        Sudah selesai
                                    </span>

                                    <span className="font-black text-emerald-600">
                                        {completed} / {total}
                                    </span>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Foto yang sudah sukses tidak akan di-upload
                                    ulang. Tekan Coba Lagi untuk melanjutkan
                                    dari foto yang gagal.
                                </p>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                    Kembali ke Form
                                </button>

                                <button
                                    type="button"
                                    onClick={onRetry}
                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        </>
                    ) : stage === "finalizing" ? (
                        /*
                         * =================================
                         * FINAL SIMPAN POST
                         * =================================
                         */
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <CheckIcon />
                            </div>

                            <div className="mt-5 text-center">
                                <h3 className="text-xl font-black text-slate-800">
                                    Semua Foto Selesai
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Semua foto sudah berhasil disimpan ke Google
                                    Drive. Sekarang data postingan sedang
                                    disimpan.
                                </p>
                            </div>

                            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                                <p className="text-3xl font-black text-emerald-700">
                                    {total} / {total}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-600">
                                    foto berhasil
                                </p>
                            </div>

                            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full w-full animate-pulse rounded-full bg-emerald-500" />
                            </div>

                            <p className="mt-3 text-center text-xs text-slate-400">
                                Jangan menutup halaman.
                            </p>
                        </>
                    ) : (
                        /*
                         * =================================
                         * UPLOADING
                         * =================================
                         */
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                            </div>

                            <div className="mt-5 text-center">
                                <h3 className="text-xl font-black text-slate-800">
                                    Mengunggah Foto
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Satu per satu agar lebih aman.
                                </p>
                            </div>

                            {/* COUNT */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                    <p className="text-3xl font-black text-emerald-700">
                                        {completed}/{total}
                                    </p>

                                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-600">
                                        Selesai
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                                    <p className="text-3xl font-black text-amber-700">
                                        {remaining}
                                    </p>

                                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-amber-600">
                                        Foto Tersisa
                                    </p>
                                </div>
                            </div>

                            {/* OVERALL */}
                            <div className="mt-6">
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="font-semibold text-slate-600">
                                        Progress keseluruhan
                                    </span>

                                    <span className="font-black text-indigo-600">
                                        {overallPercentage}%
                                    </span>
                                </div>

                                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                        style={{
                                            width: `${overallPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* CURRENT FILE */}
                            {current && (
                                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Foto {currentNumber} dari{" "}
                                                {total}
                                            </p>

                                            <p
                                                className="mt-1 truncate text-sm font-bold text-slate-700"
                                                title={current.file?.name}
                                            >
                                                {current.file?.name}
                                            </p>
                                        </div>

                                        <span className="flex-none rounded-lg bg-white px-2 py-1 text-xs font-black text-indigo-600 shadow-sm">
                                            {currentProgress}%
                                        </span>
                                    </div>

                                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                                        <div
                                            className="h-full rounded-full bg-indigo-500 transition-all duration-200"
                                            style={{
                                                width: `${currentProgress}%`,
                                            }}
                                        />
                                    </div>

                                    {waitingForDrive ? (
                                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                                            File sudah sampai server. Sedang
                                            disimpan ke Google Drive...
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-slate-400">
                                            Mengirim file ke server...
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="text-center text-xs leading-5 text-amber-700">
                                    Jangan refresh, menutup tab, atau berpindah
                                    halaman sampai proses selesai.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
