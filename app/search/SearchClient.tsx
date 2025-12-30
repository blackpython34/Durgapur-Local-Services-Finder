"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation"; // Added to read URL params
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { Search, MapPin, Star, ShieldCheck, Loader2, X } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams(); // Added
  const initialCategory = searchParams.get("category") || "All"; // Capture "Tutor", "Plumber", etc.

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialCategory); // Set initial state from URL
  const [searchQuery, setSearchQuery] = useState("");

  // Update filter state if the URL changes (e.g., clicking a different icon)
  useEffect(() => {
    if (initialCategory) setFilter(initialCategory);
  }, [initialCategory]);

  // 1. Live Data Fetching
  useEffect(() => {
    setLoading(true);
    const providersRef = collection(db, "providers");
    
    // Category filter logic
    const q = filter === "All" 
      ? query(providersRef) 
      : query(providersRef, where("category", "==", filter));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProviders(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  // 2. Real-time Search Filtering (The Fix)
  const displayedProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    
    const term = searchQuery.toLowerCase();
    return providers.filter((p) => 
      p.name?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.subCategory?.toLowerCase().includes(term) ||
      p.address?.toLowerCase().includes(term)
    );
  }, [searchQuery, providers]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <div className="container mx-auto px-6 pt-12 max-w-6xl">
        
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="shrink-0">
            <h1 className="text-4xl font-black tracking-tighter mb-2 italic uppercase">
              Find <span className="text-blue-600">Experts</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Verified by PIXEL PIONEERS
            </p>
          </div>

          {/* THE SEARCH INPUT */}
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search (e.g. Electrician, Rajesh...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-blue-600/50 transition-all font-bold text-white placeholder:text-slate-700 shadow-2xl"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar">
          {["All", "Electrician", "Plumber", "Mechanic", "Tutor", "Tailor"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setSearchQuery(""); }}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${
                filter === cat 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="mb-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {displayedProviders.length} matching experts in Durgapur
          </span>
        </div>

        {/* The Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Syncing with Firestore...</span>
          </div>
        ) : displayedProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProviders.map((p) => (
              <Link href={`/provider/${p.id}`} key={p.id} className="group">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 hover:border-blue-600/30 transition-all h-full flex flex-col hover:-translate-y-2 duration-300 shadow-xl">
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-slate-800 relative">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    {p.isOnline && (
                      <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] font-black text-green-500 uppercase">Live Now</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-blue-500 transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                      <Star size={14} fill="currentColor" /> {p.rating || "5.0"}
                    </div>
                  </div>
                  
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
                    {p.category} • {p.subCategory}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
                      <MapPin size={12} className="text-blue-600" /> {p.address}
                    </div>
                    <ShieldCheck size={16} className="text-slate-800" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-slate-900 rounded-[3rem]">
            <p className="text-slate-600 font-bold uppercase text-xs tracking-[0.2em]">
              No professionals found for "{searchQuery || filter}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}