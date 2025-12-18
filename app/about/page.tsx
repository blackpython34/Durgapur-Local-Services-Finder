"use client";

import { ShieldCheck, Target, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <section className="py-24 px-4 bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            We are <span className="text-brand">Durgapur's</span> Digital Service Backbone.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed font-medium">
            Founded by <span className="text-slate-900 dark:text-white font-bold text-2xl tracking-widest uppercase">Pixel Pioneers</span>, 
            our mission is to connect the skilled labor of Durgapur with the citizens who need them most.
          </p>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="service-card aspect-video flex items-center justify-center bg-slate-950 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="z-10 text-center">
            <h2 className="text-3xl font-black tracking-widest text-white">PIXEL PIONEERS</h2>
            <p className="text-brand text-xs font-bold tracking-[0.5em] mt-2">ESTD 2024</p>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight">Bridging the Gap</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Durgapur is growing fast. We noticed that while there is a high demand for repair and 
            teaching services, finding a reliable professional was still based on word-of-mouth. 
            Pixel Pioneers solved this by building a verified, hyper-local directory.
          </p>
          <Link href="/search" className="btn-action px-8 py-4 inline-flex items-center gap-2">
            Explore Services <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}