"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebase"; // Ensure storage is exported from your firebase config
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Added for file uploads
import { useRouter } from "next/navigation";
import { UserPlus, Briefcase, Loader2, CheckCircle2, ArrowLeft, Camera } from "lucide-react";

export default function RegisterPartner() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the selected file
  const [form, setForm] = useState({ name: "", category: "Electrician", subCategory: "", price: "", phone: "", address: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "https://via.placeholder.com/400";

      // Upload image if one is selected
      if (imageFile) {
        const storageRef = ref(storage, `providers/${Date.now()}-${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "providers"), { 
        ...form, 
        price: Number(form.price), 
        rating: 5.0, 
        image: imageUrl, // Use the uploaded image URL
        createdAt: serverTimestamp() 
      });
      
      setSuccess(true);
      setTimeout(() => router.push("/search"), 2000);
    } catch (e) { 
      alert("Error! Check Firestore and Storage Rules."); 
    } finally { 
      setLoading(false); 
    }
  };

  if (success) return <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white"><CheckCircle2 size={80} className="text-green-500 mb-4"/><h1 className="text-4xl font-black uppercase italic">Welcome to the Team!</h1></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-6">
      <div className="container mx-auto max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
        <h1 className="text-4xl font-black uppercase italic mb-8 tracking-tighter">Become a <span className="text-blue-500">Partner</span></h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Custom File Upload Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Profile Photo</label>
            <div className="relative group w-full h-32 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 transition-all cursor-pointer overflow-hidden">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              {imageFile ? (
                <div className="text-center">
                   <p className="text-blue-500 font-bold text-xs">{imageFile.name}</p>
                   <p className="text-slate-600 text-[8px] uppercase mt-1">File Selected</p>
                </div>
              ) : (
                <>
                  <Camera size={24} className="text-slate-600 mb-2 group-hover:text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Click to upload photo</span>
                </>
              )}
            </div>
          </div>

          <input required type="text" placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-blue-500" onChange={(e) => setForm({...form, name: e.target.value})} />
          <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white" onChange={(e) => setForm({...form, category: e.target.value})}>
            {["Electrician", "Plumber", "Mechanic", "Tutor", "Tailor"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input required type="text" placeholder="Specialization (e.g. AC Repair)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4" onChange={(e) => setForm({...form, subCategory: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
              <input required type="number" placeholder="Visiting Fee (₹)" className="bg-slate-950 border border-slate-800 rounded-xl p-4" onChange={(e) => setForm({...form, price: e.target.value})} />
              <input required type="tel" placeholder="Phone Number" className="bg-slate-950 border border-slate-800 rounded-xl p-4" onChange={(e) => setForm({...form, phone: e.target.value})} />
          </div>
          <input required type="text" placeholder="Service Area (Durgapur Address)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4" onChange={(e) => setForm({...form, address: e.target.value})} />
          <button disabled={loading} className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : <UserPlus size={18}/>} 
            Register Now
          </button>
        </form>
      </div>
    </div>
  );
}