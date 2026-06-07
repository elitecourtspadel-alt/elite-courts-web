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

const SPORTS = ["Padel", "Pickleball", "Table Tennis"];
const SUB_CATEGORIES: { [key: string]: string[] } = {
  "Padel": ["All Gear", "Rackets", "Balls", "Padel Grips", "Bags", "Accessories"],
  "Pickleball": ["All Gear", "Paddles", "Balls", "Grips", "Bags", "Accessories"],
  "Table Tennis": ["All Gear", "Bats", "Balls", "Rubbers", "Accessories"]
};

// ==========================================
// 1. SINGLE PRODUCT DETAIL VIEW COMPONENT
// ==========================================
function ProductDetailView({ product, onBack }: { product: any; onBack: () => void }) {
  const imageList = Array.isArray(product.images) 
    ? product.images.map((url: string) => url.trim()).filter((url: string) => url !== "")
    : (product.image ? [product.image.trim()] : ['/placeholder.jpg']);
    
  const [activeImg, setActiveImg] = useState(imageList[0] || '/placeholder.jpg');

  useEffect(() => {
    if (imageList.length > 0) setActiveImg(imageList[0]);
  }, [product.images, product.image]);

  const defaultSpecs = product.specs || {
    "Category": product.category || "General",
    "Type": product.subcategory || "Equipment",
    "Status": "Official Premium Stock",
    "Delivery": "Available Nationwide"
  };

  return (
    <div className="animate-fadeIn">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium transition-colors text-sm"
      >
        ❮ Back to Shop Explorer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Window */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full h-[380px] md:h-[460px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-2xl relative">
            <img src={activeImg} className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105" alt="" />
            <span className="absolute top-4 right-4 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">Sale</span>
          </div>

          {imageList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {imageList.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 flex-shrink-0 p-1 transition-all ${
                    activeImg === url ? 'border-emerald-500 scale-95' : 'border-zinc-800 opacity-60'
                  }`}
                >
                  <img src={url} className="w-full h-full object-contain" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Mechanics Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">{product.category} Portfolio</span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-100 tracking-tight mt-1 mb-3">{product.name}</h1>
            <div className="flex items-center gap-1 text-amber-400 text-sm">★★★★★ <span className="text-zinc-500 text-xs ml-2">(Verified Quality Asset)</span></div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-6 shadow-inner">
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-1">Market Standard</p>
              <span className="text-zinc-500 line-through text-lg font-semibold">{product.marketPrice}</span>
            </div>
            <div className="border-l border-zinc-800 h-10" />
            <div>
              <p className="text-xs text-emerald-400/80 font-medium mb-1">Elite Deal Rate</p>
              <span className="text-emerald-400 font-black text-3xl md:text-4xl tracking-tight">{product.elitePrice}</span>
            </div>
          </div>

          <div className="space-y-2 text-zinc-400 text-sm md:text-base leading-relaxed">
            <h3 className="font-bold text-zinc-200 text-base">Product Overview</h3>
            <p>High-end technical configuration optimized for tournament fields. This design minimizes standard structural drag ratios while expanding sweet-spot clean hit mapping matrices cleanly.</p>
          </div>

          <button 
            onClick={() => window.open(`https://wa.me/923084708858?text=Salam!%20I%20want%20to%20order%20the%20${encodeURIComponent(product.name)}.%20Please%20confirm%20booking.`, '_blank')} 
            className="w-full md:w-auto md:px-12 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 block text-center text-sm uppercase tracking-wider"
          >
            Order via WhatsApp
          </button>

          <div className="border-t border-zinc-900 pt-6 mt-8">
            <h3 className="font-bold text-zinc-200 text-base mb-4">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(defaultSpecs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center bg-zinc-900/30 border border-zinc-900 p-3 rounded-xl text-sm">
                  <span className="text-zinc-500 font-medium">{key}</span>
                  <span className="text-zinc-200 font-semibold">{val as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN HUB PORTAL COMPONENT
// ==========================================
export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Layout View States: "Home" or specific sport string
  const [viewState, setViewState] = useState("Home");
  const [activeSub, setActiveSub] = useState("All Gear");

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

  const routeToSport = (sportName: string) => {
    setViewState(sportName);
    setActiveSub("All Gear");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Master Filter Filtering Engine Context
  const filteredProducts = products.filter(p => {
    if (viewState === "Home") return true;
    const matchesSport = p.category === viewState;
    const matchesSub = activeSub === "All Gear" || p.subcategory === activeSub;
    return matchesSport && matchesSub;
  });

  if (selectedProduct) {
    return (
      <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-white">
        <div className="max-w-6xl mx-auto">
          <ProductDetailView product={selectedProduct} onBack={() => setSelectedProduct(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      
      {/* GLOBAL BANNER NAVIGATION STRIP */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-40 shadow-md backdrop-blur-md bg-zinc-900/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="cursor-pointer" onClick={() => setViewState("Home")}>
            <span className="text-xl font-black tracking-tighter text-zinc-100 uppercase">Elite<span className="text-emerald-400">Store</span></span>
          </div>
          <nav className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setViewState("Home")} 
              className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${viewState === "Home" ? 'text-emerald-400 bg-zinc-950' : 'text-zinc-400 hover:text-white'}`}
            >
              Shop Home
            </button>
            {SPORTS.map(sport => (
              <button 
                key={sport} 
                onClick={() => routeToSport(sport)} 
                className={`px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${viewState === sport ? 'text-emerald-400 bg-zinc-950' : 'text-zinc-400 hover:text-white'}`}
              >
                {sport}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* VIEW LAYER 1: E-COMMERCE HUB PORTAL (HOME) */}
      {viewState === "Home" && (
        <div className="animate-fadeIn">
          {/* HIGH-END E-COMMERCE HERO HERO */}
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-zinc-900 py-16 md:py-24 px-6 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="max-w-3xl mx-auto relative z-10 space-y-4">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Pro Equipment Hub</span>
              <h1 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tight leading-none uppercase">Premium Court Gear</h1>
              <p className="text-zinc-400 text-sm md:text-lg max-w-xl mx-auto font-medium">Elevate your performance parameters. Source authentic rackets, high-density field balls, and engineered grip configurations.</p>
            </div>
          </div>

          {/* SHOP BY SPORT SECTION DISPLAY MATRIX */}
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-200 mb-6">Browse Pro Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SPORTS.map((sport) => {
                // Inline local counts for clean catalog indicators
                const totalCount = products.filter(p => p.category === sport).length;
                return (
                  <div 
                    key={sport}
                    onClick={() => routeToSport(sport)}
                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between h-44 cursor-pointer hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -bottom-6 text-zinc-800/20 font-black text-8xl tracking-tighter uppercase select-none group-hover:scale-110 transition-transform group-hover:text-emerald-500/5">
                      {sport[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-zinc-100 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{sport}</h3>
                      <p className="text-zinc-500 text-xs mt-1">Official High-Spec Assets</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1">
                      Explore Catalog ({totalCount} items) ➔
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEATURED GENERAL ARRIVALS MATRIX LAYOUT */}
          <div className="max-w-6xl mx-auto px-6 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-200">Trending Hardware</h2>
              <span className="w-12 h-0.5 bg-zinc-800 flex-grow mx-4 hidden sm:block" />
            </div>

            {loading ? (
              <p className="text-zinc-500 animate-pulse font-mono text-xs">Syncing ledger records...</p>
            ) : products.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">New inventory allocations pending.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 8).map((p, i) => {
                  const imageList = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : ['/placeholder.jpg']);
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedProduct(p)}
                      className="bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden flex flex-col shadow-lg hover:border-zinc-700 transition-all cursor-pointer group"
                    >
                      <div className="w-full h-44 bg-zinc-950 flex items-center justify-center p-4 border-b border-zinc-800/60 overflow-hidden">
                        <img src={imageList[0]} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" alt="" />
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 max-w-max block">
                            {p.category}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-200 mt-1.5 line-clamp-1 group-hover:text-emerald-400 transition-colors tracking-tight">{p.name}</h4>
                        </div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-zinc-500 line-through text-[11px] font-medium">{p.marketPrice}</span>
                          <span className="text-emerald-400 font-extrabold text-sm">{p.elitePrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW LAYER 2: DEDICATED SPORT DEPARTMENT CATALOGS */}
      {viewState !== "Home" && (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-fadeIn">
          
          {/* DEPT HEADER CONTROLS */}
          <div className="mb-8 border-b border-zinc-900 pb-6">
            <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2">
              <span className="cursor-pointer hover:text-white" onClick={() => setViewState("Home")}>Store Home</span> ➔ <span className="text-zinc-300">{viewState} Department</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-emerald-400 uppercase tracking-tight">{viewState} Center</h1>
          </div>

          {/* DYNAMIC SUBCATEGORY SECONDARY SUB-NAVIGATION ROW */}
          {SUB_CATEGORIES[viewState] && (
            <div className="flex flex-wrap gap-1.5 mb-8 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-900 max-w-max">
              {SUB_CATEGORIES[viewState].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSub(sub)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeSub === sub
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* CATALOG DISPLAY ELEMENT LAYER */}
          {filteredProducts.length === 0 ? (
            <div className="text-center p-12 bg-zinc-900/30 rounded-2xl border border-zinc-900">
              <p className="text-zinc-500 italic">No allocation matched the tag sequence "{activeSub}" yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredProducts.map((p, i) => {
                const imageList = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : ['/placeholder.jpg']);
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedProduct(p)}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-xl hover:border-zinc-700 transition-all cursor-pointer group"
                  >
                    <div className="w-full h-56 bg-zinc-950 overflow-hidden relative border-b border-zinc-800 flex items-center justify-center p-4">
                      <img src={imageList[0]} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" alt="" />
                    </div>
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 max-w-max block mb-2">
                          {p.subcategory || "Equipment"}
                        </span>
                        <h3 className="text-base font-bold text-zinc-100 mb-2 line-clamp-2 tracking-tight group-hover:text-emerald-400 transition-colors">{p.name}</h3>
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-zinc-500 line-through text-xs font-medium">{p.marketPrice}</span>
                          <span className="text-emerald-400 font-extrabold text-lg">{p.elitePrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
