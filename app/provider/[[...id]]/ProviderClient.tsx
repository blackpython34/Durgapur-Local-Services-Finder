"use client";

// FIX for Image_272624.png: Satisfy "output: export" requirement
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase"; 
import { 
  doc, getDoc, collection, addDoc, 
  serverTimestamp, query, where, 
  orderBy, onSnapshot, updateDoc, increment, getDocs
} from "firebase/firestore";
import { 
  Phone, MessageCircle, Star, ShieldCheck, 
  MapPin, CheckCircle, ArrowLeft, Loader2, Lock, X, CheckCircle2 
} from "lucide-react";

export default function ProviderDetail() {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("input");

  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const paramId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const finalId = lastSegment !== 'provider' ? lastSegment : paramId;
    if (finalId && finalId !== '1' && finalId !== 'placeholder') {
      setId(finalId);
    }
  }, [params]);

  useEffect(() => {
    async function getProvider() {
      if (!id || id === '1' || id === 'placeholder') return; 
      try {
        setLoading(true);
        const docRef = doc(db, "providers", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProvider(docSnap.data());
          await updateDoc(docRef, {
            views: increment(1)
          });
        }
      } catch (error) {
        console.error("Error fetching provider or updating views:", error);
      } finally {
        setLoading(false);
      }
    }
    getProvider();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "reviews"),
      where("providerId", "==", id),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setAllReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [id]);

  // FIXED: Logic to ensure latest name is used and booking exists
  const submitReview = async () => {
    if (!auth.currentUser) return alert("Please login to review");
    if (!userComment.trim()) return alert("Please write a comment");
    
    setSubmittingReview(true);
    try {
      const uid = auth.currentUser.uid;

      // 1. Check if user has an existing order for this provider
      const bookingQuery = query(
        collection(db, "orders"),
        where("userId", "==", uid),
        where("providerId", "==", id)
      );
      const bookingSnap = await getDocs(bookingQuery);
      
      if (bookingSnap.empty) {
        alert("You must book this service before leaving a review.");
        setSubmittingReview(false);
        return;
      }

      // 2. Fetch latest name from 'users' collection for real-time sync
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      const latestName = userDocSnap.exists() 
        ? userDocSnap.data().name 
        : (auth.currentUser.displayName || "Anonymous User");

      await addDoc(collection(db, "reviews"), {
        providerId: id,
        userId: uid,
        userName: latestName, // Uses the updated name from Identity
        rating: userRating,
        comment: userComment,
        createdAt: serverTimestamp()
      });

      setUserComment("");
      setUserRating(5);
      alert("Review posted successfully!");
    } catch (err) { 
      console.error(err);
      alert("Error submitting review. Please try again.");
    } finally { 
      setSubmittingReview(false); 
    }
  };

  const handleConfirmBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to complete your booking.");
      router.push("/login");
      return;
    }
    setPaymentStep("processing");
    setTimeout(async () => {
      try {
        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          userEmail: user.email,
          providerId: id,
          adminUid: provider.adminUid, 
          providerName: provider.name,
          category: provider.category,
          amount: Number(provider.price) || 299, 
          status: "Paid",
          createdAt: serverTimestamp(),
        });
        setPaymentStep("success");
      } catch (error) {
        setPaymentStep("input");
      }
    }, 2000);
  };

  const openMaps = () => {
    const address = provider?.address || "Durgapur";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " Durgapur")}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppBooking = () => {
    if (!provider?.phone) {
      alert("Contact number not verified for this provider.");
      return;
    }
    const cleanPhone = provider.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${provider.name}, I need your ${provider.category} service...`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  const isOwner = auth.currentUser?.uid === provider?.adminUid;
  const isOffline = provider?.status === "offline";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-blue-500">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 font-bold text-xs uppercase tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Search
        </button>

        <div className={`bg-slate-900/40 border ${isOwner ? 'border-blue-500/40' : isOffline ? 'border-red-900/40' : 'border-slate-800'} rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12`}>
          {isOwner ? (
            <div className="absolute top-0 left-0 w-full bg-blue-600 text-white py-2 text-center text-[10px] font-black uppercase tracking-widest z-10">
              You are viewing your own professional profile
            </div>
          ) : isOffline ? (
            <div className="absolute top-0 left-0 w-full bg-red-600 text-white py-2 text-center text-[10px] font-black uppercase tracking-widest z-10">
              Provider is Currently Offline
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-xl bg-slate-800">
                {provider.image ? <img src={provider.image} className={`w-full h-full object-cover ${isOffline && !isOwner ? 'grayscale opacity-50' : ''}`} alt={provider.name} /> : <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white"><ShieldCheck size={64} /></div>}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle size={12} /> Verified Pro
                </div>
                <h1 className={`text-4xl md:text-6xl font-black tracking-tighter ${isOffline && !isOwner ? 'text-slate-500' : 'text-white'}`}>{provider.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star size={18} fill="currentColor" /> {provider.rating || '5.0'}
                  </span>
                  <span className="text-slate-700">|</span>
                  <span className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-blue-500">{provider.category}</span>
                  <span className="text-slate-700">|</span>
                  <button onClick={openMaps} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:text-blue-500 transition-colors">
                    <MapPin size={14} className="text-blue-500" /> {provider.address || "Durgapur, WB"}
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">About Service</h4>
                <p className="text-slate-400 leading-relaxed max-w-2xl font-medium">Professional expert specialized in {provider.subCategory || provider.category} serving the Durgapur community.</p>
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
                  disabled={isOwner}
                  onClick={handleWhatsAppBooking} 
                  className={`flex-1 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${isOwner ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-[#00D95F] hover:bg-[#00c254] shadow-green-500/10'}`}
                >
                  <MessageCircle size={20} /> {isOwner ? "Owner View" : "WhatsApp"}
                </button>
                <button 
                  disabled={isOffline || isOwner}
                  onClick={() => setShowPaymentModal(true)} 
                  className={`flex-1 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isOffline || isOwner ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'}`}
                >
                  {isOwner ? "Owner View" : isOffline ? "Offline" : "Book Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews and Feedback section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 h-fit">
            <h3 className="text-2xl font-black mb-6 uppercase italic text-blue-500">Rate this Pro</h3>
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`cursor-pointer transition-all ${star <= userRating ? "text-yellow-500 fill-yellow-500 scale-110" : "text-slate-700"}`}
                  onClick={() => setUserRating(star)}
                />
              ))}
            </div>
            <textarea 
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl mb-6 outline-none focus:border-blue-500 text-slate-300 font-medium min-h-[150px]"
              placeholder="Share your experience..."
            />
            <button 
              onClick={submitReview} 
              disabled={submittingReview || isOwner}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isOwner ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              {submittingReview ? <Loader2 className="animate-spin" size={18} /> : isOwner ? "Review Disabled" : "Post Review"}
            </button>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Client <span className="text-blue-500">Feedback</span></h3>
            <div className="max-h-[600px] overflow-y-auto pr-4 space-y-6 scrollbar-hide">
              {allReviews.length > 0 ? allReviews.map((rev) => (
                <div key={rev.id} className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-[2rem]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-[10px] uppercase tracking-widest text-blue-500">{rev.userName}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < rev.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-800"} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">
                      {rev.createdAt?.toDate ? rev.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{rev.comment}</p>
                </div>
              )) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-[2rem]">
                  <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}