import { Barcode, Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  onAdjust: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
};

function stockLabel(quantity: number) {
  if (quantity === 0) {
    return { text: "אזל", className: "bg-red-50 text-red-500" };
  }

  if (quantity <= 5) {
    return { text: "מלאי נמוך", className: "bg-amber-50 text-amber-600" };
  }

  return { text: "במלאי", className: "bg-emerald-50 text-emerald-600" };
}

export function ProductCard({
  product,
  onAdjust,
  onDelete,
  busy,
}: ProductCardProps) {
  const status = stockLabel(product.quantity);

  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
          📦
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h2 className="truncate text-lg font-black text-slate-950">
              {product.name}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}
            >
              {status.text}
            </span>
          </div>

          {product.barcode && (
            <p className="flex items-center gap-2 truncate font-mono text-sm text-slate-500">
              <Barcode className="size-4" />
              {product.barcode}
            </p>
          )}
        </div>

        <p className="text-4xl font-black tabular-nums text-slate-950">
          {product.quantity}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onAdjust(product.id, -1)}
          disabled={busy || product.quantity === 0}
          className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-lg font-black text-slate-800 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] active:scale-95 disabled:opacity-35"
        >
          <Minus className="size-5 transition group-hover:text-white" />
          -1
        </button>

        <button
          type="button"
          onClick={() => onAdjust(product.id, 1)}
          disabled={busy}
          className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 py-4 text-lg font-black text-white shadow-xl shadow-indigo-500/30 transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(99,102,241,0.65)] active:scale-95 disabled:opacity-40"
        >
          <Plus className="size-5 transition group-hover:rotate-90" />
          +1
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm(`למחוק את "${product.name}"?`)) {
            onDelete(product.id);
          }
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-lg font-black text-red-500 shadow-sm transition duration-300 hover:bg-red-500 hover:text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.45)] active:scale-95"
      >
        <Trash2 className="size-5" />
        מחק מוצר
      </button>
    </article>
  );
}