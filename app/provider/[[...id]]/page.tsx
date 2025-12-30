import { Suspense } from 'react';
import ProviderDetail from "./ProviderClient";
import { Loader2 } from "lucide-react";

export async function generateStaticParams() {
  // For optional catch-all routes [[...id]], Next.js expects an array of strings.
  // We provide an empty array for the base path and a placeholder for the build.
  return [
    { id: [] }, 
    { id: ['1'] }
  ]; 
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    }>
      <ProviderDetail />
    </Suspense>
  );
}