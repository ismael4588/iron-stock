import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-5 top-1/2 size-7 -translate-y-1/2 text-slate-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="חיפוש לפי שם או ברקוד..."
        className="w-full rounded-[1.6rem] border border-slate-100 bg-white px-6 py-5 pl-16 text-lg font-medium text-slate-900 shadow-lg shadow-slate-200/70 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100"
        autoComplete="off"
      />
    </div>
  );
}