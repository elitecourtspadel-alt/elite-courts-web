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
  storageBucket: "elitecourtsapp.firebasestorage.app",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d",
  databaseURL: "https://elitecourtsapp-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

interface ProductSpecs {
  weight?: string;
  balance?: string;
  thickness?: string;
  shape?: string;
  characters?: string;
  [key: string]: string | undefined;
}

interface Product {
  name: string;
  category: string;
  subcategory: string;
  materialFace?: string;
  marketPrice: string;
  elitePrice: string;
  images?: string[];
  image?: string;
  mediaUrl?: string;
  imageUrl?: string;
  model3d?: string;
  description?: string;
  performanceDescriptionManifest?: string;
  specs?: ProductSpecs;
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
const PADEL_MATERIALS = ["All Gear", "Glass Fiber", "3K", "24K", "Balls"];

// ── Theme-aware class helpers ──────────────────────────────────────────────────
// bg levels: page bg, card, card inner, nav
const t = (isDark: boolean) => ({
  page:       isDark ? 'bg-zinc-950 text-white'                        : 'bg-slate-50 text-zinc-900',
  nav:        isDark ? 'bg-zinc-900/90 border-zinc-800'                : 'bg-white/90 border-zinc-200',
  navText:    isDark ? 'text-zinc-400 hover:text-white'                : 'text-zinc-500 hover:text-zinc-900',
  navActive:  'text-emerald-500',
  card:       isDark ? 'bg-zinc-900 border-zinc-800'                   : 'bg-white border-zinc-200',
  cardInner:  isDark ? 'bg-gradient-to-b from-zinc-950 to-black border-zinc-900' : 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-300',
  cardHover:  isDark ? 'hover:border-emerald-500/30 hover:shadow-[0_12px_30px_-10px_rgba(16,185,129,0.25)]'
                     : 'hover:border-emerald-400/50 hover:shadow-[0_12px_30px_-10px_rgba(16,185,129,0.18)]',
  specCell:   isDark ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' : 'bg-slate-100 border-zinc-200 hover:border-zinc-300',
  specLabel:  isDark ? 'text-zinc-500' : 'text-zinc-400',
  specValue:  isDark ? 'text-white'    : 'text-zinc-900',
  text:       isDark ? 'text-zinc-200' : 'text-zinc-800',
  muted:      isDark ? 'text-zinc-400' : 'text-zinc-500',
  dimmed:     isDark ? 'text-zinc-500' : 'text-zinc-400',
  border:     isDark ? 'border-zinc-800' : 'border-zinc-200',
  divider:    isDark ? 'border-zinc-900' : 'border-zinc-100',
  surface:    isDark ? 'bg-zinc-900'     : 'bg-white',
  surfaceDeep:isDark ? 'bg-zinc-950'     : 'bg-slate-100',
  input:      isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-zinc-900',
  pill:       isDark ? 'bg-zinc-900 border-zinc-800'            : 'bg-white border-zinc-200',
  pillActive: isDark ? 'bg-zinc-700 text-white'                 : 'bg-zinc-900 text-white',
  pillInactive:isDark? 'text-zinc-500 hover:text-white'         : 'text-zinc-400 hover:text-zinc-900',
  cartDrawer: isDark ? 'bg-zinc-900 border-zinc-800'            : 'bg-white border-zinc-200',
  cartItem:   isDark ? 'bg-zinc-950 border-zinc-800'            : 'bg-slate-50 border-zinc-200',
  qtyBtn:     isDark ? 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-white hover:bg-slate-100 text-zinc-500 hover:text-zinc-900',
  qtyWrap:    isDark ? 'bg-zinc-900 border-zinc-800'            : 'bg-slate-100 border-zinc-200',
  backBtn:    isDark ? 'text-zinc-400 hover:text-emerald-400'   : 'text-zinc-500 hover:text-emerald-600',
  priceBg:    isDark ? 'bg-gradient-to-br from-zinc-900 to-zinc-900/40 border-zinc-800' : 'bg-gradient-to-br from-slate-50 to-slate-100 border-zinc-200',
  strikePrice:isDark ? 'text-zinc-500' : 'text-zinc-400',
  addToCart:  isDark ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700' : 'bg-slate-100 border-zinc-200 text-zinc-900 hover:bg-slate-200 hover:border-zinc-300',
  emptyBox:   isDark ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-zinc-200',
  sortActive: isDark ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-white',
  sortInactive:isDark? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900',
  trendDivider:isDark? 'text-zinc-400 from-zinc-800' : 'text-zinc-400 from-zinc-300',
  overlay:    isDark ? 'bg-black/80' : 'bg-black/50',
});

function ProductDetailView({ product, onBack, onAddToCart, onBuyNow, isDark }: {
  product: Product; onBack: () => void;
  onAddToCart: (p: Product, qty: number) => void;
  onBuyNow: (p: Product, qty: number) => void;
  isDark: boolean;
}) {
  const c = t(isDark);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  const imageList: string[] = Array.isArray(product.images)
    ? product.images.map((url: string) => url.trim()).filter((url: string) => url !== "")
    : [product.image, product.mediaUrl, product.imageUrl]
        .filter((url): url is string => typeof url === 'string' && url.trim() !== "")
        .map(url => url.trim());

  if (imageList.length === 0) imageList.push('/placeholder.jpg');

  const [activeImg, setActiveImg] = useState<string>(imageList[0]);

  useEffect(() => {
    if (!document.querySelector('script[src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
    setActiveImg(imageList[0]);
    setDetailQuantity(1);
  }, [product]);

  const rawPrice = parseInt(product.elitePrice.replace(/[^0-9]/g, '')) || 0;
  const dynamicallyScaledTotal = rawPrice * detailQuantity;

  const weight = product.specs?.weight || 'N/A';
  const balance = product.specs?.balance || 'N/A';
  const thick  = product.specs?.thickness || 'N/A';
  const shape  = product.specs?.shape || 'N/A';
  const traits = product.specs?.characters || 'N/A';
  const hasSpecs = weight !== 'N/A' || balance !== 'N/A' || thick !== 'N/A' || shape !== 'N/A' || traits !== 'N/A';

  return (
    <div className="animate-fadeIn">
      <button onClick={onBack} className={`mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${c.backBtn}`}>
        ← Back to Shop Explorer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
        <div className="lg:col-span-5 space-y-4">
          {product.model3d ? (
            <div className={`w-full h-[400px] border rounded-3xl flex items-center justify-center overflow-hidden relative shadow-[0_0_60px_-20px_rgba(16,185,129,0.15)] ${c.card}`}>
              <model-viewer src={product.model3d} alt={product.name} camera-controls auto-rotate style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <div className={`w-full h-[400px] border rounded-3xl flex items-center justify-center p-10 relative shadow-[0_0_60px_-20px_rgba(16,185,129,0.15)] overflow-hidden ${c.card}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.06),transparent_60%)]" />
              <img src={activeImg} className="max-h-full max-w-full object-contain rounded-lg transition-all duration-300 relative z-10" alt={product.name} />
            </div>
          )}

          {imageList.length > 1 && (
            <div className="flex flex-wrap gap-2.5 pt-1 justify-start items-center">
              {imageList.map((url, i) => (
                <button key={i} type="button" onClick={() => setActiveImg(url)}
                  className={`w-20 h-20 border rounded-2xl overflow-hidden p-2 flex items-center justify-center transition-all duration-200 ${c.surface} ${
                    activeImg === url ? 'border-emerald-400 ring-2 ring-emerald-500/25 shadow-[0_0_20px_-4px_rgba(16,185,129,0.4)]' : `${c.border} hover:border-zinc-500`
                  }`}>
                  <img src={url} alt={`view-${i}`} className="max-h-full max-w-full object-contain rounded-md" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-7">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase font-bold text-emerald-500 tracking-[0.15em]">
                {product.category} {product.subcategory ? `/ ${product.subcategory}` : 'Portfolio'}
              </span>
              {product.materialFace && product.materialFace !== 'None / Standard' && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                  {product.materialFace}
                </span>
              )}
            </div>
            <h1 className={`text-3xl md:text-[2.75rem] font-extrabold mt-2 mb-1 leading-[1.05] tracking-tight ${c.text}`}>{product.name}</h1>
          </div>

          <div className={`border p-6 rounded-2xl flex items-center gap-6 ${c.priceBg}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${c.dimmed}`}>Market Standard</p>
              <span className={`line-through text-lg font-medium font-mono ${c.strikePrice}`}>{product.marketPrice}</span>
            </div>
            <div className={`border-l h-12 ${c.border}`} />
            <div>
              <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-[0.15em] mb-1">Elite Deal Rate</p>
              <span className="text-emerald-500 font-black text-3xl font-mono tracking-tight">{product.elitePrice}</span>
            </div>
          </div>

          <p className={`text-sm leading-7 ${c.muted}`}>
            {product.performanceDescriptionManifest || product.description || "High-end configuration optimized for competitive play."}
          </p>

          {hasSpecs && (
            <div className={`mt-2 border-t pt-6 space-y-4 ${c.divider}`}>
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-500">Technical Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                {[
                  { label: 'Total Weight', val: weight },
                  { label: 'Balance Matrix', val: balance },
                  { label: 'Thickness', val: thick },
                  { label: 'Structural Shape', val: shape, wide: true },
                  { label: 'Characteristics / Fit', val: traits, wide2: true },
                ].map(({ label, val, wide, wide2 }) => (
                  <div key={label} className={`border p-4 rounded-xl transition-colors ${c.specCell} ${wide ? 'col-span-2 sm:col-span-1' : ''} ${wide2 ? 'col-span-2' : ''}`}>
                    <span className={`text-[9px] font-sans font-bold uppercase block mb-1 tracking-wider ${c.specLabel}`}>{label}</span>
                    <span className={`text-xs font-semibold ${c.specValue}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`space-y-3 border-t pt-6 ${c.divider}`}>
            <label className={`block text-[10px] font-bold uppercase tracking-[0.15em] ${c.dimmed}`}>Select Purchase Quantity</label>
            <div className="flex items-center gap-6">
              <div className={`flex items-center border rounded-xl p-1 ${c.qtyWrap}`}>
                <button type="button" disabled={detailQuantity <= 1}
                  onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                  className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center disabled:opacity-30 transition-all ${c.qtyBtn}`}>—</button>
                <span className={`w-12 text-center text-sm font-black font-mono ${c.text}`}>{detailQuantity}</span>
                <button type="button" onClick={() => setDetailQuantity(prev => prev + 1)}
                  className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${c.qtyBtn}`}>+</button>
              </div>
              <p className={`text-xs font-medium ${c.muted}`}>
                Subtotal: <span className="text-emerald-500 font-mono font-black text-base ml-1">{dynamicallyScaledTotal.toLocaleString()} PKR</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={() => onAddToCart(product, detailQuantity)}
              className={`flex-1 py-4 border rounded-xl text-xs uppercase font-black tracking-wider transition-all ${c.addToCart}`}>
              Add To Bag
            </button>
            <button onClick={() => onBuyNow(product, detailQuantity)}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_8px_30px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_36px_-6px_rgba(16,185,129,0.7)]">
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All Gear");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc' | 'alpha-asc' | 'alpha-desc'>('default');

  // ── Theme sync: reads localStorage + watches data-theme mutations ────────────
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const STORAGE_KEY = 'elite-theme';
    const readTheme = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const attr = document.documentElement.dataset.theme;
      setIsDark((attr ?? stored ?? 'dark') !== 'light');
    };
    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const c = t(isDark);

  // On first mount, if we arrived at /store with no params from the referring link,
  // wipe any stale params that might be left in the browser's session history
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    // If there's no view param, clean the URL and force Home state immediately
    if (!params.get('view')) {
      window.history.replaceState({}, '', window.location.pathname);
      setViewState('Home');
      setSelectedSubcategory('All Gear');
      setSelectedProduct(null);
    }
  }, []);
    const productsRef = ref(db, 'store/products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedProducts = data ? Object.values(data) as Product[] : [];
      setProducts(loadedProducts);
      setLoading(false);
      syncStateFromUrl(loadedProducts);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => syncStateFromUrl(products);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  const syncStateFromUrl = (availableProducts: Product[]) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const subParam = params.get('subcategory') || 'All Gear';
    const productParam = params.get('product');

    // If no view param in URL at all, always land on Home — never inherit a stale view
    if (!viewParam) {
      setViewState('Home');
      setSelectedSubcategory('All Gear');
      setSelectedProduct(null);
      return;
    }

    setViewState(viewParam);
    setSelectedSubcategory(subParam);

    if (productParam && availableProducts.length > 0) {
      const match = availableProducts.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === productParam);
      if (match) { setSelectedProduct(match); return; }
    }
    setSelectedProduct(null);
  };

