// app/search/page.tsx
import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense 
      fallback={
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Initializing Search Engine...
          </span>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}