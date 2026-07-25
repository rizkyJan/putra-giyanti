import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
    const [status, setStatus] = useState("Memuat kamera...");

    // Gunakan useRef untuk menyimpan token terakhir yang discan agar tidak memicu re-render
    const lastScannedToken = useRef(null);

    useEffect(() => {
        let scanner = null;
        let isUnmounted = false;

        const initScanner = async () => {
            try {
                if (isUnmounted) return;

                scanner = new Html5Qrcode("qr-reader");

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        // Cek apakah token yang discan BERBEDA dengan token sebelumnya dalam 3 detik terakhir
                        if (decodedText !== lastScannedToken.current) {
                            lastScannedToken.current = decodedText; // Kunci token

                            onScanSuccess(decodedText); // Jalankan fungsi dari parent

                            // Beri cooldown 3 detik sebelum mengizinkan token yang SAMA discan lagi
                            setTimeout(() => {
                                lastScannedToken.current = null;
                            }, 3000);
                        }
                    },
                    (errorMessage) => {
                        // Abaikan log error saat sedang mencoba fokus ke QR
                    },
                );

                setStatus(""); // Hapus tulisan loading jika berhasil
            } catch (err) {
                console.error("Gagal inisialisasi kamera:", err);
                setStatus(
                    "Kamera belakang tidak ditemukan atau akses ditolak.",
                );
            }
        };

        initScanner();

        return () => {
            isUnmounted = true;
            if (scanner && scanner.isScanning) {
                scanner.stop().catch(console.error);
            }
        };
    }, []);

    return (
        <div className="w-full bg-white rounded-xl overflow-hidden flex flex-col items-center relative">
            <div
                id="qr-reader"
                className="w-full bg-black min-h-[300px] flex items-center justify-center relative"
            ></div>

            <div className="w-full border-t border-slate-100 p-3 bg-white z-10">
                {status ? (
                    <p className="text-center text-sm text-amber-600 font-medium animate-pulse">
                        {status}
                    </p>
                ) : (
                    <p className="text-center text-sm text-slate-500">
                        Arahkan kamera ke QR Code milik anggota
                    </p>
                )}
            </div>
        </div>
    );
}
