'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

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
const ELITE_COURTS_ADDRESS = "Elite Courts Complex, Phase 5, DHA, Lahore, Pakistan";

interface CartItem {
  product: {
    name: string;
    category: string;
    elitePrice: string;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [fulfillment, setFulfillment] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'CASH_ON_DELIVERY' // Easily swappable for 'INTEGRATED_GATEWAY' later
  });

  // Pull cart snapshot from local state manager on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('elite_store_active_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const handleFulfillmentChange = (type: 'DELIVERY' | 'PICKUP') => {
    setFulfillment(type);
    setShippingDetails(prev => ({
      ...prev,
      paymentMethod: type === 'PICKUP' ? 'COURT_PICKUP' : 'CASH_ON_DELIVERY'
    }));
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

    if (fulfillment === 'DELIVERY' && (!shippingDetails.address || !shippingDetails.city)) {
      alert("Please fill out complete destination delivery properties.");
      return;
    }

    const db = getDatabase(app);
    const ordersRef = ref(db, 'store/orders');

    const orderPayload = {
      customer: {
        name: shippingDetails.fullName,
        phone: shippingDetails.phone,
        address: fulfillment === 'PICKUP' ? ELITE_COURTS_ADDRESS : shippingDetails.address,
        city: fulfillment === 'PICKUP' ? 'Lahore' : shippingDetails.city
      },
      fulfillmentType: fulfillment,
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
      timestamp: Date.now()
    };

    try {
      /* FUTURE PAYMENT GATEWAY HOOK GOES HERE */
      // If paymentMethod === 'CARD', you'd trigger payment intent API here before saving to DB
      
      const newOrderRef = await push(ordersRef, orderPayload);
      if (newOrderRef.key) {
        setLastOrderId(newOrderRef.key);
        setCheckoutStep('SUCCESS');
        localStorage.removeItem('elite_store_active_cart');
        setCart([]);
      }
    } catch (err) {
      console.error("Order processing failure:", err);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <a href="/store" className="text-zinc-400 hover:text-emerald-400 text-xs uppercase tracking-wider font-bold transition-colors">
          &larr; Return to Shopping Hub
        </a>

        <h1 className="text-3xl font-black uppercase tracking-tight border-b border-zinc-900 pb-4">
          Secure Checkout System
        </h1>

        {checkoutStep === 'FORM' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl space-y-6">
              <h3 className="text-base font-bold uppercase tracking-wide text-zinc-200">Fulfillment Framework</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => handleFulfillmentChange('DELIVERY')} className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${fulfillment === 'DELIVERY' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>
                  🚚 Home Delivery
                </button>
                <button type="button" onClick={() => handleFulfillmentChange('PICKUP')} className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${fulfillment === 'PICKUP' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>
                  🏢 Complex Pickup
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Customer Full Name</label>
                  <input type="text" required value={shippingDetails.fullName} onChange={e => setShippingDetails(prev => ({ ...prev, fullName: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all" placeholder="e.g. Shahrukh Khan" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Contact Hotline Number</label>
                  <input type="tel" required value={shippingDetails.phone} onChange={e => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all" placeholder="e.g. +92 300 1234567" />
                </div>

                {fulfillment === 'DELIVERY' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Destination Dropoff Address</label>
                      <input type="text" value={shippingDetails.address} onChange={e => setShippingDetails(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all" placeholder="Street configuration, House layout" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">City Profile</label>
                      <input type="text" value={shippingDetails.city} onChange={e => setShippingDetails(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all" placeholder="e.g. Lahore" />
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1.5 text-zinc-400">
                    <p className="font-bold text-zinc-300">🏢 Collection Headquarters Location:</p>
                    <p className="italic">{ELITE_COURTS_ADDRESS}</p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all">
                Authorize & Dispatch Order
              </button>
            </form>

            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-200">Invoice Summary</h3>
              {cart.length === 0 ? (
                <p className="text-zinc-500 text-xs">No current processing line items parsed.</p>
              ) : (
                <>
                  <div className="divide-y divide-zinc-800 max-h-[240px] overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-3 flex justify-between text-xs">
                        <div>
                          <p className="font-bold text-zinc-300">{item.product.name}</p>
                          <p className="text-zinc-500">Qty: {item.quantity} × {item.product.elitePrice}</p>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          {((parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0) * item.quantity).toLocaleString()} PKR
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-zinc-400">Total Invoice Amount:</span>
                    <span className="text-xl font-black text-emerald-400">{getCartTotal().toLocaleString()} PKR</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl mx-auto space-y-6 p-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto">✓</div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Order Dispatched</h2>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
              Your performance equipment record payload has been appended. Node Token Reference: <span className="font-mono text-emerald-400">{lastOrderId}</span>
            </p>
            <a href="/store" className="inline-block px-6 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
              Return to Front Page Shop
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
