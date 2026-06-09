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

// PREMIUM SPECIFIC IMAGERY SCHEME (NO CYCLING - ACCURATE RACQUET/FIELD SPORTS)
const SPORT_COLLECTIONS = [
  { name: "Padel", img: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=60" },
  { name: "Pickleball", img: "/images/sports/elite_courts_padel_card.avif" },
  { name: "Table Tennis", img: "https://images.unsplash.com/photo-1609710223199-14b5d5b1f8f7?w=800&auto=format&fit=crop&q=60" },
  { name: "Cricket", img: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=800&auto=format&fit=crop&q=60" },
  { name: "Badminton", img: "https://images.unsplash.com/photo-1617083277684-630247384661?w=800&auto=format&fit=crop&q=60" }
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
  const isHardware = ["Rackets", "Paddles", "Bats"].includes(product.subcategory);

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

  // Extract separate category components for explicit high-impact sizing layout
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
          
          {/* HERO LAYOUT: ACCURATE ACTION FLOW IN COURT SPORT */}
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

          {/* ASYMMETRICAL COLLECTION DASHBOARD GRID (PADEL FEATURED LARGE THUMBNAIL) */}
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-200 mb-6">Browse Pro Collections</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              
              {/* PADEL SECTOR - DOUBLE WIDTH & FULL HEIGHT */}
              <div 
                onClick={() => routeToSport(padelCategory.name)} 
                className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500/50 shadow-xl transition-all md:col-span-6 min-h-[340px] md:min-h-full flex flex-col justify-end"
              >
                <img 
                  src={padelCategory.img} 
                  alt="Padel Court Scene" 
                  className="w-full h-full object-cover absolute inset-0 group-hover:scale-102 transition-transform duration-500 ease-out filter brightness-75 group-hover:brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                
                <div className="relative p-6 md:p-8 z-10 flex flex-col gap-1">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                    {padelCategory.name}
                  </h3>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400/80">
                    Explore Premium Catalog ➔
                  </span>
                </div>
              </div>

              {/* SECONDARY SIDE GRID PANELS - 2X2 COMPOSITION PACKED BESIDE FEATURED ITEM */}
              <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {rightGridCategories.map((sport) => (
                  <div 
                    key={sport.name} 
                    onClick={() => routeToSport(sport.name)} 
                    className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl aspect-[4/3] sm:aspect-square overflow-hidden cursor-pointer hover:border-emerald-500/40 shadow-md transition-all flex flex-col justify-end"
                  >
                    <img 
                      src={sport.img} 
                      alt={`${sport.name} Equipment Display`} 
                      className="w-full h-full object-cover absolute inset-0 group-hover:scale-103 transition-transform duration-500 ease-out filter brightness-75 group-hover:brightness-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    
                    <div className="relative p-5 z-10 flex flex-col gap-0.5">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                        {sport.name}
                      </h4>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        View Department ➔
                      </span>
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
        /* TARGET INTERNAL SECTOR LAYOUT */
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

      {/* COMPONENT: SHOPPING CART PANEL */}
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
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">Shipping Home Address</label>
                        <input required type="text" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" placeholder="Street Address, Phase, Sector" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">City</label>
                        <input required type="text" value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all" placeholder="Lahore" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider">Select Delivery & Payment Strategy</label>
                  
                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${shippingDetails.paymentMethod === 'FULL_PAYMENT' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}>
                    <input type="radio" name="paymentStrategy" value="FULL_PAYMENT" checked={shippingDetails.paymentMethod === 'FULL_PAYMENT'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="mt-1 accent-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-white">Full Payment (Home Delivery)</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Pay securely via Bank Transfer or Digital wallets before dispatch.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${shippingDetails.paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}>
                    <input type="radio" name="paymentStrategy" value="COD" checked={shippingDetails.paymentMethod === 'COD'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="mt-1 accent-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-white">Cash on Delivery (Home Delivery)</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Settle with hard cash right at your doorstep upon courier package arrival.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${shippingDetails.paymentMethod === 'COURT_PICKUP' ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}>
                    <input type="radio" name="paymentStrategy" value="COURT_PICKUP" checked={shippingDetails.paymentMethod === 'COURT_PICKUP'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="mt-1 accent-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-white">Pick Up at Court Venue (Pay at Desk)</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Secure item tracking and physically pay upon pickup right at our courts terminal.</p>
                    </div>
                  </label>
                </div>

                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-all text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/10">
                  Confirm & Finalize Order
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">✓</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Order Logged Successfully</h3>
                  <p className="text-zinc-400 text-xs max-w-sm mx-auto">Your asset allocation record has been pushed to the Elite core server node.</p>
                  <p className="text-[11px] font-mono text-zinc-500 pt-1">Invoice ID: {lastOrderId}</p>
                </div>

                <button 
                  onClick={() => { setIsCheckoutOpen(false); setSelectedProduct(null); setViewState("Home"); }} 
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 px-8 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all text-zinc-300"
                >
                  Return to Dashboard Explorer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
