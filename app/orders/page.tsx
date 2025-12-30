"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase"; 
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore"; 
import { onAuthStateChanged } from "firebase/auth"; 
import { 
  ShoppingBag, Calendar, CheckCircle, 
  ArrowLeft, Loader2, MapPin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Listen for the authenticated user session
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 2. Reference the orders collection
        const ordersRef = collection(db, "orders");
        
        // 3. FIXED: Query specifically for this user's unique ID
        // This ensures User A never sees User B's orders.
        const q = query(
          ordersRef, 
          where("userId", "==", user.uid), 
          orderBy("createdAt", "desc")
        );

        // 4. Setup real-time listener
        const unsubscribeOrders = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setOrders(data);
          setLoading(false);
        }, (error) => {
          // If you see an error here in the F12 console, you MUST click the link provided
          console.error("Firestore Error:", error);
          setLoading(false);
        });

        return () => unsubscribeOrders();
      } else {
        // Redirect to login if user session is lost
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950 text-blue-600">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-blue-500">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        
        <button 
          onClick={() => router.push("/profile")} 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 font-bold text-xs uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
              <ShoppingBag size={12} /> Transaction History
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
              My <span className="text-blue-600">Bookings</span>
            </h1>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 px-6 py-4 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Spent</p>
            <p className="text-2xl font-black text-white italic tracking-tighter">
              ₹{orders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)}
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle size={10} /> {order.status || "Paid"}
                      </div>
                      <span className="text-slate-700">/</span>
                      <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> 
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Processing'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none">
                        {order.providerName}
                      </h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                        {order.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600">
                       <div className="flex items-center gap-1 text-[10px] font-black uppercase">
                          <MapPin size={12} className="text-blue-600" /> Durgapur, WB
                       </div>
                       <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                       <div className="text-[10px] font-black uppercase tracking-widest">ID: {order.id.slice(0, 8)}</div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Amount Paid</span>
                    <div className="text-4xl font-black text-white tracking-tighter italic leading-none">
                      ₹{order.amount || 299}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-slate-900 rounded-[3rem]">
            <ShoppingBag size={48} className="mx-auto text-slate-800 mb-6" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em] mb-10">
              No service bookings found
            </p>
            <Link href="/search" className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20">
               Explore Services
            </Link>
          </div>
        )}

        <div className="mt-20 flex flex-col items-center opacity-20">
          <span className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-bold mb-1">VERIFIED SYSTEM</span>
          <span className="text-xl font-black tracking-[0.3em] text-blue-500 uppercase">Pixel Pioneers</span>
        </div>

      </div>
    </div>
  );
}