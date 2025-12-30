"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; 
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. ROLE CHECK: Ensure partners don't log in through the customer portal
      const q = query(collection(db, "providers"), where("adminUid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If they are a partner, block them and sign them out from this portal
        setError("This portal is for customers. Please use the Partner Login page.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // EMAIL VERIFICATION REMOVED
      // Users can now log in immediately after signing up.

      router.push("/");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the Google user is a registered partner
      const q = query(collection(db, "providers"), where("adminUid", "==", user.uid));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        // If they are a partner, send them to the partner console
        router.push("/partner");
      } else {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: user.displayName || "User",
            email: user.email,
            phone: "", 
            createdAt: new Date().toISOString()
          });
        }
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError("Google Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 selection:bg-blue-600">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-500">
        <h2 className="text-4xl font-black text-center mb-2 tracking-tight text-slate-900 dark:text-white uppercase italic">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8 font-medium uppercase text-[10px] tracking-widest">Log in to manage your services</p>
        
        {error && (
          <div className="mb-6 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl text-center border border-red-500/20 font-bold animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" 
              className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-600 transition-all text-slate-900 dark:text-white font-bold" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-600 transition-all text-slate-900 dark:text-white font-bold" 
            />
          </div>
          <button 
            disabled={loading} 
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"} <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="relative my-10 text-center">
          <hr className="border-slate-200 dark:border-slate-800" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-4 text-[10px] text-slate-400 font-black tracking-widest uppercase">Secure Auth</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest">
          New here? <Link href="/signup" className="text-blue-500 font-black hover:underline ml-1">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
