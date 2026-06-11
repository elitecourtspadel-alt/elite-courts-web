'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

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
  description?: string;
}

export default function ProductPage() {
  const router = useRouter();
  // We use the hook here instead of passing params through the function arguments
  const params = useParams(); 
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Next.js hasn't loaded the ID from the URL yet, wait for it
    if (!productId) return;

    const db = getDatabase(app);
    const productRef = ref(db, `store/products/${productId}`);

    const unsubscribe = onValue(productRef, (snapshot) => {
      if (snapshot.exists()) {
        setProduct({ id: productId, ...snapshot.val() });
      } else {
        setProduct(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const existingCart = localStorage.getItem('elite_store_active_cart');
    let cart = existingCart ? JSON.parse(existingCart) : [];
    
    const existingItemIndex = cart.findIndex((item: any) => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }
    
    localStorage.setItem('elite_store_active_cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-500 font-black tracking-widest uppercase text-xs">Accessing Data Stream...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-black uppercase text-zinc-500">Asset Not Found</h1>
        <Link href="/store" className="bg-emerald-500 hover:bg-emerald-400 transition-colors text-black px-6 py-2 rounded-lg font-bold uppercase text-xs tracking-wider">Return to Store</Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black pt-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Link href="/store" className="text-zinc-500 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase flex items-center gap-2">
          ← Back to Shop Explorer
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          <div className="bg-white rounded-3xl p-12 relative flex items-center justify-center aspect-square border-4 border-zinc-900">
            <span className="absolute top-6 right-6 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md">
              SALE
            </span>
            {product.mediaUrl ? (
              <img src={product.mediaUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-xs">No Visual Asset</span>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-2">
                {product.category} {product.subcategory ? `/ ${product.subcategory}` : 'PORTFOLIO'}
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 leading-none">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                ★★★★★ <span className="text-zinc-500 font-medium tracking-wider ml-2">(Verified Quality Asset)</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center gap-12">
              <div>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Market Standard</span>
                <span className="text-lg text-zinc-400 line-through font-mono">
                  Rs {parseInt(product.marketPrice).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Elite Deal Rate</span>
                <span className="text-4xl font-black text-emerald-400 font-mono">
                  Rs {parseInt(product.elitePrice).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Product Overview</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {product.description || "Take your game to the next level with this premium asset, engineered specifically for players who demand explosive speed, sharp responsiveness, and unyielding consistency."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-850">
              <button onClick={handleAddToCart} className="py-4 border-2 border-zinc-800 hover:border-emerald-500 text-zinc-300 hover:text-emerald-400 font-black uppercase tracking-widest text-xs rounded-xl transition-all">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Buy It Now
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
