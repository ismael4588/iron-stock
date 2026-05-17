"use client";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type BarcodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  onScanRef.current = onScan;

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      /* ignore cleanup errors */
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      void stopScanner();
      setError(null);
      return;
    }

    let cancelled = false;

    async function start() {
      setStarting(true);
      setError(null);

      try {
        await stopScanner();
        if (cancelled) return;

        const scanner = new Html5Qrcode(regionId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) {
          setError("לא נמצאה מצלמה במכשיר");
          return;
        }

        const backCamera =
          cameras.find((c) => /back|rear|environment/i.test(c.label)) ??
          cameras[cameras.length - 1];

        await scanner.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 280, height: 140 },
            aspectRatio: 1.777,
          },
          (decoded) => {
            onScanRef.current(decoded);
          },
          () => {
            /* scan attempts — ignore */
          }
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "לא ניתן להפעיל את המצלמה. אשר הרשאות מצלמה."
          );
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [open, regionId, stopScanner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h2 className="text-lg font-bold">סריקת ברקוד</h2>
          <p className="text-sm text-slate-400">כוון את הברקוד למסגרת</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2.5"
          aria-label="סגור סורק"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div
          id={regionId}
          className="scanner-region w-full max-w-md overflow-hidden rounded-2xl bg-black"
        />
        {starting && (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <Camera className="size-4 animate-pulse" />
            מפעיל מצלמה...
          </p>
        )}
        {error && (
          <p className="mt-4 max-w-sm rounded-xl bg-red-500/20 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