  const navigateTo = (view: string, subcat: string = "All Gear", product: Product | null = null) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (view !== 'Home') params.set('view', view);
    if (view === 'Padel' && subcat !== 'All Gear') params.set('subcategory', subcat);
    if (product) {
      if (view === 'Home') params.set('view', product.category);
      params.set('product', product.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
    const searchStr = params.toString();
    const targetUrl = window.location.pathname + (searchStr ? `?${searchStr}` : '');
    window.history.pushState({ view, subcat, productName: product?.name || null }, '', targetUrl);
    setViewState(product ? product.category : view);
    setSelectedSubcategory(subcat);
    setSelectedProduct(product);
    setSortOrder('default');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, quantityToAdd = 1, openPanel = true) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.name === product.name);
      const next = [...prev];
      if (idx > -1) next[idx].quantity += quantityToAdd;
      else next.push({ product, quantity: quantityToAdd });
      return next;
    });
    if (openPanel) setIsCartOpen(true);
  };

  const handleForwardToCheckout = (currentCart: CartItem[]) => {
    localStorage.setItem('elite_store_active_cart', JSON.stringify(currentCart));
    window.location.href = '/checkout';
  };

  const handleBuyNow = (product: Product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.name === product.name);
      const next = [...prev];
      if (idx > -1) next[idx].quantity += qty;
      else next.push({ product, quantity: qty });
      handleForwardToCheckout(next);
      return next;
    });
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      next[idx].quantity += delta;
      if (next[idx].quantity <= 0) next.splice(idx, 1);
      return next;
    });
  };

  const getCartTotal = () => cart.reduce((total, item) => {
    return total + (parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0) * item.quantity;
  }, 0);

  const filteredProducts = products.filter(p => {
    if (viewState === "Home") return true;
    if (p.category !== viewState) return false;
    if (viewState === "Padel" && selectedSubcategory !== "All Gear") {
      const norm = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      return norm(p.subcategory).includes(norm(selectedSubcategory)) || norm(p.name).includes(norm(selectedSubcategory));
    }
    return true;
  });

  const getPrice = (p: Product) => parseInt(p.elitePrice.replace(/[^0-9]/g, '')) || 0;
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc')  return getPrice(a) - getPrice(b);
    if (sortOrder === 'price-desc') return getPrice(b) - getPrice(a);
    if (sortOrder === 'alpha-asc')  return a.name.localeCompare(b.name);
    if (sortOrder === 'alpha-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const padelCategory = SPORT_COLLECTIONS.find(s => s.name === "Padel")!;
  const rightGridCategories = SPORT_COLLECTIONS.filter(s => s.name !== "Padel");

  const ProductCard = ({ p, subcat }: { p: Product; subcat?: string }) => {
    const imgSrc = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || p.mediaUrl || p.imageUrl || 'https://placehold.co/150');
    return (
      <div onClick={() => navigateTo(p.category, subcat ?? "All Gear", p)}
        className={`border rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group shadow-[0_4px_20px_-8px_rgba(0,0,0,0.12)] ${c.card} ${c.cardHover}`}>
        <div>
          <div className={`h-44 rounded-xl mb-3 flex items-center justify-center p-4 border overflow-hidden relative ${c.cardInner}`}>
            <img src={imgSrc} className="max-h-full object-contain transition-transform duration-300 group-hover:scale-105" alt=""
              onError={e => (e.target as HTMLImageElement).src = 'https://placehold.co/150'} />
          </div>
          <h4 className={`text-sm font-bold truncate group-hover:text-emerald-500 transition-colors ${c.text}`}>{p.name}</h4>
        </div>
        <div className={`flex items-baseline justify-between mt-2 border-t pt-2 ${c.divider}`}>
          <span className={`text-xs line-through font-mono ${c.strikePrice}`}>{p.marketPrice}</span>
          <span className="text-sm text-emerald-500 font-black font-mono">{p.elitePrice}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen relative animate-fadeIn transition-colors duration-300 ${c.page}`}>

      {/* Navigation Header */}
      <div className={`backdrop-blur-md border-b px-6 py-4 sticky top-0 z-40 transition-colors duration-300 ${c.nav}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span onClick={() => navigateTo("Home")} className="text-xl font-black cursor-pointer tracking-tight select-none">
            ELITE<span className="text-emerald-500">STORE</span>
          </span>
          <nav className="flex items-center gap-7">
            <button onClick={() => navigateTo("Home")}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${viewState === 'Home' && !selectedProduct ? c.navActive : c.navText}`}>
              Home
            </button>
            {SPORTS.map(sport => (
              <button key={sport} onClick={() => navigateTo(sport)}
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${(viewState === sport && !selectedProduct) ? c.navActive : c.navText}`}>
                {sport}
              </button>
            ))}
            <button onClick={() => setIsCartOpen(true)}
              className={`border px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:border-emerald-500/40 ${c.card}`}>
              Cart <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-md font-black font-mono text-[11px]">{cart.reduce((a, i) => a + i.quantity, 0)}</span>
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-24 text-xs uppercase tracking-widest font-bold animate-pulse ${c.dimmed}`}>
          Synchronizing Store Repository...
        </div>

      ) : selectedProduct ? (
        <div className="max-w-6xl mx-auto p-6">
          <ProductDetailView product={selectedProduct} isDark={isDark}
            onBack={() => navigateTo(viewState, selectedSubcategory)}
            onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
        </div>

      ) : viewState === "Home" ? (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">

          {/* Hero Banner — always dark since it has a photo bg */}
          <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] flex flex-col justify-end p-8 md:p-14 group">
            <img src="/images/padel-img.webp"
              className="absolute inset-0 w-full h-full object-cover object-[75%_center] opacity-70 transition-transform duration-700 group-hover:scale-105"
              alt="Elite Precision Court Action"
              onError={e => { (e.target as HTMLImageElement).src = padelCategory.fallback; }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            <div className="relative z-20 space-y-5 max-w-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/25">
                Now Open
              </span>
              <h2 className="text-4xl md:text-[3.4rem] font-black uppercase tracking-tight text-white leading-[1.02]">
                Gear Up With <br /><span className="text-emerald-400">Elite Precision</span>
              </h2>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-md">
                Pro-grade sports gear for padel, pickleball, cricket, badminton and table tennis — optimized for peak competitive performance.
              </p>
              <div className="pt-2 flex gap-3 flex-wrap">
                <button onClick={() => navigateTo(padelCategory.name)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.55)]">
                  Explore Padel Equipment
                </button>
                <button onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/5 hover:bg-white/10 border border-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all backdrop-blur-sm">
                  View Trending Gear
                </button>
              </div>
            </div>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div onClick={() => navigateTo(padelCategory.name)}
              className={`lg:col-span-7 relative h-80 rounded-3xl overflow-hidden cursor-pointer border p-8 flex flex-col justify-end group transition-all hover:border-zinc-600 ${c.card}`}>
              <img src={padelCategory.img} className="absolute inset-0 w-full h-full object-cover opacity-45 transition-transform duration-500 group-hover:scale-105" alt=""
                onError={e => { (e.target as HTMLImageElement).src = padelCategory.fallback; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Featured Category</span>
                <h3 className="text-3xl font-black uppercase tracking-tight text-white">{padelCategory.name} Gear</h3>
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-5">
              {rightGridCategories.map(sport => (
                <div key={sport.name} onClick={() => navigateTo(sport.name)}
                  className={`relative h-36 rounded-3xl overflow-hidden cursor-pointer border p-4 flex flex-col justify-end group transition-all hover:border-zinc-600 ${c.card}`}>
                  <img src={sport.img} className="absolute inset-0 w-full h-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105" alt=""
                    onError={e => { (e.target as HTMLImageElement).src = sport.fallback; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  <h4 className="text-sm font-bold relative z-10 uppercase tracking-wider text-white">{sport.name}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div id="trending-section" className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className={`text-xs font-black uppercase tracking-widest ${c.dimmed}`}>Trending Gear</h2>
              <div className={`h-px flex-1 bg-gradient-to-r to-transparent ${c.trendDivider}`} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.slice(0, 8).map((p, idx) => {
                const imgSrc = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || p.mediaUrl || p.imageUrl || 'https://placehold.co/150');
                return (
                  <div key={idx} onClick={() => navigateTo(p.category, "All Gear", p)}
                    className={`border rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${c.card} ${c.cardHover}`}>
                    <div>
                      <div className={`h-36 rounded-xl mb-3 flex items-center justify-center p-3 border overflow-hidden ${c.cardInner}`}>
                        <img src={imgSrc} className="max-h-full object-contain transition-transform duration-300 group-hover:scale-105" alt=""
                          onError={e => (e.target as HTMLImageElement).src = 'https://placehold.co/150'} />
                      </div>
                      <h4 className={`text-xs font-bold line-clamp-1 group-hover:text-emerald-500 transition-colors ${c.text}`}>{p.name}</h4>
                    </div>
                    <div className={`flex items-baseline justify-between mt-2 border-t pt-2 ${c.divider}`}>
                      <span className={`text-[10px] line-through font-mono ${c.strikePrice}`}>{p.marketPrice ? p.marketPrice.split(' ')[0] : 'N/A'}</span>
                      <span className="text-xs text-emerald-500 font-black font-mono">{p.elitePrice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      ) : (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-emerald-500">{viewState} Repertoire</h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Sort Controls */}
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${c.pill}`}>
                {([
                  { value: 'default',    label: 'Default' },
                  { value: 'price-asc',  label: '↑ Price' },
                  { value: 'price-desc', label: '↓ Price' },
                  { value: 'alpha-asc',  label: 'A → Z' },
                  { value: 'alpha-desc', label: 'Z → A' },
                ] as const).map(opt => (
                  <button key={opt.value} onClick={() => setSortOrder(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                      sortOrder === opt.value ? c.sortActive : c.sortInactive
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {viewState === "Padel" && (
                <div className={`flex flex-wrap gap-1.5 p-1.5 rounded-xl border ${c.pill}`}>
                  {PADEL_MATERIALS.map(material => (
                    <button key={material} onClick={() => navigateTo("Padel", material)}
                      className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                        selectedSubcategory === material
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                          : c.pillInactive
                      }`}>
                      {material}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className={`py-20 text-center text-xs uppercase tracking-widest font-bold border border-dashed rounded-2xl ${c.emptyBox}`}>
              No configurations match this specification variant.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((p, idx) => <ProductCard key={idx} p={p} subcat={selectedSubcategory} />)}
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className={`fixed inset-0 z-50 flex justify-end animate-fadeIn ${c.overlay}`}>
          <div className={`w-full max-w-md border-l p-6 flex flex-col justify-between h-full transition-colors duration-300 ${c.cartDrawer}`}>
            <div>
              <div className={`flex justify-between items-center border-b pb-4 mb-4 ${c.border}`}>
                <h3 className={`font-bold uppercase tracking-wider text-xs ${c.text}`}>Your Checkout Bag</h3>
                <button onClick={() => setIsCartOpen(false)} className={`transition-colors text-sm ${c.muted}`}>✕</button>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                {cart.length === 0 ? (
                  <div className={`p-8 text-center text-xs font-bold uppercase tracking-wider border border-dashed rounded-xl ${c.emptyBox}`}>
                    Your bag is empty.
                  </div>
                ) : cart.map((item, idx) => {
                  const unitPrice = parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0;
                  return (
                    <div key={idx} className={`flex gap-4 p-4 border rounded-xl items-center ${c.cartItem}`}>
                      <div className="flex-grow">
                        <h4 className={`text-xs font-bold ${c.text}`}>{item.product.name}</h4>
                        <p className={`text-[11px] font-mono mt-0.5 ${c.dimmed}`}>Unit: {item.product.elitePrice}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className={`flex items-center gap-1 border rounded-lg p-0.5 ${c.qtyWrap}`}>
                            <button onClick={() => updateCartQty(idx, -1)} className={`w-6 h-6 font-bold rounded flex items-center justify-center transition-colors ${c.qtyBtn}`}>—</button>
                            <span className={`w-8 text-center text-xs font-bold font-mono ${c.text}`}>{item.quantity}</span>
                            <button onClick={() => updateCartQty(idx, 1)} className={`w-6 h-6 font-bold rounded flex items-center justify-center transition-colors ${c.qtyBtn}`}>+</button>
                          </div>
                          <span className="text-xs font-mono font-black text-emerald-500">{(unitPrice * item.quantity).toLocaleString()} PKR</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {cart.length > 0 && (
              <div className={`pt-4 border-t space-y-4 ${c.border}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs uppercase font-bold tracking-wider ${c.muted}`}>Total:</span>
                  <span className="text-xl font-black font-mono text-emerald-500">{getCartTotal().toLocaleString()} PKR</span>
                </div>
                <button onClick={() => handleForwardToCheckout(cart)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_8px_30px_-8px_rgba(16,185,129,0.5)]">
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
