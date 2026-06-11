'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import Link from 'next/link';

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

export default function StoreFront() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');

    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedProducts = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fixes the NaN issue by stripping formatting characters
  const formatPrice = (priceVal: any) => {
    if (!priceVal) return "0";
    const cleanString = String(priceVal).replace(/[^0-9]/g, '');
    const parsed = parseInt(cleanString, 10);
    return isNaN(parsed) ? "0" : parsed.toLocaleString();
  };

  // Converts standard ImgBB viewer links into raw image assets automatically
  const cleanImageUrl = (url: string) => {
    if (!url) return "";
    let trimmed = url.trim();
    if (trimmed.includes("ibb.co/") && !trimmed.includes("i.ibb.co/")) {
      const parts = trimmed.split("ibb.co/");
      if (parts[1]) {
        const id = parts[1].split("/")[0];
        return `https://i.ibb.co/${id}/image.png`;
      }
    }
    return trimmed;
  };

  const categories = ['ALL', 'PADEL', 'PICKLEBALL', 'TABLE TENNIS', 'CRICKET', 'BADMINTON'];

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category?.toUpperCase() === activeCategory);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-500 font-black tracking-widest uppercase text-xs">Initializing Elite Registry...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black pb-24">
      <div className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center">
          <span className="text-emerald-500 font-black tracking-wider text-[10px] uppercase mr-4">Filter Domain:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
                activeCategory === cat 
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        <div>
          <h1 className="text-xs font-black text-emerald-400 tracking-widest uppercase mb-2">Premium Equipment Repertoire</h1>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Available Inventory</h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-900 rounded-3xl p-16 text-center">
            <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm">No assets registered under this domain node yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const rawImage = product.mediaUrl || product.imageUrl || product.image || "";
              const displayImage = cleanImageUrl(rawImage);
              const marketPrice = product.marketPrice || product.marketRate || product.standardRate;
              const elitePrice = product.elitePrice || product.discountPrice || product.salePrice;

              return (
                <Link 
                  href={`/store/${product.id}`} 
                  key={product.id}
                  className="group bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl aspect-square w-full flex items-center justify-center p-6 relative overflow-hidden">
                      {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt={product.name} 
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">No Image Asset</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase block">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-100 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-zinc-500 line-through text-[10px] font-mono block">
                        Rs {formatPrice(marketPrice)}
                      </span>
                      <span className="text-emerald-400 font-black text-sm font-mono block">
                        Rs {formatPrice(elitePrice)}
                      </span>
                    </div>
                    <span className="bg-zinc-900 group-hover:bg-emerald-500 border border-zinc-800 group-hover:border-emerald-500 text-[9px] font-black text-zinc-400 group-hover:text-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all">
                      DEAL
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
