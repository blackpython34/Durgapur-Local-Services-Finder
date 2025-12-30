"use client";

import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Camera, Mail, Lock, Phone, MapPin, IndianRupee, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPartner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [form, setForm] = useState({ 
    email: "",
    password: "",
    name: "", 
    phone: "",
    category: "Electrician", 
    subCategory: "", 
    price: "", 
    address: "" 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Firebase Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // REMOVED: Email verification trigger

      await updateProfile(user, { displayName: form.name });

      // 2. Upload Business Photo
      let imageUrl = "https://via.placeholder.com/400";
      if (imageFile) {
        const storageRef = ref(storage, `providers/${user.uid}-${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 3. Create Business Profile
      await addDoc(collection(db, "providers"), { 
        adminUid: user.uid,
        adminEmail: form.email,
        name: form.name,
        phone: form.phone,
        category: form.category,
        subCategory: form.subCategory,
        price: Number(form.price) || 0,
        address: form.address,
        image: imageUrl,
        rating: 5.0,
        views: 0,
        status: "online",
        isVerifiedPartner: true, // Marked as true immediately as we skip email check
        createdAt: serverTimestamp() 
      });
      
      setSuccess(true);
    } catch (e: any) { 
      alert("Registration Error: " + e.message);
    } finally { 
      setLoading(false); 
    }
  };

  if (success) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white text-center p-6">
      <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={48} className="text-blue-500" />
      </div>
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Registration <span className="text-blue-500">Complete</span></h1>
      <p className="text-slate-500 mt-2 uppercase font-bold tracking-widest text-[10px]">
        Your partner profile is now active. You can proceed to your dashboard.
      </p>
      <button 
        onClick={() => router.push("/partner-login")}
        className="mt-8 px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
      >
        Go to Login <ArrowRight size={18}/>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-6">
      <div className="container mx-auto max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
        <h1 className="text-4xl font-black uppercase italic mb-8 tracking-tighter">Partner <span className="text-blue-500">Signup</span></h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup name="email" placeholder="Email Address" type="email" icon={<Mail size={18}/>} onChange={(v: string) => setForm({...form, email: v})} />
            <InputGroup name="password" placeholder="Password" type="password" icon={<Lock size={18}/>} onChange={(v: string) => setForm({...form, password: v})} />
          </div>

          <div className="border-t border-slate-800 my-6 pt-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Details</h3>
            
            <div className="relative group w-full h-32 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 transition-all cursor-pointer overflow-hidden">
              <input 
                type="file" accept="image/*" 
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              {imageFile ? (
                <p className="text-blue-500 font-bold text-xs">{imageFile.name} attached</p>
              ) : (
                <>
                  <Camera size={24} className="text-slate-700 mb-2 group-hover:text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Upload Business Photo</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <InputGroup name="fullname" placeholder="Full Name / Business Name" onChange={(v: string) => setForm({...form, name: v})} />
              <InputGroup name="phone" placeholder="Phone Number" type="tel" icon={<Phone size={18}/>} onChange={(v: string) => setForm({...form, phone: v})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-2">Main Category</label>
                  <select 
                    name="category"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer" 
                    onChange={(e) => setForm({...form, category: e.target.value})}
                  >
                    {["Electrician", "Plumber", "Mechanic", "Tutor", "Tailor"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-2">Specialization</label>
                  <InputGroup 
                    name="specialty"
                    placeholder="e.g. AC Repair" 
                    icon={<Wrench size={16} />} 
                    onChange={(v: string) => setForm({...form, subCategory: v})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputGroup name="price" placeholder="Visiting Fee (₹)" type="number" icon={<IndianRupee size={16}/>} onChange={(v: string) => setForm({...form, price: v})} />
                <InputGroup name="address" placeholder="Service Area" icon={<MapPin size={18}/>} onChange={(v: string) => setForm({...form, address: v})} />
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full py-6 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
            {loading ? <Loader2 className="animate-spin"/> : <UserPlus size={18}/>} Register Account
          </button>
        </form>
      </div>
    </div>
  );
}

function InputGroup({ placeholder, onChange, type = "text", icon, name }: any) {
  return (
    <div className="relative group">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
      <input 
        name={name}
        id={name}
        required 
        type={type} 
        placeholder={placeholder} 
        className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-5 outline-none focus:border-blue-600 font-bold placeholder:text-slate-800 text-white transition-all ${icon ? 'pl-14' : ''}`} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}