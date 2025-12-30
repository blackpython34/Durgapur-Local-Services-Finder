"use client";

// FIX for Image_272624.png: Satisfy "output: export" requirement
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, query, where, onSnapshot, 
  orderBy, doc, updateDoc, setDoc 
} from "firebase/firestore"; // ADDED setDoc for dual-write
import { onAuthStateChanged } from "firebase/auth";
import { 
  LayoutDashboard, IndianRupee, Star, Users, 
  CheckCircle2, Clock, Settings, Loader2, 
  Power, Save, MapPin, Eye, Check, Wrench, X
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PartnerConsole() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [providerData, setProviderData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [stats, setStats] = useState({ 
    revenue: 0, 
    activeJobs: 0, 
    rating: 0, 
    views: 0,
    reviewCount: 0 
  });

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    address: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/login"); return; }

      const qProvider = query(collection(db, "providers"), where("adminUid", "==", user.uid));
      
      const unsubProvider = onSnapshot(qProvider, (snap) => {
        if (snap.empty) { 
          setLoading(false); 
          alert("Access Denied: Partner Profile Required.");
          router.push("/");
          return; 
        }
        
        const pDoc = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
        setProviderData(pDoc);
        
        setFormData({
          name: pDoc?.name || "",
          price: pDoc?.price || "",
          category: pDoc?.category || "",
          subCategory: pDoc?.subCategory || "",
          address: pDoc?.address || ""
        });

        const qOrders = query(collection(db, "orders"), where("providerId", "==", pDoc.id), orderBy("createdAt", "desc"));
        const unsubOrders = onSnapshot(qOrders, (orderSnap) => {
          const orderData = orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          setOrders(orderData);
          
          const qReviews = query(collection(db, "reviews"), where("providerId", "==", pDoc.id), orderBy("createdAt", "desc"));
          onSnapshot(qReviews, (revSnap) => {
            const revData = revSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            setReviews(revData);
            
            if (pDoc && orderData) {
                setStats({
                  revenue: orderData
                    .filter((o: any) => o?.status === "Paid" || o?.status === "Completed")
                    .reduce((acc: number, c: any) => acc + (Number(c?.amount) || 0), 0),
                  activeJobs: orderData.filter((o: any) => o?.status === "Accepted").length,
                  rating: Number(pDoc?.rating) || 5.0,
                  views: Number(pDoc?.views) || 0,
                  reviewCount: revData.length
                });
            }
            setLoading(false);
          });
        });
      });
      return () => unsubProvider();
    });
    return () => unsubscribeAuth();
  }, [router]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!orderId) return;
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
    } catch (e: any) { 
        console.error("Update Error:", e);
        alert("Failed to update status: " + e.message); 
    }
  };

  // FIXED: Sync name changes across providers and users collections
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerData?.id || !auth.currentUser) return;
    setIsSaving(true);
    try {
      const uid = auth.currentUser.uid;
      const providerRef = doc(db, "providers", providerData.id);
      const userRef = doc(db, "users", uid);

      // 1. Update the Business Profile
      await updateDoc(providerRef, { 
        ...formData, 
        price: Number(formData.price) 
      });

      // 2. CRITICAL SYNC: Update the User Identity document
      // This ensures the Profile Page and Navbar reflect the name change instantly.
      await setDoc(userRef, { 
        name: formData.name 
      }, { merge: true });

      alert("Partner Profile & Identity Updated Successfully!");
    } catch (e: any) { 
      console.error("Update Error:", e);
      alert("Update failed: " + e.message); 
    }
    finally { setIsSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-blue-600">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 bg-slate-900/40 p-2 rounded-3xl border border-slate-800 w-fit">
          {["dashboard", "leads", "settings", "reviews"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-2">Partner Dashboard</p>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">{providerData?.name} <span className="text-blue-600">Console</span></h1>
              </div>
              <button onClick={async () => {
                const newStatus = providerData?.status === "online" ? "offline" : "online";
                await updateDoc(doc(db, "providers", providerData.id), { status: newStatus });
              }} className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center gap-2 ${providerData?.status === 'online' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                <Power size={14} /> {providerData?.status === 'online' ? 'Online' : 'Offline'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard label="Earnings" value={`₹${stats.revenue}`} icon={<IndianRupee />} color="text-green-500" />
              <StatCard label="Active Jobs" value={stats.activeJobs} icon={<Clock />} color="text-blue-500" />
              <StatCard label="Reputation" value={`${stats.rating} (${stats.reviewCount})`} icon={<Star />} color="text-yellow-500" />
              <StatCard label="30D Views" value={stats.views} icon={<Eye />} color="text-purple-500" />
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black uppercase italic">Lead <span className="text-blue-600">Management</span></h2>
            <div className="grid grid-cols-1 gap-4">
              {orders.length > 0 ? orders.map((order: any) => (
                <div key={order.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 text-blue-500"><Users size={24} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500">Email: {order?.userEmail}</p>
                      <h4 className="text-xl font-black uppercase tracking-tight">Booking ID: {order?.id?.slice(0,8)}</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase mt-2 ${order?.status === 'Paid' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>{order?.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    {order?.status === "Paid" && (
                      <button onClick={() => updateStatus(order.id, "Accepted")} className="flex-1 md:flex-none px-8 py-4 bg-green-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all">Accept</button>
                    )}
                    {order?.status === "Accepted" && (
                      <button onClick={() => updateStatus(order.id, "Completed")} className="flex-1 md:flex-none px-8 py-4 bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">Complete</button>
                    )}
                    <button className="flex-1 md:flex-none px-8 py-4 bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400">Details</button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No active orders</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black uppercase italic mb-8">Business <span className="text-blue-600">Configuration</span></h2>
            <form onSubmit={saveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800">
              <div className="space-y-6">
                <InputGroup label="Business Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Service Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 font-bold outline-none focus:border-blue-600 transition-all"
                    >
                      {["Electrician", "Plumber", "Mechanic", "Tutor", "Tailor"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <InputGroup label="Specialization" value={formData.subCategory} icon={<Wrench size={16}/>} onChange={(v: string) => setFormData({...formData, subCategory: v})} />
              </div>

              <div className="space-y-6">
                <InputGroup label="Fee (₹)" type="number" value={formData.price} icon={<IndianRupee size={16}/>} onChange={(v: string) => setFormData({...formData, price: v})} />
                <InputGroup label="Place / Address" value={formData.address} icon={<MapPin size={16}/>} onChange={(v: string) => setFormData({...formData, address: v})} />
                <div className="pt-4">
                  <button type="submit" disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                    {isSaving ? <Loader2 className="animate-spin"/> : <><Save size={18} /> Save Settings</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black uppercase italic">Client <span className="text-blue-600">Feedback</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.length > 0 ? reviews.map((rev: any) => (
                <div key={rev.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black uppercase text-blue-500 text-sm tracking-widest">{rev?.userName}</h4>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < rev?.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-800"} />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium italic">"{rev?.comment}"</p>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No feedback received</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter uppercase">{value}</h3>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 font-bold outline-none focus:border-blue-600 transition-all ${icon ? 'pl-14' : ''}`} 
        />
      </div>
    </div>
  );
}