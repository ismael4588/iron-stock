"use client";

import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type AddProductModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    barcode: string | null;
    quantity: number;
  }) => Promise<void>;
  initialBarcode?: string;
};

export function AddProductModal({
  open,
  onClose,
  onSubmit,
  initialBarcode = "",
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState(initialBarcode);
  const [quantity, setQuantity] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setBarcode(initialBarcode);
    }
  }, [open, initialBarcode]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("יש להזין שם מוצר");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty < 0) {
      setError("כמות חייבת להיות מספר חיובי");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: trimmed,
        barcode: barcode.trim() || null,
        quantity: qty,
      });
      setName("");
      setBarcode("");
      setQuantity("0");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="סגור"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-product-title" className="text-lg font-bold">
            הוספת מוצר
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-surface"
            aria-label="סגור"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">שם המוצר</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="לדוגמה: מברג פיליפס 6 מ״מ"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">ברקוד (אופציונלי)</span>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="7290000000000"
              inputMode="numeric"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">כמות התחלתית</span>
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "שומר..." : "שמור מוצר"}
        </button>
      </form>
    </div>
  );
}
