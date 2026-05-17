import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Product, ProductInput } from "@/types/product";

const DEMO_KEY = "hardware-inventory-demo";

function loadDemo(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveDemo(products: Product[]) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(products));
}

function demoId() {
  return crypto.randomUUID();
}

export async function fetchProducts(search?: string): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    const q = search?.trim().toLowerCase();
    let items = loadDemo();

    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode?.toLowerCase().includes(q) ?? false)
      );
    }

    return items.sort((a, b) => a.name.localeCompare(b.name, "he"));
  }

  const supabase = getSupabase();
  let query = supabase.from("products").select("*").order("name");

  if (search?.trim()) {
    const term = `%${search.trim().replace(/[%_,]/g, "")}%`;
    query = query.or(`name.ilike.${term},barcode.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data ?? [];
}

export async function findByBarcode(barcode: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return loadDemo().find((p) => p.barcode === barcode) ?? null;
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const payload = {
    name: input.name.trim(),
    barcode: input.barcode?.trim() || null,
    quantity: input.quantity ?? 0,
  };

  if (!isSupabaseConfigured) {
    const items = loadDemo();

    if (payload.barcode && items.some((p) => p.barcode === payload.barcode)) {
      throw new Error("duplicate key value violates unique constraint");
    }

    const now = new Date().toISOString();

    const product: Product = {
      id: demoId(),
      ...payload,
      created_at: now,
      updated_at: now,
    };

    items.push(product);
    saveDemo(items);

    return product;
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateQuantity(
  id: string,
  delta: number
): Promise<Product> {
  if (!isSupabaseConfigured) {
    const items = loadDemo();
    const index = items.findIndex((p) => p.id === id);

    if (index === -1) throw new Error("מוצר לא נמצא");

    const next = Math.max(0, items[index].quantity + delta);

    items[index] = {
      ...items[index],
      quantity: next,
      updated_at: new Date().toISOString(),
    };

    saveDemo(items);

    return items[index];
  }

  const supabase = getSupabase();

  const { data: current, error: readError } = await supabase
    .from("products")
    .select("quantity")
    .eq("id", id)
    .single();

  if (readError) throw readError;

  const quantity = Math.max(0, (current?.quantity ?? 0) + delta);

  const { data, error } = await supabase
    .from("products")
    .update({ quantity })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const items = loadDemo().filter((p) => p.id !== id);
    saveDemo(items);
    return;
  }

  const supabase = getSupabase();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}