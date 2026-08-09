import { useMemo } from "react";

function clamp(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(100, number),
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-7 w-7"
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

function ErrorIcon() {
    return (
        <span className="text-4xl font-light">
            !
        </span>
    );
}

export default function QueueUploadProgressModal({
    show,
    stage,
    items = [],
    error = "",
    onRetry,
    onClose,
}) {
    /*
     * ==================================================
     * SEMUA HITUNGAN DIAMBIL LANGSUNG DARI ITEMS
     * ==================================================
     *
     * Jangan ambil completed dari tempat A,
     * remaining dari tempat B,
     * progress dari tempat C.
     *
     * Satu sumber:
     *
     * queue.items
     */

    const data = useMemo(() => {
        const safeItems =
            Array.isArray(items)
                ? items
                : [];

        const total =
            safeItems.length;

        /*
         * Foto dianggap SELESAI hanya kalau:
         *
         * status = done
         * DAN
         * sudah punya gdrive:FILE_ID
         */
        const completed =
            safeItems.filter(
                (item) =>
                    item.status === "done" &&
                    item.stored,
            ).length;

        /*
         * Tersisa berarti semua yang belum
         * benar-benar selesai ke Google Drive.
         *
         * Jadi selalu:
         *
         * completed + remaining = total
         */
        const remaining =
            Math.max(
                0,
                total - completed,
            );

        /*
         * Cari file yang sedang berjalan.
         */
        const currentIndex =
            safeItems.findIndex(
                (item) =>
                    item.status ===
                        "uploading" ||
                    item.status ===
                        "error",
            );

        const current =
            currentIndex >= 0
                ? safeItems[
                      currentIndex
                  ]
                : null;

        const currentProgress =
            clamp(
                current?.progress ??
                    0,
            );

        /*
         * Overall progress hanya naik ketika
         * Google Drive BENAR-BENAR selesai.
         *
         * 1 / 2 = 50%
         * 2 / 2 = 100%
         */
        const overallPercentage =
            total > 0
                ? Math.round(
                      (completed /
                          total) *
                          100,
                  )
                : 0;

        let currentNumber =
            0;

        if (
            currentIndex >= 0
        ) {
            currentNumber =
                currentIndex + 1;
        } else if (
            completed < total
        ) {
            currentNumber =
                completed + 1;
        } else {
            currentNumber =
                total;
        }

        return {
            total,
            completed,
            remaining,
            current,
            currentIndex,
            currentNumber,
            currentProgress,
            overallPercentage,
        };
    }, [items]);

    if (!show) {
        return null;
    }

    const {
        total,
        completed,
        remaining,
        current,
        currentNumber,
        currentProgress,
        overallPercentage,
    } = data;

    /*
     * Kalau byte upload sudah 100%
     * tetapi response Laravel belum kembali,
     * artinya server sedang menunggu
     * Google Drive selesai.
     */
    const waitingForDrive =
        stage === "uploading" &&
        current?.status ===
            "uploading" &&
        currentProgress >= 100;

    /*
     * ==================================================
     * ERROR
     * ==================================================
     */
    if (stage === "error") {
        return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                        <ErrorIcon />
                    </div>

                    <div className="mt-6 text-center">
                        <h3 className="text-2xl font-black text-slate-800">
                            Proses Terhenti
                        </h3>

                        <p className="mt-3 break-words text-sm leading-6 text-rose-600">
                            {error ||
                                "Terjadi kesalahan saat proses upload."}
                        </p>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">
                                Sudah selesai
                            </span>

                            <span className="text-lg font-black text-emerald-600">
                                {completed} /{" "}
                                {total}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-500">
                                Belum selesai
                            </span>

                            <span className="font-black text-amber-600">
                                {remaining} foto
                            </span>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            Foto yang sudah
                            berhasil masuk
                            Google Drive tidak
                            akan di-upload
                            ulang. Tekan Coba
                            Lagi untuk
                            melanjutkan dari
                            foto yang gagal.
                        </p>
                    </div>

                    <div className="mt-7 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                            Kembali ke Form
                        </button>

                        <button
                            type="button"
                            onClick={
                                onRetry
                            }
                            className="rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * ==================================================
     * FINALIZING
     * ==================================================
     *
     * Semua foto sudah Drive.
     * Tinggal save Post -> MySQL.
     */
    if (
        stage ===
        "finalizing"
    ) {
        return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckIcon />
                    </div>

                    <div className="mt-6 text-center">
                        <h3 className="text-2xl font-black text-slate-800">
                            Semua Foto Selesai
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Semua foto sudah
                            berhasil masuk ke
                            Google Drive.
                            Sekarang data
                            postingan sedang
                            disimpan.
                        </p>
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                        <p className="text-4xl font-black text-emerald-700">
                            {total} / {total}
                        </p>

                        <p className="mt-2 text-sm font-bold text-emerald-600">
                            foto berhasil
                        </p>
                    </div>

                    <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-full animate-pulse rounded-full bg-emerald-500" />
                    </div>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Jangan menutup
                        halaman sampai proses
                        selesai.
                    </p>
                </div>
            </div>
        );
    }

    /*
     * ==================================================
     * UPLOADING
     * ==================================================
     */
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
            <div className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                {/* SPINNER */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                </div>

                {/* TITLE */}
                <div className="mt-6 text-center">
                    <h3 className="text-2xl font-black text-slate-800">
                        Mengunggah Foto
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Satu per satu agar
                        lebih aman.
                    </p>
                </div>

                {/* ================================= */}
                {/* COUNT */}
                {/* ================================= */}
                <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                        <p className="text-4xl font-black text-emerald-700">
                            {completed} /{" "}
                            {total}
                        </p>

                        <p className="mt-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                            Selesai
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                        <p className="text-4xl font-black text-amber-700">
                            {remaining}
                        </p>

                        <p className="mt-2 text-xs font-black uppercase tracking-wider text-amber-600">
                            Foto Tersisa
                        </p>
                    </div>
                </div>

                {/* ================================= */}
                {/* OVERALL */}
                {/* ================================= */}
                <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-slate-600">
                            Kemajuan secara
                            keseluruhan
                        </span>

                        <span className="text-sm font-black text-indigo-600">
                            {
                                overallPercentage
                            }
                            %
                        </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                        {/*
                          PENTING:

                          Tidak ada w-full di sini.

                          Lebarnya HANYA mengikuti
                          overallPercentage.
                        */}
                        <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{
                                width: `${overallPercentage}%`,
                            }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
                        <span>
                            {completed} foto
                            berhasil
                        </span>

                        <span>
                            {remaining} foto
                            belum selesai
                        </span>
                    </div>
                </div>

                {/* ================================= */}
                {/* CURRENT PHOTO */}
                {/* ================================= */}
                {current && (
                    <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Foto{" "}
                                    {
                                        currentNumber
                                    }{" "}
                                    dari{" "}
                                    {total}
                                </p>

                                <p
                                    className="mt-2 truncate text-sm font-bold text-slate-700"
                                    title={
                                        current
                                            ?.file
                                            ?.name
                                    }
                                >
                                    {
                                        current
                                            ?.file
                                            ?.name
                                    }
                                </p>
                            </div>

                            <span className="flex-none rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-indigo-600 shadow-sm">
                                {
                                    currentProgress
                                }
                                %
                            </span>
                        </div>

                        {/* CURRENT PROGRESS */}
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                            {/*
                              Sama:

                              jangan pakai w-full.

                              HANYA inline width.
                            */}
                            <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{
                                    width: `${currentProgress}%`,
                                }}
                            />
                        </div>

                        {/* BROWSER -> SERVER */}
                        {!waitingForDrive && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="h-3 w-3 animate-pulse rounded-full bg-indigo-500" />

                                <p className="text-xs font-semibold text-slate-500">
                                    Mengirim
                                    file ke
                                    server...
                                </p>
                            </div>
                        )}

                        {/* SERVER -> DRIVE */}
                        {waitingForDrive && (
                            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 h-4 w-4 flex-none animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />

                                    <div>
                                        <p className="text-xs font-bold text-indigo-700">
                                            File
                                            sudah
                                            sampai
                                            server.
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-indigo-600">
                                            Sedang
                                            disimpan
                                            ke
                                            Google
                                            Drive...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* WARNING */}
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-center text-xs font-semibold leading-5 text-amber-700">
                        Jangan
                        menyegarkan,
                        menutup tab,
                        atau
                        memindahkan
                        halaman sampai
                        proses selesai.
                    </p>
                </div>
            </div>
        </div>
    );
}