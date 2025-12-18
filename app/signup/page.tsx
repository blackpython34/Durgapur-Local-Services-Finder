"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { User, Mail, Phone, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create User in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Set Display Name in Auth
      await updateProfile(user, { displayName: formData.name });

      // 3. Store additional data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-500">
        <h2 className="text-4xl font-black text-center mb-2 tracking-tight">Join Us</h2>
        <p className="text-slate-500 text-center mb-8 font-medium">Create your account to get started</p>
        
        {error && <p className="mb-6 text-sm text-red-500 bg-red-50 p-3 rounded-xl text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" required placeholder="Full Name" className="input-modern" 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" required placeholder="Email Address" className="input-modern" 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="tel" required placeholder="Phone Number" className="input-modern" 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" required placeholder="Password" className="input-modern" 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button disabled={loading} className="btn-action w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up"} <ArrowRight size={20} />
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-500 font-medium text-sm">
          Already have an account? <Link href="/login" className="text-brand font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}