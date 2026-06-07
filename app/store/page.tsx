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

interface Product {
  name: string;
  category: string;
  subcategory: string;
  marketPrice: string;
  elitePrice: string;
  images?: string[];
  image?: string;
  description?: string;
  specs?: Record<string, string>;
}

const SPORTS: string[] = ["Padel", "Pickleball", "Table Tennis", "Cricket", "Badminton"];
const SUB_CATEGORIES: Record<string, string[]> = {
  "Padel": ["All Gear", "Rackets", "Balls", "Padel Grips", "Bags", "Accessories"],
  "Pickleball": ["All Gear", "Paddles", "Balls", "Grips", "Bags", "Accessories"],
  "Table Tennis": ["All Gear", "Bats", "Balls", "Rubbers", "Accessories"],
  "Cricket": ["All Gear", "Bats", "Balls", "Protective Gear", "Bags", "Accessories"],
  "Badminton": ["All Gear", "Rackets", "Shuttlecocks", "Grips", "Bags", "Accessories"]
};

// ==========================================
// PRODUCT DETAIL VIEW WITH MATRIX SPECIFICATIONS
// ==========================================
function ProductDetailView({ product, onBack }: { product: Product; onBack: () => void }) {
  const imageList: string[] = Array.isArray(product.images) 
    ? product.images.map((url: string) => url.trim()).filter((url: string) => url !== "")
    : (product.image ? [product.image.trim()] : ['/placeholder.jpg']);
    
  const [activeImg, setActiveImg] = useState<string>(imageList[0] || '/placeholder.jpg');

  useEffect(() => {
    if (imageList.length > 0) setActiveImg(imageList[0]);
  }, [product.images, product.image]);

  const specs = product.specs || {};

  return (
    <div className="animate-fadeIn">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium transition-colors text-sm"
      >
        ❮ Back to Shop Explorer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        {/* Gallery Window */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full h-[380px] md:h-[460px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-2xl relative">
            <img 
              src={activeImg} 
              className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105" 
              alt={product.name}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/18181b/ffffff?text=Image+Preview'; }}
            />
            <span className="absolute top-4 right-4 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">Sale</span>
          </div>

          {imageList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {imageList.map((url: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 flex-shrink-0 p-1 transition-all ${
                    activeImg === url ? 'border-emerald-500 scale-95' : 'border-zinc-800 opacity-60'
                  }`}
                >
                  <img 
                    src={url} 
                    className="w-full h-full object-contain" 
                    alt="" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/150'; }}
                  />
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
            <p>{product.description || "High-end technical configuration optimized for competitive tournament play."}</p>
          </div>

          <button 
            onClick={() => window.open(`https://wa.me/923084708858?text=Salam!%20I%20want%20to%20order%20the%20${encodeURIComponent(product.name)}.%20Please%20confirm%20booking.`, '_blank')} 
            className="w-full md:w-auto md:px-12 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 block text-center text-sm uppercase tracking-wider"
          >
            Order via WhatsApp
          </button>
        </div>
      </div>

      {/* HIGH-FIDELITY SPECIFICATIONS MATRIX SECTION */}
      <div className="border-t border-zinc-900 pt-10 mt-12 max-w-4xl">
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight mb-2">Technical Specifications Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="py-3 w-1/3">Attribute</th>
                  <th className="py-3 w-2/3">Specification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                <tr>
                  <td className="py-3.5 font-bold text-zinc-200">Product Model</td>
                  <td className="py-3.5">{product.name}</td>
                </tr>
                {specs["Shape / Configuration"] && (
                  <tr>
                    <td className="py-3.5 font-bold text-zinc-200">Equipment Shape / Profile</td>
                    <td className="py-3.5">{specs["Shape / Configuration"]}</td>
                  </tr>
                )}
                {specs["Face / Surface Material"] && (
                  <tr>
                    <td className="py-3.5 font-bold text-zinc-200">Face / Blade Material</td>
                    <td className="py-3.5">{specs["Face / Surface Material"]}</td>
                  </tr>
                )}
                {specs["Frame Composition"] && (
                  <tr>
                    <td className="py-3.5 font-bold text-zinc-200">Frame Composition</td>
                    <td className="py-3.5">{specs["Frame Composition"]}</td>
                  </tr>
                )}
                {specs["Core Core / Density"] && (
                  <tr>
                    <td className="py-3.5 font-bold text-zinc-200">Core Engine / Rubber Density</td>
                    <td className="py-3.5">{specs["Core Core / Density"]}</td>
                  </tr>
                )}
                {specs["Weight Parameters"] && (
                  <tr>
                    <td className="py-3.5 font-bold text-zinc-200">Weight Parameters</td>
                    <td className="py-3.5">{specs["Weight Parameters"]}</td>
                  </tr>
                )}
                {specs["Balance Profile"] && (
                  <tr>
                    <td className="py-3.5 font-bold text-zinc-200">Balance Profile</td>
                    <td className="py-3.5">{specs["Balance Profile"]}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* IDEAL PLAYER PROFILE MATRIX BLOCK */}
        {((specs["Player Bracket"] || specs["Control Rating"] || specs["Power Rating"])) && (
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight mb-4">Ideal Player Profile</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {specs["Player Bracket"] && (
                    <tr>
                      <td className="py-3.5 font-bold text-zinc-200 w-1/3">Player Bracket</td>
                      <td className="py-3.5 w-2/3">{specs["Player Bracket"]}</td>
                    </tr>
                  )}
                  {specs["Control Rating"] && (
                    <tr>
                      <td className="py-3.5 font-bold text-zinc-200">Control Rating</td>
                      <td className="py-3.5 text-emerald-400 font-semibold">{specs["Control Rating"]}</td>
                    </tr>
                  )}
                  {specs["Power Rating"] && (
                    <tr>
                      <td className="py-3.5 font-bold text-zinc-200">Power Rating</td>
                      <td className="py-3.5 text-emerald-400 font-semibold">{specs["Power Rating"]}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN HUB HUB ROUTER
// ==========================================
export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewState, setViewState] = useState<string>("Home");
  const [activeSub, setActiveSub] = useState<string>("All Gear");

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

  const filteredProducts = products.filter((p: Product) => {
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
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-40 backdrop-blur-md bg-zinc-900/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="cursor-pointer" onClick={() => setViewState("Home")}>
            <span className="text-xl font-black tracking-tighter text-zinc-100 uppercase">Elite<span className="text-emerald-400">Store</span></span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
            <button onClick={() => setViewState("Home")} className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold uppercase tracking-wider rounded-lg ${viewState === "Home" ? 'text-emerald-400 bg-zinc-950' : 'text-zinc-400'}`}>Home</button>
            {SPORTS.map((sport: string) => (
              <button key={sport} onClick={() => routeToSport(sport)} className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold uppercase tracking-wider rounded-lg ${viewState === sport ? 'text-emerald-400 bg-zinc-950' : 'text-zinc-400'}`}>{sport}</button>
            ))}
          </nav>
        </div>
      </div>

      {viewState === "Home" && (
        <div className="animate-fadeIn">
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 py-16 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <span className="text-xs uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Pro Equipment Hub</span>
              <h1 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tight uppercase">Premium Sports Gear</h1>
              <p className="text-zinc-400 text-sm md:text-base">Elevate your game assets. Source authentic rackets, bats, match grade ball packs, and accessories.</p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-200 mb-6">Browse Pro Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {SPORTS.map((sport: string) => (
                <div key={sport} onClick={() => routeToSport(sport)} className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 h-36 flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 transition-all">
                  <h3 className="text-lg font-extrabold text-zinc-100 group-hover:text-emerald-400 transition-colors uppercase">{sport}</h3>
                  <span className="text-xs font-mono text-zinc-400">Explore Catalog ➔</span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-20">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-200 mb-6">Trending Hardware</h2>
            {loading ? (
              <p className="text-zinc-500 animate-pulse text-xs font-mono">Syncing database assets...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 8).map((p: Product, i: number) => {
                  const imageList = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : ['/placeholder.jpg']);
                  return (
                    <div key={i} onClick={() => setSelectedProduct(p)} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col cursor-pointer group hover:border-zinc-700 transition-all">
                      <div className="w-full h-44 bg-zinc-950 flex items-center justify-center p-4 border-b border-zinc-800/60">
                        <img 
                          src={imageList[0]} 
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                          alt="" 
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/18181b/ffffff?text=No+Image'; }}
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <h4 className="text-sm font-bold text-zinc-200 line-clamp-1 group-hover:text-emerald-400">{p.name}</h4>
                        <div className="flex items-baseline gap-2 pt-2">
                          <span className="text-zinc-500 line-through text-[11px]">{p.marketPrice}</span>
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

      {viewState !== "Home" && (
        <div className="max-w-6xl mx-auto px-6 py-10 animate-fadeIn">
          <div className="mb-8 border-b border-zinc-900 pb-6">
            <h1 className="text-3xl font-black text-emerald-400 uppercase">{viewState} Department</h1>
          </div>

          {SUB_CATEGORIES[viewState] && (
            <div className="flex flex-wrap gap-2 mb-8 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-900 max-w-max">
              {SUB_CATEGORIES[viewState].map((sub: string) => (
                <button key={sub} onClick={() => setActiveSub(sub)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${activeSub === sub ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}>{sub}</button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((p: Product, i: number) => {
              const imageList = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : ['/placeholder.jpg']);
              return (
                <div key={i} onClick={() => setSelectedProduct(p)} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col cursor-pointer group hover:border-zinc-700 transition-all">
                  <div className="w-full h-52 bg-zinc-950 flex items-center justify-center p-4">
                    <img 
                      src={imageList[0]} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/18181b/ffffff?text=No+Image'; }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <h3 className="text-sm font-bold text-zinc-100 line-clamp-2 group-hover:text-emerald-400">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-zinc-500 line-through text-xs">{p.marketPrice}</span>
                      <span className="text-emerald-400 font-extrabold text-base">{p.elitePrice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
