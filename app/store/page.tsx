'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import Link from 'next/link';

// Firebase configuration structure
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
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Fetch real-time store assets from Firebase RTDB
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

  // Safe formatting to protect against "NaN" crashes if values are strings or raw numbers
  const formatPrice = (priceVal: any) => {
    if (priceVal === undefined || priceVal === null || priceVal === "") return "0";
    const cleanString = String(priceVal).replace(/[^0-9]/g, '');
    const parsed = parseInt(cleanString, 10);
    return isNaN(parsed) ? "0" : parsed.toLocaleString();
  };

  // Automated string extraction for ImgBB viewer conversions
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

  // Filter products matching selected UI tags
  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => p.category?.toUpperCase() === activeCategory);

  const totalAssetsCount = products.length;

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black pb-24">
      {/* Dynamic Upper Control Header */}
      <div className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-black uppercase tracking-widest text-zinc-100">
              Elite Store Engine <span className="text-emerald-400 font-mono text-xs ml-1">v2.1</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-zinc-500 hover:text-emerald-400 text-xs font-bold tracking-wider uppercase transition-colors">
              [ Open Matrix Admin ]
            </Link>
            <div className="bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Sync State: <span className="text-emerald-400 font-bold">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* ================= HERO SECTION BANNER ================= */}
        {/* New full-bleed landscape hero banner configuration */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800/80 min-h-[420px] animate-fadeIn shadow-2xl">
          
          {/* Main expansive landscape background photo */}
          <img
            src="/images/padel-img.webp"
            alt="Elite High Performance Sports Facility"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://i.ibb.co/L8N3CgX/elite-courts-padel-card.webp"; // Fallback directly if needed
            }}
          />
          
          {/* Legibility Scrim: Dark gradient to ensure text remains perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          
          {/* Content Overlay */}
          <div className="relative z-20 p-8 md:p-12 flex flex-col justify-center gap-8 h-full">
            <div className="space-y-4 max-w-xl text-left">
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Premium Engineered Athletics
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-100 leading-tight">
                GEAR UP WITH <br className="hidden md:inline" /><span className="text-emerald-400">ELITE</span> PRECISION
              </h1>
              <p className="text-zinc-100 text-sm md:text-base max-w-md font-medium leading-relaxed shadow-text">
                Discover high-end configurations, advanced computational setups, and pro-grade sports gear optimized for peak competitive dominance. Built for players who control the speed of the court.
              </p>
              
              {/* Call-to-action buttons */}
              <div className="pt-2 flex flex-wrap gap-3 justify-start">
                <button 
                  onClick={() => {
                    const el = document.getElementById('trending-rep');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5"
                >
                  Explore Padel Equipment
                </button>
                <button 
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  View Trending Repertoire
                </button>
              </div>
            </div>
            
            {/* Real-time data manifest footer */}
            <div className="mt-auto border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="flex gap-2.5 items-center">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <div>Total Inventory: <span className="text-zinc-100 font-bold">{totalAssetsCount} Items</span></div>
              </div>
              <div className="hidden sm:block text-zinc-800">|</div>
              <div>Operational Domain: Lahore, Pakistan</div>
            </div>
          </div>
        </div>
        {/* ======================================================= */}

        {/* Categories Controller Grid Filter */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-4">
          {['ALL', 'PADEL', 'PICKLEBALL', 'BADMINTON', 'CRICKET'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-black border-emerald-500 font-black shadow-lg shadow-emerald-500/10'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Catalog Stream Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 h-96 animate-pulse flex flex-col justify-between">
                <div className="bg-zinc-900 aspect-square rounded-xl w-full" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-zinc-900 rounded w-2/3" />
                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <h3 className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-1">No Assets Available</h3>
            <p className="text-zinc-600 text-xs">No active inventory matches this query stream inside Firebase.</p>
          </div>
        ) : (
          /* Core Active Catalog Grid Display */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const rawImage = product.mediaUrl || product.imageUrl || product.image || "";
              const displayImage = cleanImageUrl(rawImage);
              const marketPrice = product.marketPrice || product.marketRate || product.standardRate;
              const elitePrice = product.elitePrice || product.discountPrice || product.salePrice;

              return (
                <Link
                  key={product.id}
                  href={`/store/${product.id}`}
                  className="group bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 relative"
                >
                  <div className="space-y-4">
                    {/* Embedded Visual Window Asset Container */}
                    <div className="bg-white rounded-xl aspect-square w-full p-6 flex items-center justify-center relative overflow-hidden border border-zinc-900/10">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const sibling = target.nextElementSibling as HTMLElement;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-zinc-950/5 text-zinc-400 font-bold tracking-wider text-[10px] uppercase"
                        style={{ display: displayImage ? 'none' : 'flex' }}
                      >
                        No Visual Asset
                      </div>
                      
                      {marketPrice && elitePrice && (
                        <span className="absolute top-3 right-3 bg-emerald-500 text-black text-[9px] font-black tracking-widest px-2 py-1 rounded">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Metadata Header Block */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block">
                        {product.category || "PRO GEAR"} {product.subcategory ? `/ ${product.subcategory}` : ''}
                      </span>
                      <h3 className="text-sm font-black tracking-tight text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Dual-Pricing Structural Box */}
                  <div id="trending-rep" className="mt-4 pt-4 border-t border-zinc-900 flex items-end justify-between">
                    <div>
                      {marketPrice && (
                        <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest line-through mb-0.5">
                          Rs {formatPrice(marketPrice)}
                        </span>
                      )}
                      <span className="text-base font-black text-emerald-400 font-mono block leading-none">
                        Rs {formatPrice(elitePrice)}
                      </span>
                    </div>
                    <span className="bg-zinc-900 group-hover:bg-emerald-500 border border-zinc-800 group-hover:border-emerald-400 text-zinc-400 group-hover:text-black font-black text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all duration-300">
                      View Asset
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
