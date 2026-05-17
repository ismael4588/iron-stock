"use client";

import { Barcode, PackagePlus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddProductModal } from "@/components/AddProductModal";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  findByBarcode,
  updateQuantity,
} from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Product } from "@/types/product";

export function InventoryApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanBarcode, setScanBarcode] = useState("");

  const load = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const data = await fetchProducts(query);
      setProducts(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "שגיאה בטעינת מוצרים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, load]);

  const totals = useMemo(
    () => ({
      count: products.length,
      stock: products.reduce((sum, p) => sum + p.quantity, 0),
    }),
    [products]
  );

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }

  async function handleAdjust(id: string, delta: number) {
    setBusyId(id);

    try {
      const updated = await updateQuantity(id, delta);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "שגיאה בעדכון כמות");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("המוצר נמחק");
    } catch {
      showToast("שגיאה במחיקה");
    } finally {
      setBusyId(null);
    }
  }

  async function handleAdd(data: {
    name: string;
    barcode: string | null;
    quantity: number;
  }) {
    try {
      const created = await createProduct(data);

      setProducts((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "he"))
      );

      showToast(`"${created.name}" נוסף בהצלחה`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "שגיאה בהוספה";

      if (message.includes("duplicate") || message.includes("unique")) {
        throw new Error("ברקוד זה כבר קיים במערכת");
      }

      throw err;
    }
  }

  const handleBarcodeScan = useCallback(async (code: string) => {
    const barcode = code.trim();

    if (!barcode) return;

    setScanOpen(false);

    try {
      const existing = await findByBarcode(barcode);

      if (existing) {
        const updated = await updateQuantity(existing.id, 1);

        setProducts((prev) =>
          prev.map((p) => (p.id === existing.id ? updated : p))
        );

        showToast(`+1 ל־${existing.name}`);
        return;
      }

      setScanBarcode(barcode);
      setAddOpen(true);
      showToast("מוצר חדש — הזן שם להשלמה");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "שגיאה בסריקה");
    }
  }, []);

  function openAddProduct() {
    setScanBarcode("");
    setAddOpen(true);
  }

  return (
    <div className="min-h-dvh bg-[#fbfcff] text-slate-950">
      <div className="mx-auto min-h-dvh max-w-lg pb-32">
        <Header
          totalProducts={totals.count}
          totalStock={totals.stock}
          demoMode={!isSupabaseConfigured}
        />

        <main className="space-y-6 px-6 py-5">
          <SearchBar value={search} onChange={setSearch} />

          {loading && products.length === 0 ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-[2rem] bg-slate-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
              <p className="text-6xl">📦</p>
              <p className="mt-6 text-2xl font-black">אין מוצרים עדיין</p>
              <p className="mt-3 text-base font-medium text-slate-500">
                הוסף מוצר ידנית או סרוק ברקוד כדי להתחיל
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    onAdjust={handleAdjust}
                    onDelete={handleDelete}
                    busy={busyId === product.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 px-5 py-5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="group flex flex-1 flex-col items-center justify-center gap-2 rounded-[1.6rem] border border-slate-100 bg-white py-4 text-base font-black text-slate-950 shadow-xl shadow-slate-200/80 transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] active:scale-95"
            >
              <Barcode className="size-7 text-indigo-500 transition group-hover:text-white" />
              סרוק ברקוד
            </button>

            <button
              type="button"
              onClick={openAddProduct}
              className="group flex size-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-2xl shadow-indigo-500/40 transition duration-300 hover:scale-110 hover:shadow-[0_0_45px_rgba(99,102,241,0.7)] active:scale-95"
              aria-label="הוסף מוצר"
            >
              <PackagePlus className="size-11 transition duration-300 group-hover:rotate-12" />
            </button>

            <button
              type="button"
              onClick={openAddProduct}
              className="group flex flex-1 flex-col items-center justify-center gap-2 rounded-[1.6rem] border border-slate-100 bg-white py-4 text-base font-black text-slate-950 shadow-xl shadow-slate-200/80 transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] active:scale-95"
            >
              <Plus className="size-8 text-indigo-500 transition group-hover:text-white" />
              הוסף מוצר
            </button>
          </div>
        </nav>

        <AddProductModal
          open={addOpen}
          onClose={() => {
            setAddOpen(false);
            setScanBarcode("");
          }}
          initialBarcode={scanBarcode}
          onSubmit={handleAdd}
        />

        <BarcodeScanner
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onScan={handleBarcodeScan}
        />

        {toast && (
          <div
            role="status"
            className="fixed bottom-32 inset-x-5 z-30 mx-auto max-w-lg rounded-2xl bg-slate-950 px-4 py-4 text-center text-sm font-bold text-white shadow-2xl"
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}