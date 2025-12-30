"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Loader2, UserPlus, ArrowRight, CheckCircle2, X } from "lucide-react";
import Link from "next/link"; 

export default function PartnerLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifiedToast, setShowVerifiedToast] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isNewVerification = searchParams.get("mode") === "verifyEmail";
    const alreadyShown = sessionStorage.getItem("verified_toast_shown");

    if (isNewVerification && !alreadyShown) {
      setShowVerifiedToast(true);
      sessionStorage.setItem("verified_toast_shown", "true"); 
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Role Validation Gate
      // We query the providers collection to find a document belonging to this UID
      const providersRef = collection(db, "providers");
      const q = query(providersRef, where("adminUid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // SUCCESS: User is a registered partner
        router.push("/partner"); 
      } else {
        // FAIL: User exists in Auth but has no Provider Profile
        // This is why you get the error even if the email/password are correct
        alert("Access Denied: Your account is not registered as a Partner. Please create a business profile.");
        router.push("/register-partner");
      }
    } catch (error: any) {
      // Handles wrong password or non-existent email in Auth
      alert("Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative">
      
      {showVerifiedToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-500">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-400">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-black uppercase italic text-xs tracking-tighter">Login Successful!</p>
              <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest">Accessing your partner dashboard.</p>
            </div>
            <button onClick={() => setShowVerifiedToast(false)} className="ml-2 hover:scale-110 transition-transform">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter mb-8 text-center">
          Partner <span className="text-blue-500">Login</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            <input 
              required type="email" name="email" id="email" placeholder="Email Address" 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-bold outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            <input 
              required type="password" name="password" id="password" placeholder="Password" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-bold outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/10"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={16}/></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-4">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">New to DurgapurPro?</p>
          <Link 
            href="/register-partner" 
            className="w-full py-4 border border-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <UserPlus size={14} /> Create Partner Account
          </Link>
        </div>
      </div>
    </div>
  );
}