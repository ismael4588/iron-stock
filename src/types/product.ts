export type Product = {
  id: string;
  name: string;
  barcode: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  name: string;
  barcode?: string | null;
  quantity?: number;
};
