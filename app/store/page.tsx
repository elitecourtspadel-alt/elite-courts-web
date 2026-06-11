'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean;
          'auto-rotate'?: boolean;
          'rotation-per-second'?: string;
          style?: React.CSSProperties;
        }, HTMLElement>;
      }
    }
  }
}

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
  model3d?: string; 
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

const SPORTS = SPORT_COLLECTIONS.map(s => s.name);

function ProductDetailView({ product, onBack, onAddToCart, onBuyNow }: { product: Product; onBack: () => void; onAddToCart: (p: Product, qty: number) => void; onBuyNow: (p: Product, qty: number) => void }) {
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  
  const imageList: string[] = Array.isArray(product.images) 
    ? product.images.map((url: string) => url.trim()).filter((url: string) => url !== "")
    : (product.image ? [product.image.trim()] : ['/placeholder.jpg']);
    
  const [activeImg, setActiveImg] = useState<string>('/placeholder.jpg');

  useEffect(() => {
    if (!document.querySelector('script[src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
    setActiveImg(imageList[0] || '/placeholder.jpg');
    setDetailQuantity(1); // Reset counter on focus swap
  }, [product]);

  const rawPrice = parseInt(product.elitePrice.replace(/[^0-9]/g, '')) || 0;
  const dynamicallyScaledTotal = rawPrice * detailQuantity;

  return (
    <div className="animate-fadeIn">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 text-sm">
        ← Back to Shop Explorer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-5 space-y-4">
          {product.model3d ? (
            <div className="w-full h-[380px] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden relative">
              <model-viewer src={product.model3d} alt={product.name} camera-controls auto-rotate style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <div className="w-full h-[380px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center p-6">
              <img src={activeImg} className="max-h-full max-w-full object-contain" alt={product.name} />
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400">{product.category} Portfolio</span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-100 mt-1 mb-3">{product.name}</h1>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl flex items-center gap-6">
            <div>
              <p className="text-xs text-zinc-500">Market Standard</p>
              <span className="text-zinc-500 line-through text-lg">{product.marketPrice}</span>
            </div>
            <div className="border-l border-zinc-800 h-10" />
            <div>
              <p className="text-xs text-emerald-400/80">Elite Deal Rate</p>
              <span className="text-emerald-400 font-black text-3xl">{product.elitePrice}</span>
            </div>
          </div>

          <p className="text-zinc-400 text-sm">{product.description || "High-end configuration optimized for competitive play."}</p>

          {/* Real-time Order Multiplier Interface */}
          <div className="space-y-2 border-t border-zinc-900 pt-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select Purchase Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                <button 
                  type="button"
                  disabled={detailQuantity <= 1}
                  onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 bg-zinc-950 hover:bg-zinc-850 rounded-lg font-bold flex items-center justify-center disabled:opacity-30 transition-all"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold font-mono">{detailQuantity}</span>
                <button 
                  type="button"
                  onClick={() => setDetailQuantity(prev => prev + 1)}
                  className="w-10 h-10 bg-zinc-950 hover:bg-zinc-850 rounded-lg font-bold flex items-center justify-center transition-all"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Subtotal Value: <span className="text-emerald-400 font-mono font-bold text-sm ml-1">{dynamicallyScaledTotal.toLocaleString()} PKR</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={() => onAddToCart(product, detailQuantity)} className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-sm uppercase font-bold transition-all hover:bg-zinc-850">
              Add To Bag
            </button>
            <button onClick={() => onBuyNow(product, detailQuantity)} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-black uppercase transition-all">
              Buy It Now
            </button>
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

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

  const handleAddToCart = (product: Product, quantityToAdd = 1, openPanel = true) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(item => item.product.name === product.name);
      let newCart = [...prevCart];
      if (existingIdx > -1) {
        newCart[existingIdx].quantity += quantityToAdd;
      } else {
        newCart.push({ product, quantity: quantityToAdd });
      }
      return newCart;
    });
    if (openPanel) setIsCartOpen(true);
  };

  const handleForwardToCheckout = (currentCart: CartItem[]) => {
    localStorage.setItem('elite_store_active_cart', JSON.stringify(currentCart));
    window.location.href = '/checkout';
  };

  const handleBuyNow = (product: Product, quantityToBuy = 1) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(item => item.product.name === product.name);
      let newCart = [...prevCart];
      if (existingIdx > -1) {
        newCart[existingIdx].quantity += quantityToBuy;
      } else {
        newCart.push({ product, quantity: quantityToBuy });
      }
      // Instantly pass current mutation payload onward
      handleForwardToCheckout(newCart);
      return newCart;
    });
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[idx].quantity += delta;
      if (newCart[idx].quantity <= 0) newCart.splice(idx, 1);
      return newCart;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum = parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0;
      return total + (priceNum * item.quantity);
    }, 0);
  };

  const filteredProducts = products.filter((p) => {
    if (viewState === "Home") return true;
    return p.category === viewState;
  });

  const padelCategory = SPORT_COLLECTIONS.find(s => s.name === "Padel")!;
  const rightGridCategories = SPORT_COLLECTIONS.filter(s => s.name !== "Padel");

  return (
    <div className="bg-zinc-950 min-h-screen text-white relative">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span onClick={() => { setViewState("Home"); setSelectedProduct(null); }} className="text-xl font-black cursor-pointer">ELITE<span className="text-emerald-400">STORE</span></span>
          <nav className="flex items-center gap-4">
            <button onClick={() => { setViewState("Home"); setSelectedProduct(null); }} className="text-xs font-bold uppercase tracking-wider">Home</button>
            {SPORTS.map(sport => <button key={sport} onClick={() => { setViewState(sport); setSelectedProduct(null); }} className="text-xs font-bold uppercase tracking-wider">{sport}</button>)}
            <button onClick={() => setIsCartOpen(true)} className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all hover:border-zinc-700">
              Cart <span className="bg-emerald-500 text-black px-1.5 rounded-full font-black font-mono">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500 text-xs uppercase tracking-widest font-bold">Synchronizing Store Repository...</div>
      ) : selectedProduct ? (
        <div className="max-w-6xl mx-auto p-6">
          <ProductDetailView product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
        </div>
      ) : viewState === "Home" ? (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div onClick={() => { setViewState(padelCategory.name); }} className="lg:col-span-7 relative h-80 rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-end group">
              <img src={padelCategory.img} className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105" alt="" onError={(e) => { (e.target as HTMLImageElement).src = padelCategory.fallback; }} />
              <h3 className="text-3xl font-black relative z-10">{padelCategory.name} Gear</h3>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {rightGridCategories.map(sport => (
                <div key={sport.name} onClick={() => { setViewState(sport.name); }} className="relative h-36 rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800 p-4 flex flex-col justify-end group">
                  <img src={sport.img} className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-105" alt="" onError={(e) => { (e.target as HTMLImageElement).src = sport.fallback; }} />
                  <h4 className="text-sm font-bold relative z-10">{sport.name}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-300">Trending Repertoire</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 8).map((p, idx) => (
                <div key={idx} onClick={() => setSelectedProduct(p)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-all">
                  <div className="h-32 bg-zinc-950 rounded-lg mb-3 flex items-center justify-center p-2">
                    <img src={Array.isArray(p.images) ? p.images[0] : p.image} className="max-h-full object-contain" alt="" onError={e => (e.target as HTMLImageElement).src = 'https://placehold.co/150'} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-emerald-400 font-extrabold mt-1">{p.elitePrice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-black uppercase tracking-tight text-emerald-400 mb-6">{viewState} Repertoire</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((p, idx) => (
              <div key={idx} onClick={() => setSelectedProduct(p)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-all">
                <div className="h-40 bg-zinc-950 rounded-lg mb-3 flex items-center justify-center p-2">
                  <img src={Array.isArray(p.images) ? p.images[0] : p.image} className="max-h-full object-contain" alt="" />
                </div>
                <h4 className="text-sm font-bold truncate text-zinc-200">{p.name}</h4>
                <p className="text-sm text-emerald-400 font-black mt-1">{p.elitePrice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-out Drawer Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
                <h3 className="font-bold uppercase tracking-wider text-sm text-zinc-200">Your Checkout Bag</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white transition-colors">✕</button>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[65vh] pr-1">
                {cart.map((item, idx) => {
                  const itemUnitPrice = parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0;
                  return (
                    <div key={idx} className="flex gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl items-center">
                      <div className="flex-grow">
                        <h4 className="text-xs font-bold text-zinc-200">{item.product.name}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Unit: {item.product.elitePrice}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                            <button onClick={() => updateCartQty(idx, -1)} className="w-6 h-6 font-bold bg-zinc-950 hover:bg-zinc-800 rounded flex items-center justify-center transition-colors">-</button>
                            <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                            <button onClick={() => updateCartQty(idx, 1)} className="w-6 h-6 font-bold bg-zinc-950 hover:bg-zinc-800 rounded flex items-center justify-center transition-colors">+</button>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400">{(itemUnitPrice * item.quantity).toLocaleString()} PKR</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {cart.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase text-zinc-400 font-bold">Total Aggregate:</span>
                  <span className="text-xl font-black font-mono text-emerald-400">{getCartTotal().toLocaleString()} PKR</span>
                </div>
                <button onClick={() => handleForwardToCheckout(cart)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all">
                  Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
