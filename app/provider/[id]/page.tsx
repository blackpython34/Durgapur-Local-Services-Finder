"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Phone, MessageCircle, Star, ShieldCheck, 
  MapPin, CheckCircle, ArrowLeft, Loader2, Lock, X, CheckCircle2 
} from "lucide-react";

export default function ProviderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for Booking and Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("input");

  useEffect(() => {
    async function getProvider() {
      try {
        const docRef = doc(db, "providers", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProvider(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching provider:", error);
      } finally {
        setLoading(false);
      }
    }
    getProvider();
  }, [id]);

  // NEW HELPER: Logic to open Google Maps
  const openMaps = () => {
    const address = provider.address || "Durgapur";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " Durgapur")}`;
    window.open(url, '_blank');
  };

  const handleConfirmBooking = async () => {
    setPaymentStep("processing");
    setTimeout(async () => {
      try {
        await addDoc(collection(db, "orders"), {
          providerId: id,
          providerName: provider.name,
          category: provider.category,
          amount: provider.price || 299,
          status: "Paid",
          createdAt: serverTimestamp(),
        });
        setPaymentStep("success");
      } catch (error) {
        setPaymentStep("input");
      }
    }, 2000);
  };

  const handleWhatsAppBooking = () => {
    if (!provider?.phone) {
      alert("Contact number not verified for this provider.");
      return;
    }
    const cleanPhone = provider.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hi ${provider.name}, I need your ${provider.category} (${provider.subCategory}) service at the rate of ₹${provider.price || '299'}. (Verified via DURGAPUR SERVICES). Please confirm availability.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-blue-500">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 font-bold text-xs uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Search
        </button>

        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-xl bg-slate-800">
                {provider.image ? (
                  <img src={provider.image} className="w-full h-full object-cover" alt={provider.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                    <ShieldCheck size={64} />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle size={12} /> Verified Pro
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                  {provider.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star size={18} fill="currentColor" /> {provider.rating || '5.0'}
                  </span>
                  <span className="text-slate-700">|</span>
                  <span className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-blue-500">
                    {provider.category}
                  </span>
                  <span className="text-slate-700">|</span>
                  <span className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-slate-300">
                    {provider.subCategory}
                  </span>
                  <span className="text-slate-700">|</span>
                  
                  {/* UPDATED: Clickable Location Badge */}
                  <button 
                    onClick={openMaps}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:text-blue-500 transition-colors"
                  >
                    <MapPin size={14} className="text-blue-500" /> {provider.address || "Durgapur, WB"}
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">About Service</h4>
                <p className="text-slate-400 leading-relaxed max-w-2xl font-medium">
                  Professional expert specialized in {provider.subCategory} with years of experience serving the Durgapur community.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900/60 p-8 rounded-[2rem] border border-slate-800/50">
            <div className="grid grid-cols-2 gap-4">
              {["Background Checked", "Insurance Covered", "No Hidden Costs", "24/7 Support"].map((text) => (
                <div key={text} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-400">
                  <CheckCircle size={14} className="text-blue-500" /> {text}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Service Fee</p>
                <p className="text-4xl font-black text-white tracking-tighter">₹{provider.price || '299'}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleWhatsAppBooking}
                  className="flex-1 px-6 py-5 bg-[#00D95F] hover:bg-[#00c254] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-500/10"
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </button>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="flex-1 px-6 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT MODAL */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <button onClick={() => {setShowPaymentModal(false); setPaymentStep("input");}} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="p-8">
                {paymentStep === "input" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Secure Booking</h3>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Payable</span>
                      <span className="text-2xl font-black text-blue-500">₹{provider.price || 299}</span>
                    </div>
                    <button onClick={handleConfirmBooking} className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest">Confirm Payment</button>
                  </div>
                )}
                {paymentStep === "processing" && (
                  <div className="py-12 flex flex-col items-center gap-6 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Processing Transaction...</p>
                  </div>
                )}
                {paymentStep === "success" && (
                  <div className="py-12 flex flex-col items-center text-center space-y-6">
                    <CheckCircle2 size={64} className="text-green-500" />
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Confirmed!</h4>
                    <button onClick={() => setShowPaymentModal(false)} className="w-full py-4 border border-slate-800 rounded-xl font-bold text-xs uppercase text-slate-400">Close</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex flex-col items-center justify-center opacity-30">
          <div className="px-10 py-4 rounded-full border border-blue-500/30 bg-blue-500/5">
            <span className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-bold block mb-1 text-center">MADE BY</span>
            <span className="text-xl font-black tracking-[0.3em] text-blue-500 uppercase">Pixel Pioneers</span>
          </div>
        </div>
      </div>
    </div>
  );
}