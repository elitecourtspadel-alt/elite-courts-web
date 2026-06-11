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

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  marketPrice: string;
  elitePrice: string;
  mediaUrl: string;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');

    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.entries(data).map(([id, item]: [string, any]) => ({
          id,
          ...item
        }));
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category.toUpperCase() === activeCategory.toUpperCase());

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. ELITE STORE MINI NAV */}
      <div className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-black tracking-widest text-white uppercase">
              ELITE<span className="text-emerald-400">STORE</span>
            </h1>
            <nav className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {['ALL', 'PADEL', 'PICKLEBALL', 'TABLE TENNIS', 'CRICKET', 'BADMINTON'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`hover:text-white transition-colors ${activeCategory === cat ? 'text-emerald-400 font-black' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
          <Link href="/store/cart" className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2 hover:border-zinc-700 transition-all text-xs font-bold uppercase tracking-wider">
            Cart <span className="bg-emerald-400 text-black px-1.5 py-0.5 rounded-md font-black text-[10px]">0</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        
        {/* 2. REINSTATED HERO BANNER SECTION */}
        <div className="relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-850 shadow-2xl min-h-[340px] flex items-center">
          {/* Dark Background Overlay Imagery/Accents */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-950/90 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200')` }} 
          />
          
          <div className="relative z-20 max-w-2xl p-8 sm:p-12 space-y-4">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full inline-block">
              Premium Equipment Repertoire
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none text-white">
              ENGINEERED FOR <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">MAXIMUM PERFORMANCE</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium tracking-wide leading-relaxed max-w-md">
              Equip your game with premium selected rackets, carbon composite bats, pro-grade balls, and performance court accessories.
            </p>
            <div className="pt-2">
              <button onClick={() => setActiveCategory('ALL')} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[11px] tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                Explore All Gear
              </button>
            </div>
          </div>
        </div>

        {/* 3. SPORT CATEGORIES QUICK SHORTCUTS GRID */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Browse by Domain</h3>
            <div className="h-px bg-zinc-900 mt-2 w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Padel Card Grid Block */}
            <div onClick={() => setActiveCategory('PADEL')} className="md:col-span-7 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 rounded-2xl p-6 relative min-h-[180px] overflow-hidden flex flex-col justify-end cursor-pointer group transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600')` }} />
              <div className="relative z-20">
                <h4 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">Padel Gear</h4>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Premium 3K/24K Carbon Rackets & Pro Balls</p>
              </div>
            </div>

            {/* Pickleball Grid Block */}
            <div onClick={() => setActiveCategory('PICKLEBALL')} className="md:col-span-5 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 rounded-2xl p-6 relative min-h-[180px] overflow-hidden flex flex-col justify-end cursor-pointer group transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              <div className="relative z-20">
                <h4 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">Pickleball</h4>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Honeycomb Core Paddles & Air Flow Balls</p>
              </div>
            </div>

            {/* Cricket Grid Block */}
            <div onClick={() => setActiveCategory('CRICKET')} className="md:col-span-4 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 rounded-2xl p-6 relative min-h-[160px] overflow-hidden flex flex-col justify-end cursor-pointer group transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              <div className="relative z-20">
                <h4 className="text-base font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">Cricket</h4>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Premium Grade Willow & Protections</p>
              </div>
            </div>

            {/* Badminton Grid Block */}
            <div onClick={() => setActiveCategory('BADMINTON')} className="md:col-span-4 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 rounded-2xl p-6 relative min-h-[160px] overflow-hidden flex flex-col justify-end cursor-pointer group transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              <div className="relative z-20">
                <h4 className="text-base font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">Badminton</h4>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">High-Modulus Graphite Rackets & Shuttles</p>
              </div>
            </div>

            {/* Table Tennis Grid Block */}
            <div onClick={() => setActiveCategory('TABLE TENNIS')} className="md:col-span-4 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 rounded-2xl p-6 relative min-h-[160px] overflow-hidden flex flex-col justify-end cursor-pointer group transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
              <div className="relative z-20">
                <h4 className="text-base font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">Table Tennis</h4>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Professional Blades & ITTF Rubber Paddles</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DYNAMIC PRODUCTION EQUIPMENT INVENTORY REGISTRY */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Trending Repertoire</h3>
              <p className="text-zinc-400 text-lg font-black uppercase mt-1">
                {activeCategory === 'ALL' ? 'All Active Gear' : `${activeCategory} Collection`}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-md text-zinc-400">
              {filteredProducts.length} Items Listed
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-zinc-900 border border-zinc-850 h-72 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-zinc-900/40 border border-dashed border-zinc-850 rounded-2xl p-12 text-center text-zinc-500 text-xs font-medium uppercase tracking-wider">
              No equipment variants published in this tier node.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Link 
                  href={`/store/${product.id}`} 
                  key={product.id}
                  className="group bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                >
                  {/* Media Frame wrapper */}
                  <div className="aspect-square w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center p-6 border-b border-zinc-900">
                    {product.mediaUrl ? (
                      <img 
                        src={product.mediaUrl} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No Image Asset</span>
                    )}
                    <span className="absolute top-3 left-3 bg-zinc-900 text-zinc-400 border border-zinc-850 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>

                  {/* Pricing Matrix Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200 line-clamp-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                        {product.name}
                      </h4>
                      {product.subcategory && (
                        <span className="text-[9px] text-zinc-500 block uppercase font-medium mt-0.5">{product.subcategory}</span>
                      )}
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-900 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="block text-[8px] text-zinc-500 font-bold uppercase tracking-wider line-through">
                          Rs {parseInt(product.marketPrice).toLocaleString()}
                        </span>
                        <span className="block text-xs font-black text-emerald-400 font-mono">
                          Rs {parseInt(product.elitePrice).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-1 rounded-md uppercase tracking-wide">
                        Deal
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
