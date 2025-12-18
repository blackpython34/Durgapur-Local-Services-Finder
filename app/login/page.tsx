"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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
      await signInWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError("Google Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-500">
        <h2 className="text-4xl font-black text-center mb-2 tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8 font-medium">Log in to manage your services</p>
        
        {error && <p className="mb-6 text-sm text-red-500 bg-red-50 p-3 rounded-xl text-center">{error}</p>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" className="input-modern" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" className="input-modern" 
            />
          </div>
          <button disabled={loading} className="btn-action w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"} <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="relative my-8 text-center">
          <hr className="border-slate-200 dark:border-slate-800" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-4 text-sm text-slate-400 font-medium">OR</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Login with Google
        </button>

        <p className="mt-8 text-center text-slate-500 font-medium text-sm">
          New here? <Link href="/signup" className="text-brand font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
