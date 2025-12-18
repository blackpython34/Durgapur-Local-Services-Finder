"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Cpu, Droplets, Wrench, BookOpen, Scissors } from "lucide-react";

const CATEGORIES = [
  { name: "Electrician", Icon: Cpu, color: "text-yellow-600 bg-yellow-50" },
  { name: "Plumber", Icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { name: "Mechanic", Icon: Wrench, color: "text-orange-600 bg-orange-50" },
  { name: "Tutor", Icon: BookOpen, color: "text-green-600 bg-green-50" },
  { name: "Tailor", Icon: Scissors, color: "text-pink-600 bg-pink-50" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-4 text-center bg-linear-to-b from-blue-50 to-white dark:from-slate-950 dark:to-background">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">
          Service at your <span className="text-blue-600">Doorstep.</span>
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto font-medium">
          Durgapur's #1 platform for finding verified local professionals.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="What are you looking for?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1A2333] border border-slate-800 rounded-2xl py-6 pl-16 pr-8 text-xl font-medium text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-2xl" 
          />
        </form>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-10 text-white">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.name} 
              href={`/search?category=${cat.name}`} // FIXED: Changed 'q' to 'category'
              className="service-card flex flex-col items-center group"
            >
              <div className={`p-6 rounded-3xl mb-4 transition-transform group-hover:scale-110 ${cat.color}`}>
                <cat.Icon size={32} />
              </div>
              <span className="font-bold text-lg text-slate-300 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}