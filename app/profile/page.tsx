"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  Mail, ShieldCheck, Settings, 
  Loader2, CheckCircle2, Clock, MapPin, 
  ChevronRight, CalendarDays, LogOut, Shield, Lock,
  PlayCircle, History
} from "lucide-react";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [phone, setPhone] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setPhone(docSnap.data().phone || "");
        }
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), { phone });
      alert("Profile updated!");
    } catch (e) {
      console.error(e);
    } finally { setUpdating(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <Loader2 className="w-10 h-10 animate-spin text-brand" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 animate-in fade-in duration-500 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl">
              <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
                <Shield size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">{userData?.name}</h2>
              <p className="text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-8">Verified Account</p>
              
              <div className="space-y-4 text-slate-400 text-sm mb-10 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-3"><Mail size={16} /> {userData?.email}</div>
                <div className="flex items-center gap-3"><MapPin size={16} /> Durgapur, WB</div>
              </div>

              {/* LOGOUT BUTTON - High Visibility White on Dark */}
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand hover:text-white transition-all shadow-xl"
              >
                <LogOut size={16} /> Logout Account
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
               <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                 <History size={14} className="text-brand" /> Summary
               </h4>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                   <p className="text-[10px] font-bold text-slate-400">COMPLETED</p>
                   <p className="text-xl font-black text-brand">12</p>
                 </div>
                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                   <p className="text-[10px] font-bold text-slate-400">ACTIVE</p>
                   <p className="text-xl font-black text-brand">01</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Main Content Dashboard */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Account Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
              <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                <Settings size={20} className="text-brand" /> Profile Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
                  {/* Phone Icon Removed as requested */}
                  <input 
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold transition-all border border-transparent focus:border-brand/20"
                    placeholder="Enter phone number"
                  />
                </div>
                <button 
                  onClick={handleUpdate} disabled={updating}
                  className="btn-action py-4 px-8 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Save Changes
                </button>
              </div>
            </div>

            {/* Resume Booking Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight">Active / Resume Booking</h3>
                <span className="text-[10px] font-black bg-brand/10 text-brand px-3 py-1 rounded-full uppercase">Action Required</span>
              </div>
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-brand/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Pending: Home Tutor Request</h4>
                    <p className="text-xs text-slate-500">Last updated: Today at 2:45 PM</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                  <PlayCircle size={16} /> Resume Now
                </button>
              </div>
            </div>

            {/* Completed Services Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-black tracking-tight">Completed Services</h3>
              <div className="grid gap-4">
                {[
                  { service: "Electrician", provider: "Rahul Das", date: "12 Dec, 2025", cost: "₹450" },
                  { service: "Plumber", provider: "Subhojit M.", date: "05 Dec, 2025", cost: "₹300" }
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-brand/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-green-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold">{s.service} Service</h4>
                        <p className="text-xs text-slate-500 font-medium">Provided by {s.provider} • {s.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{s.cost}</span>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lock Watermark at the End */}
            <div className="pt-12 flex flex-col items-center justify-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all">
               <Lock size={40} className="text-slate-400" />
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Verified by PIXEL PIONEERS</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">Security Protocol Standard DS-2025-V4</p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}