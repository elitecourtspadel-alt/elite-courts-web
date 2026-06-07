'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AizasyD4bPvYwRjOAGfiwoVPbG_4hj6QEbgdc9A",
  authDomain: "elitecourtsapp.firebaseapp.com",
  projectId: "elitecourtsapp",
  storageBucket: "elitecourtsapp.appspot.com",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d",
  databaseURL: "https://elitecourtsapp-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      setProducts(data ? Object.values(data) : []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2 tracking-tight">Elite Store</h1>
          <p className="text-zinc-400 text-sm md:text-base">Premium racket sports gear delivered straight to your court.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-zinc-500 animate-pulse font-medium">Loading premium gear...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/50 rounded-2xl border border-zinc-900">
            <p className="text-zinc-500 italic">New premium stock arriving soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <div 
                key={i} 
                className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-xl hover:border-zinc-700 transition-all duration-300 group"
              >
                {/* Product Image Box */}
                <div className="w-full h-56 bg-zinc-950 overflow-hidden relative border-b border-zinc-800">
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={p.name} 
                  />
                  <span className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Offer
                  </span>
                </div>
                
                {/* Content Box */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-3 tracking-tight line-clamp-2">{p.name}</h3>
                    
                    {/* Anchored Pricing Layout */}
                    <div className="flex items-baseline gap-2.5 mb-6">
                      <span className="text-zinc-500 line-through text-sm font-medium">
                        {p.marketPrice}
                      </span>
                      <span className="text-emerald-400 font-extrabold text-2xl tracking-tight">
                        {p.elitePrice}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.open(`https://wa.me/923084708858?text=Salam!%20I%20am%20interested%20in%20buying%20the%20${encodeURIComponent(p.name)}.%20Is%20it%20available?`, '_blank')} 
                    className="w-full bg-emerald-500 py-3 rounded-xl font-bold text-black hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Order on WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
