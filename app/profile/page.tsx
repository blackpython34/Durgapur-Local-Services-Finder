"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
// CHANGED: Import setDoc to handle missing documents
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  Settings, Loader2, CheckCircle2, 
  LogOut, Shield, Lock, Phone,
  ArrowUpRight, User
} from "lucide-react";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        const unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setName(data.name || "");
            setPhone(data.phone || "");
          } else {
            const initialData = {
              name: user.displayName || "New User",
              email: user.email
            };
            setUserData(initialData);
            setName(initialData.name);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore real-time error:", error);
          setLoading(false);
        });

        return () => unsubSnapshot();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // STRICTLY REQUIRED CHANGES: Update both collections and include adminUid
  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    setUpdating(true);
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      const providerRef = doc(db, "providers", uid);

      // 1. Update/Create the Personal Identity document
      // Using setDoc with merge:true handles creation if doc is missing
      await setDoc(userRef, { 
        name: name,
        phone: phone,
        email: auth.currentUser.email 
      }, { merge: true });

      // 2. Sync to the Public Professional Profile
      // This ensures the WhatsApp button on the Detail page always has the latest number.
      // We MUST include adminUid to pass your Firestore security 'allow update' rule.
      await setDoc(providerRef, { 
        name: name,
        phone: phone, 
        adminUid: uid // Strictly required for rule validation
      }, { merge: true });

      alert("Identity and Business Profile synced successfully!");
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    } finally { setUpdating(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Identity</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mt-1">Pixel Pioneers / System v2.5</p>
          </div>
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-800 rounded-full hover:bg-red-500/10 hover:border-red-500/50 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500">Sign Out</span>
            <LogOut size={14} className="text-slate-500 group-hover:text-red-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="relative p-10 bg-slate-900/40 border border-slate-800 rounded-[3rem] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield size={160} />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
                  <Shield size={36} className="text-white" />
                </div>
                
                <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-tight uppercase italic">
                  {name?.split(' ')[0] || "User"}<br/>
                  <span className="text-blue-500">{name?.split(' ').slice(1).join(' ')}</span>
                </h2>
                
                <div className="flex items-center gap-2 mb-10">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Verified Identity</span>
                </div>

                <div className="space-y-6 pt-10 border-t border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Registered Email</span>
                    <span className="text-sm font-bold text-slate-300">{userData?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="p-10 bg-slate-900/20 border border-slate-800/60 rounded-[3rem] backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <Settings size={20} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight italic uppercase">Security & Contact</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-14 pr-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 font-bold text-lg transition-all text-white"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-14 pr-8 py-5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 font-bold text-lg transition-all text-white"
                      placeholder="+91"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUpdate} 
                  disabled={updating}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/10"
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Commit Changes
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <button 
                  onClick={() => router.push('/orders')}
                  className="flex items-center justify-between p-5 bg-slate-900/40 border border-slate-800 rounded-2xl group hover:border-slate-700 transition-all text-left"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-500 transition-colors">Transaction History</span>
                  <ArrowUpRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                </button>
                <button className="flex items-center justify-between p-5 bg-slate-900/40 border border-slate-800 rounded-2xl group hover:border-slate-700 transition-all text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-500 transition-colors">Account Settings</span>
                  <ArrowUpRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 mt-12 opacity-30">
               <Lock size={20} className="text-slate-500" />
               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-center">
                 Encryption Secured / Pixel Pioneers 2025
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}