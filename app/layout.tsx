"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
// CHANGED: Added onSnapshot for real-time name reflection
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore"; 
import { 
  User, 
  LogOut, 
  Loader2, 
  Facebook, 
  Instagram, 
  Twitter, 
  MapPin, 
  Mail, 
  Phone, 
  LifeBuoy,
  ShoppingBag,
  Briefcase,
  LayoutDashboard 
} from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isPartner, setIsPartner] = useState(false); 
  const [authLoading, setAuthLoading] = useState(true);
  // NEW: State to hold the real-time name from Firestore
  const [dbUserName, setDbUserName] = useState<string | null>(null); 
  const router = useRouter();

  useEffect(() => {
    let unsubUserDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Check if this UID exists in the providers collection
        const q = query(collection(db, "providers"), where("adminUid", "==", currentUser.uid));
        const snap = await getDocs(q);
        setIsPartner(!snap.empty);

        // 2. CHANGED: Listen to Firestore 'users' doc for instant name reflection
        unsubUserDoc = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setDbUserName(docSnap.data().name || currentUser.displayName || "User");
          } else {
            setDbUserName(currentUser.displayName || "User");
          }
        });
      } else {
        setIsPartner(false);
        setDbUserName(null);
      }
      
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-brand selection:text-white">
        
        {/* --- NAVBAR --- */}
        <nav className="glass-nav sticky top-0 z-50 w-full h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="container mx-auto flex h-full items-center justify-between px-6">
            <Link href="/" className="text-2xl font-black text-brand tracking-tighter shrink-0">
              DURGAPUR<span className="text-white">SERVICES</span>
            </Link>
            
            <div className="flex items-center gap-10">
              <div className="hidden lg:flex items-center gap-10 text-[14px] font-bold uppercase tracking-widest text-slate-300">
                <Link href="/" className="hover:text-brand transition-colors">Home</Link>
                <Link href="/about" className="hover:text-brand transition-colors">About Us</Link>
                <Link href="/search" className="hover:text-brand transition-colors">Find Help</Link>
                
                {user && (
                  <Link href="/orders" className="hover:text-brand transition-colors flex items-center gap-2">
                    <ShoppingBag size={16} /> My Bookings
                  </Link>
                )}

                {/* DYNAMIC PARTNER LINK */}
                {authLoading ? null : user ? (
                  isPartner ? (
                    <Link href="/partner" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                      <LayoutDashboard size={16} /> My Business
                    </Link>
                  ) : (
                    <Link href="/register-partner" className="text-brand border border-brand/30 px-4 py-2 rounded-xl hover:bg-brand hover:text-white transition-all flex items-center gap-2">
                      <Briefcase size={16} /> Be a Partner
                    </Link>
                  )
                ) : (
                  <Link href="/partner-login" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <Briefcase size={16} /> Partner Login
                  </Link>
                )}
              </div>
              
              <div className="flex items-center gap-6 border-l border-slate-800 pl-8">
                {authLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                ) : user ? (
                  <div className="flex items-center gap-6">
                    <Link href="/profile" className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-bold shadow-lg shadow-brand/20">
                        <User size={20} />
                      </div>
                      <span className="hidden md:block text-sm font-black text-white uppercase tracking-tight group-hover:text-brand transition-colors">
                        {/* CHANGED: Uses dbUserName for instant updates */}
                        Hi, {dbUserName?.split(" ")[0] || "User"}
                      </span>
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={22} />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 text-sm font-black hover:text-brand transition-all uppercase tracking-widest">
                    <User size={20} /> Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          {children}
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800 mt-auto">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <Link href="/" className="text-2xl font-black text-white tracking-tighter">
                  DURGAPUR<span className="text-brand">SERVICES</span>
                </Link>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Connecting Durgapur's residents with verified local service providers. Reliable assistance at your doorstep.
                </p>
                <div className="flex gap-4">
                  <Facebook size={20} className="hover:text-brand cursor-pointer transition-colors" />
                  <Instagram size={20} className="hover:text-brand cursor-pointer transition-colors" />
                  <Twitter size={20} className="hover:text-brand cursor-pointer transition-colors" />
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Our Services</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link href="/search" className="hover:text-brand transition-colors">Electrician</Link></li>
                  <li><Link href="/search" className="hover:text-brand transition-colors">Plumber</Link></li>
                  <li><Link href="/search" className="hover:text-brand transition-colors">Mechanic</Link></li>
                  <li><Link href="/search" className="hover:text-brand transition-colors">Tutor</Link></li>
                  <li><Link href="/search" className="hover:text-brand transition-colors">Tailor</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Support</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link href="/about" className="hover:text-brand transition-colors">About PIXEL PIONEERS</Link></li>
                  <li><Link href="/orders" className="hover:text-brand transition-colors">My Orders</Link></li>
                  
                  <li>
                    {isPartner ? (
                      <Link href="/partner" className="hover:text-brand transition-colors">Partner Console</Link>
                    ) : (
                      <Link href="/register-partner" className="hover:text-brand transition-colors">Join as a Partner</Link>
                    )}
                  </li>
                  
                  <li><Link href="#" className="flex items-center gap-1 hover:text-brand transition-colors">
                    <LifeBuoy size={14} /> Help Center
                  </Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6 text-lg tracking-tight">Contact</h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-3"><MapPin size={18} className="text-brand" /> City Centre, Durgapur</li>
                  <li className="flex items-center gap-3"><Phone size={18} className="text-brand" /> +91 98765 43210</li>
                  <li className="flex items-center gap-3"><Mail size={18} className="text-brand" /> support@durgapurservices.in</li>
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                © {new Date().getFullYear()} Durgapur Services Finder.
              </p>
              <div className="flex items-center gap-3 px-6 py-2 bg-slate-800/50 rounded-full border border-slate-700">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Made by</span>
                <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-brand">
                  PIXEL PIONEERS
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}