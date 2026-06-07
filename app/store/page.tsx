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

// Sub-Component for Interactive Product Cards
function ProductCard({ p, onZoom }: { p: any; onZoom: (url: string) => void }) {
  // Safe extraction fallbacks to seamlessly process both old and new data entries
  const imageList = Array.isArray(p.images) 
    ? p.images.map((url: string) => url.trim()).filter((url: string) => url !== "")
    : (p.image ? [p.image.trim()] : ['/placeholder.jpg']);
    
  const [activeImage, setActiveImage] = useState(imageList[0] || '/placeholder.jpg');

  useEffect(() => {
    if (imageList.length > 0) {
      setActiveImage(imageList[0]);
    }
  }, [p.images, p.image]);

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-xl hover:border-zinc-700 transition-all duration-300">
      
      {/* Clickable Large Image Window (Triggers Zoom) */}
      <div 
        onClick={() => onZoom(activeImage)}
        className="w-full h-64 bg-zinc-950 overflow-hidden relative border-b border-zinc-800 flex items-center justify-center p-4 cursor-zoom-in group"
      >
        <img 
          src={activeImage} 
          className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300" 
          alt={p.name} 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Click to Zoom 🔍
          </span>
        </div>
        <span className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Offer
        </span>
      </div>

      {/* Thumbnails Gallery Strip */}
      {imageList.length > 1 && (
        <div className="flex gap-2 px-5 pt-4 overflow-x-auto scrollbar-none">
          {imageList.map((imgUrl: string, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(imgUrl)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 bg-zinc-950 flex-shrink-0 p-0.5 transition-all ${
                activeImage === imgUrl ? 'border-emerald-500 scale-95' : 'border-zinc-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={imgUrl} 
                className="w-full h-full object-contain" 
                alt="" 
                onError={(e) => {
                  // Fallback for broken images to avoid displaying broken frames
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Details Box Layout */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-zinc-100 mb-2 tracking-tight line-clamp-2">{p.name}</h3>
          
          <div className="flex items-baseline gap-2.5">
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
          className="w-full bg-emerald-500 py-3 rounded-xl font-bold text-black hover:bg-emerald-400 active:scale-[0.98] transition-all"
        >
          Order on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomImg, setZoomImg] = useState<string | null>(null);

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
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-white relative">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2 tracking-tight">Elite Store</h1>
          <p className="text-zinc-400 text-sm">Premium racket sports gear delivered straight to your court.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-zinc-500 animate-pulse font-medium">Loading premium gear...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/50 rounded-2xl border border-zinc-900">
            <p className="text-zinc-500 italic">New premium stock arriving soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <ProductCard key={i} p={p} onZoom={(url) => setZoomImg(url)} />
            ))}
          </div>
        )}
      </div>

      {/* FULL-SCREEN ZOOM MODAL OVERLAY */}
      {zoomImg && (
        <div 
          onClick={() => setZoomImg(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 cursor-zoom-out animate-fadeIn"
        >
          <button 
            onClick={() => setZoomImg(null)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white text-2xl font-bold p-2 focus:outline-none"
          >
            ✕
          </button>
          <div className="max-w-4xl max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={zoomImg} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none" 
              alt="Zoomed product view" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
