'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";

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

interface CartItem {
  product: Product;
  quantity: number;
}

const SPORT_COLLECTIONS = [
  { name: "Padel", img: "/images/sports/elite_courts_padel_card.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
  { name: "Pickleball", img: "/images/sports/elite_courts_pickleball_card.jpg", fallback: "https://images.unsplash.com/photo-1613564834644-a170d10b2720?w=600" },
  { name: "Table Tennis", img: "/images/sports/elite_courts_table_tennis.jpg", fallback: "https://images.unsplash.com/photo-1609710223199-14b5d5b1f8f7?w=600" },
  { name: "Cricket", img: "/images/sports/elite_courts_cricket_.webp", fallback: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600" },
  { name: "Badminton", img: "/images/sports/elite_courts_badminton.jpg", fallback: "https://images.unsplash.com/photo-1617083277684-630247384661?w=600" }
];

const SPORTS: string[] = SPORT_COLLECTIONS.map(s => s.name);

const SUB_CATEGORIES: Record<string, string[]> = {
  "Padel": ["All Gear", "Rackets", "Balls", "Padel Grips", "Bags", "Accessories"],
  "Pickleball": ["All Gear", "Paddles", "Balls", "Grips", "Bags", "Accessories"],
  "Table Tennis": ["All Gear", "Bats", "Balls", "Rubbers", "Accessories"],
  "Cricket": ["All Gear", "Bats", "Balls", "Protective Gear", "Bags", "Accessories"],
  "Badminton": ["All Gear", "Rackets", "Shuttlecocks", "Grips", "Bags", "Accessories"]
};

function ProductDetailView({ product, onBack, onAddToCart, onBuyNow }: { product: Product; onBack: () => void; onAddToCart: (p: Product) => void; onBuyNow: (p: Product) => void }) {
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
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium transition-colors text-sm">
        ❮ Back to Shop Explorer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full h-[380px] md:h-[460px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-2xl relative">
            <img src={activeImg} className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105" alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/18181b/ffffff?text=Image+Preview'; }} />
            <span className="absolute top-4 right-4 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">Sale</span>
          </div>

          {imageList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {imageList.map((url: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImg(url)} className={`w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 flex-shrink-0 p-1 transition-all ${activeImg === url ? 'border-emerald-500 scale-95' : 'border-zinc-800 opacity-60'}`}>
                  <img src={url} className="w-full h-full object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/150'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

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

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => onAddToCart(product)}
              className="flex-1 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold uppercase tracking-wider rounded-xl transition-all text-sm"
            >
              Add To Cart
            </button>
            <button 
              onClick={() => onBuyNow(product)}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/10"
            >
              Buy It Now
            </button>
          </div>
        </div>
      </div>

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
                {Object.entries(specs).map(([key, val]) => {
                  if (["Player Bracket", "Control Rating", "Power Rating", "Feature Note", "Durability", "Adhesion Level"].includes(key)) return null;
                  return (
                    <tr key={key}>
                      <td className="py-3.5 font-bold text-zinc-200">{key}</td>
                      <td className="py-3.5">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewState, setViewState] = useState<string>("Home");
  const [activeSub, setActiveSub] = useState<string>("All Gear");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [lastOrderId, setLastOrderId] = useState<string>('');

  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'FULL_PAYMENT'
  });

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

  const handleAddToCart = (product: Product, openPanel = true) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(item => item.product.name === product.name);
      if (existingIdx > -1) {
        const newCart = [...prevCart];
        newCart[existingIdx].quantity += 1;
        return newCart;
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    if (openPanel) setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    const existing = cart.find(item => item.product.name === product.name);
    if (!existing) {
      handleAddToCart(product, false);
    }
    setIsCheckoutOpen(true);
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[idx].quantity += delta;
      if (newCart[idx].quantity <= 0) {
        newCart.splice(idx, 1);
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum = parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0;
      return total + (priceNum * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const db = getDatabase(app);
    const ordersRef = ref(db, 'store/orders');

    const orderPayload = {
      customer: {
        name: shippingDetails.fullName,
        phone: shippingDetails.phone,
        address: shippingDetails.paymentMethod === 'COURT_PICKUP' ? 'Self-Pickup at Court Venue' : shippingDetails.address,
        city: shippingDetails.paymentMethod === 'COURT_PICKUP' ? 'Lahore Court' : shippingDetails.city
      },
      items: cart.map(item => ({
        name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unitPrice: item.product.elitePrice,
        totalItemCost: (parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0) * item.quantity
      })),
      financials: {
        orderTotal: `${getCartTotal().toLocaleString()} PKR`,
        paymentMethod: shippingDetails.paymentMethod,
      },
      orderStatus: "PENDING_VERIFICATION",
      timestamp: Math.floor(Date.now() / 1000)
    };

    try {
      const newOrderRef = await push(ordersRef, orderPayload);
      if (newOrderRef.key) {
        setLastOrderId(newOrderRef.key);
        setCheckoutStep('SUCCESS');
        setCart([]);
      }
    } catch (err) {
      console.error("Order processing failure:", err);
    }
  };

  const routeToSport = (sportName: string) => {
    setViewState(sportName);
    setActiveSub("All Gear");
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = products.filter((p: Product) => {
    if (viewState === "Home") return true;
    const matchesSport = p.category === viewState;
    const matchesSub = activeSub === "All Gear" || p.subcategory === activeSub;
    return matchesSport && matchesSub;
  });

  const padelCategory = SPORT_COLLECTIONS.find(s => s.name === "Padel")!;
  const rightGridCategories = SPORT_COLLECTIONS.filter(s => s.name !== "Padel");

  return (
    <div className="bg-zinc-950 min-h-screen text-white relative overflow-x-hidden">
      
      {/* HEADER BAR AND NAVIGATION */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-40 backdrop-blur-md bg-zinc-900/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="cursor-pointer" onClick={() => { setViewState("Home"); setSelectedProduct(null); }}>
              <span className="text-xl font-black tracking-tighter text-zinc-100 uppercase">Elite<span className="text-emerald-400">Store</span></span>
            </div>
            <button onClick={() => setIsCartOpen(true)} className="sm:hidden text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs flex items-center gap-1.5">
              🛒 <span className="bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black">{cart.reduce((a,c) => a+c.quantity, 0)}</span>
            </button>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
            <button onClick={() => { setViewState("Home"); setSelectedProduct(null); }} className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold uppercase tracking-wider rounded-lg ${viewState === "Home" && !selectedProduct ? 'text-emerald-400 bg-zinc-950' : 'text-zinc-400'}`}>Home</button>
            {SPORTS.map((sport: string) => (
              <button key={sport} onClick={() => routeToSport(sport)} className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold uppercase tracking-wider rounded-lg ${viewState === sport && !selectedProduct ? 'text-emerald-400 bg-zinc-950' : 'text-zinc-400'}`}>{sport}</button>
            ))}
            
            <button onClick={() => setIsCartOpen(true)} className="hidden sm:flex items-center gap-2 ml-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold transition-all">
              <span>Cart</span>
              <span className="bg-emerald-500 text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">{cart.reduce((a,c) => a+c.quantity, 0)}</span>
            </button>
          </nav>
        </div>
      </div>

      {selectedProduct ? (
        <div className="p-6 md:p-10 bg-zinc-950 min-h-[calc(screen-80px)] text-white">
          <div className="max-w-6xl mx-auto">
            <ProductDetailView 
              product={selectedProduct} 
              onBack={() => setSelectedProduct(null)} 
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>
      ) : viewState === "Home" ? (
        <div className="animate-fadeIn">
          
          {/* HERO LAYOUT */}
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden min-h-[440px] items-center">
              <div className="lg:col-span-5 p-8 md:p-12 space-y-4 z-10">
                <span className="text-xs uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 max-w-max block">Pro Equipment Hub</span>
                <h1 className="text-3xl md:text-5xl font-black text-zinc-100 tracking-tight uppercase leading-none">Premium<br/>Sports Gear</h1>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">Elevate your game assets. Source authentic performance rackets, paddles, match-grade ball packs, and technical accessories built for the courts.</p>
              </div>
              <div className="lg:col-span-7 h-full min-h-[300px] lg:min-h-full relative self-stretch">
                <img 
                  src="https://images.unsplash.com/photo-1613564834644-a170d10b2720?q=80&w=1400&auto=format&fit=crop" 
                  alt="Athletes playing intensive match play on a racquet court" 
                  className="w-full h-full object-cover absolute inset-0 filter brightness-90 contrast-105 object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/40 to-transparent hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent lg:hidden" />
              </div>
            </div>
          </div>

          {/* PREMIUM ASYMMETRICAL DASHBOARD GRID CONTROLLER */}
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h2 className="text-xl font-bold tracking-wider text-white uppercase mb-6">
              Browse Pro Collections
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              
              {/* 1. PADEL - LARGE FEATURE CARD (Takes up 7/12 width) */}
              <div 
                onClick={() => routeToSport(padelCategory.name)}
                className="lg:col-span-7 relative overflow-hidden rounded-2xl min-h-[380px] lg:min-h-[480px] flex flex-col justify-end p-8 group border border-zinc-800/30 cursor-pointer"
              >
                <img 
                  src={padelCategory.img} 
                  alt="Padel Collection"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = padelCategory.fallback; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                
                <div className="relative z-10">
                  <h3 className="text-4xl lg:text-5xl font-black tracking-tight text-white uppercase mb-1">
                    {padelCategory.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm font-medium tracking-wide flex items-center gap-1 group-hover:text-white transition-colors">
                      Explore Catalog <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full border border-zinc-700/80 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/></svg>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-zinc-700/80 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE GRID - 2x2 PANELS COMPOSITION (Takes up 5/12 width) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {rightGridCategories.map((sport) => (
                  <div 
                    key={sport.name}
                    onClick={() => routeToSport(sport.name)}
                    className="relative overflow-hidden rounded-2xl min-h-[180px] lg:min-h-[232px] flex flex-col justify-end p-5 group border border-zinc-800/30 cursor-pointer"
                  >
                    <img 
                      src={sport.img} 
                      alt={`${sport.name} Equipment`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { (e.target as HTMLImageElement).src = sport.fallback; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                    <div className="relative z-10">
                      <h3 className="text-lg lg:text-xl font-bold tracking-wide text-white uppercase mb-0.5">{sport.name}</h3>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-1 group-hover:text-white transition-colors">Explore Catalog →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* LOWER STRIP: TRENDING INVENTORY */}
          <div className="max-w-6xl mx-auto px-6 py-12 pb-20">
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
                        <img src={imageList[0]} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" alt="" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/18181b/ffffff?text=No+Image'; }} />
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
      ) : (
        /* TARGET INTERNAL DEPARTMENTS VIEW */
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
                    <img src={imageList[0]} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" alt="" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/18181b/ffffff?text=No+Image'; }} />
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

      {/* COMPONENT: SHOPPING CART SIDEBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 h-full border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">Your Equipment Bag</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white font-mono text-xl">✕</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-zinc-500 text-sm">Your bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-none">
                  {cart.map((item, idx) => {
                    const imgUrl = Array.isArray(item.product.images) ? item.product.images[0] : (item.product.image ? item.product.image : '/placeholder.jpg');
                    return (
                      <div key={idx} className="flex gap-4 p-3 bg-zinc-950 border border-zinc-800 rounded-xl items-center">
                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800/80 p-1 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img src={imgUrl} className="max-h-full max-w-full object-contain" alt="" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs font-bold text-zinc-100 truncate">{item.product.name}</h4>
                          <p className="text-xs text-emerald-400 font-extrabold mt-0.5">{item.product.elitePrice}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateCartQty(idx, -1)} className="w-5 h-5 bg-zinc-900 hover:bg-zinc-800 rounded text-xs font-mono">-</button>
                            <span className="text-xs font-bold px-2">{item.quantity}</span>
                            <button onClick={() => updateCartQty(idx, 1)} className="w-5 h-5 bg-zinc-900 hover:bg-zinc-800 rounded text-xs font-mono">+</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-zinc-800 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-zinc-400 font-semibold">Total Invoice Amount:</span>
                  <span className="text-xl font-black text-emerald-400">{getCartTotal().toLocaleString()} PKR</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); setCheckoutStep('FORM'); }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-center text-xs uppercase tracking-wider block transition-all"
                >
                  Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPONENT: SYSTEM CHECKOUT MODULE */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl relative">
            
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-mono text-lg">✕</button>

            {checkoutStep === 'FORM' ? (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">Elite System Checkout</h2>
                  <p className="text-zinc-500 text-xs mt-1">Provide routing instructions to generate your digital database invoice.</p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500">Order Summary</span>
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-zinc-300">
                      <span className="truncate max-w-[70%]">{item.product.name} <span className="text-zinc-500 font-mono">x{item.quantity}</span></span>
                      <span className="font-bold text-emerald-400">{item.product.elitePrice}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between text-sm font-bold">
                    <span className="text-white">Payable Balance:</span>
                    <span className="text-emerald-400 font-black">{getCartTotal().toLocaleString()} PKR</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">Full Name</label>
                    <input required type="text" value={shippingDetails.fullName} onChange={e => setShippingDetails({...shippingDetails, fullName: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" placeholder="e.g. Shahrukh Khan" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">Active Contact Number</label>
                    <input required type="tel" value={shippingDetails.phone} onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" placeholder="e.g. 03084708858" />
                  </div>

                  {shippingDetails.paymentMethod !== 'COURT_PICKUP' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">Shipping Address</label>
                        <input required={shippingDetails.paymentMethod !== 'COURT_PICKUP'} type="text" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" placeholder="House/Apartment #, Street Name" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">City</label>
                        <input required={shippingDetails.paymentMethod !== 'COURT_PICKUP'} type="text" value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" placeholder="Lahore" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2">Fulfillment Method</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${shippingDetails.paymentMethod === 'FULL_PAYMENT' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                        <input type="radio" name="paymentMethod" value="FULL_PAYMENT" checked={shippingDetails.paymentMethod === 'FULL_PAYMENT'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="accent-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-white">Standard Delivery</p>
                          <p className="text-[10px] text-zinc-500">Shipped directly to address</p>
                        </div>
                      </label>
                      <label className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${shippingDetails.paymentMethod === 'COURT_PICKUP' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
                        <input type="radio" name="paymentMethod" value="COURT_PICKUP" checked={shippingDetails.paymentMethod === 'COURT_PICKUP'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="accent-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-white">Court Self-Pickup</p>
                          <p className="text-[10px] text-zinc-500">Collect live at Lahore court venue</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all mt-4">
                  Confirm and Submit Order
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto">✓</div>
                <div>
                  <h3 className="text-xl font-black uppercase text-white">Order Placed Successfully</h3>
                  <p className="text-zinc-400 text-xs mt-1">Your premium gear reservation has been recorded.</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left max-w-sm mx-auto font-mono text-xs text-zinc-400 space-y-1">
                  <p><span className="text-zinc-600">ORDER_ID:</span> {lastOrderId}</p>
                  <p><span className="text-zinc-600">STATUS:</span> PENDING_VERIFICATION</p>
                </div>
                <button onClick={() => setIsCheckoutOpen(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
