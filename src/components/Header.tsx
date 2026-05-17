import { Box, Layers } from "lucide-react";

type HeaderProps = {
  totalProducts: number;
  totalStock: number;
  demoMode?: boolean;
};

export function Header({ totalProducts, totalStock, demoMode }: HeaderProps) {
  return (
    <header className="px-6 pt-7 pb-4 text-slate-950">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex size-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-xl shadow-indigo-500/30">
            <Box className="size-8" />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black">מלאי חנות</h1>
            <p className="mt-1 text-base font-medium text-slate-500">
              ניהול מלאי כלי ברזל
            </p>
          </div>

          <div className="size-16" />
        </div>

        <div className="grid grid-cols-2 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="border-l border-slate-200 pl-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-slate-500">
              <Box className="size-6 text-emerald-500" />
              <span className="font-bold">סה״כ מוצרים</span>
            </div>
            <p className="text-5xl font-black">{totalProducts}</p>
          </div>

          <div className="pr-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-slate-500">
              <Layers className="size-6 text-indigo-500" />
              <span className="font-bold">סה״כ מלאי</span>
            </div>
            <p className="text-5xl font-black">{totalStock}</p>
          </div>
        </div>

        
      </div>
    </header>
  );
}