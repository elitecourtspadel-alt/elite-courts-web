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

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      setProducts(data ? Object.values(data) : []);
    });
  }, []);

  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-4xl font-bold text-emerald-400 mb-2">Elite Store</h1>
      <p className="text-zinc-500 mb-8">Premium gear for serious players.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all">
            <img src={p.image} className="rounded-xl mb-4 w-full h-48 object-cover" alt={p.name} />
            <h3 className="text-xl font-bold mb-2">{p.name}</h3>
            
            {/* Price Anchoring Section */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-zinc-500 line-through text-sm">
                {p.marketPrice}
              </span>
              <span className="text-emerald-400 font-bold text-2xl">
                {p.elitePrice}
              </span>
            </div>

            <button 
              onClick={() => window.open(`https://wa.me/923084708858?text=I%20am%20interested%20in%20buying%20the%20${p.name}`, '_blank')} 
              className="w-full bg-emerald-500 py-3 rounded-lg font-bold text-black hover:bg-emerald-400 transition-colors"
            >
              Order on WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
