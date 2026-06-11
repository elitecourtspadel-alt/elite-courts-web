'use client';
import React, { useState, useEffect } from 'react';
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [fulfillment, setFulfillment] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  
  // Payment Validation States
  const [paymentType, setPaymentType] = useState<'DEPOSIT_20' | 'FULL_PAYMENT'>('DEPOSIT_20');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const cachedCart = localStorage.getItem('elite_store_active_cart');
    if (cachedCart) {
      setCart(JSON.parse(cachedCart));
    }
  }, []);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const priceNum = parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0;
      return total + (priceNum * item.quantity);
    }, 0);
  };

  const totalAmount = getCartTotal();
  const depositAmount = Math.round(totalAmount * 0.20);
  const requiredPaymentAmount = paymentType === 'DEPOSIT_20' ? depositAmount : totalAmount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Screenshot size exceeds 2MB limit. Please compress or crop your file.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to parse file structural data streams safely.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!screenshotBase64) {
      alert("Please upload your transaction payment screenshot before placing order.");
      return;
    }

    const db = getDatabase(app);
    const ordersRef = ref(db, 'store/orders');

    const orderPayload = {
      customer: { name, phone, address: fulfillment === 'PICKUP' ? 'Store Pickup Collection HQ' : address, city },
      fulfillmentType: fulfillment,
      items: cart.map(item => {
        const cleanedPrice = parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0;
        return {
          name: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          unitPrice: `${cleanedPrice} PKR`, // Standardized tracking structure
          totalItemCost: cleanedPrice * item.quantity
        };
      }),
      financials: {
        orderTotal: `${totalAmount.toLocaleString()} PKR`,
        paymentMethod: fulfillment === 'PICKUP' ? 'Store Pickup Pre-Paid' : 'COD Balance Remaining',
        paymentType: paymentType,
        requiredPaymentAmount: `${requiredPaymentAmount.toLocaleString()} PKR`,
        paymentScreenshot: screenshotBase64
      },
      orderStatus: 'PENDING_VERIFICATION',
      timestamp: Date.now()
    };

    try {
      await push(ordersRef, orderPayload);
      localStorage.removeItem('elite_store_active_cart');
      alert("Order package logged successfully! Verifying payment payload via stream router.");
      window.location.href = '/'; 
    } catch (err) {
      console.error("Database storage rejection:", err);
      alert("Critical error handling structural transmission update.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-4">No assets found inside your checkout bag</p>
        <a href="/store" className="bg-emerald-500 text-black font-black text-xs uppercase px-6 py-3 rounded-xl tracking-wider">Return to Store</a>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Fulfillment Manifest</h2>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Provide secure customer logistics records</p>
          </div>

          <div className="grid grid-cols-2 bg-zinc-950 p-1 border border-zinc-850 rounded-xl">
            <button type="button" onClick={() => setFulfillment('DELIVERY')} className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${fulfillment === 'DELIVERY' ? 'bg-emerald-500 text-black' : 'text-zinc-400'}`}>
              Home Delivery
            </button>
            <button type="button" onClick={() => setFulfillment('PICKUP')} className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${fulfillment === 'PICKUP' ? 'bg-emerald-500 text-black' : 'text-zinc-400'}`}>
              Store Pickup
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Your Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="e.g. Shahrukh Khan" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">WhatsApp / Contact Hotline</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="e.g. 03211234567" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fulfillment === 'DELIVERY' && (
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Street Delivery Address</label>
                  <input type="text" required={fulfillment === 'DELIVERY'} value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="House/Apartment #, Street name, Sector/Block" />
                </div>
              )}
              <div className={fulfillment === 'PICKUP' ? "md:col-span-2" : "w-full"}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">City Location</label>
                <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="e.g. Lahore" />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-850 pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">Secure Pre-Paid Remittance</h3>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Select pricing allocation strategy to unlock verification gateway</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => setPaymentType('DEPOSIT_20')} className={`p-4 rounded-xl border cursor-pointer transition-all ${paymentType === 'DEPOSIT_20' ? 'bg-zinc-950 border-emerald-500' : 'bg-zinc-950/40 border-zinc-850 opacity-60'}`}>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pay 20% Deposit</span>
                <span className="block text-sm font-black text-white mt-1 font-mono">{depositAmount.toLocaleString()} PKR</span>
                <span className="block text-[9px] text-zinc-500 mt-0.5 font-medium">Pay balance on delivery</span>
              </div>
              <div onClick={() => setPaymentType('FULL_PAYMENT')} className={`p-4 rounded-xl border cursor-pointer transition-all ${paymentType === 'FULL_PAYMENT' ? 'bg-zinc-950 border-emerald-500' : 'bg-zinc-950/40 border-zinc-850 opacity-60'}`}>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pay Full Amount</span>
                <span className="block text-sm font-black text-emerald-400 mt-1 font-mono">{totalAmount.toLocaleString()} PKR</span>
                <span className="block text-[9px] text-zinc-500 mt-0.5 font-medium">Completely finalize upfront</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">Elite Accounts Remittance Target</span>
              <div className="text-xs space-y-1 text-zinc-300">
                <p><span className="text-zinc-500 font-medium">Bank Name:</span> Meezan Bank</p>
                <p><span className="text-zinc-500 font-medium">Account Title:</span> Elite Enterprises</p>
                <p><span className="text-zinc-500 font-medium">Account Number:</span> 11580113772152</p>
                <p className="pt-2 text-[11px] text-amber-400 font-bold">⚠️ Required Payment Transfer Amount: <span className="underline font-mono text-xs">{requiredPaymentAmount.toLocaleString()} PKR</span></p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Attach Transaction Receipt Screenshot</label>
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col items-center justify-center relative hover:border-zinc-700 transition-colors">
                <input type="file" accept="image/*" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {screenshotBase64 ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                      <img src={screenshotBase64} className="max-h-full max-w-full object-contain" alt="" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-emerald-400 block">✓ Screenshot Loaded Cleanly</span>
                      <span className="text-[10px] text-zinc-500 block">Click or drag here to swap image template</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <span className="text-xs text-zinc-400 font-bold block">{uploading ? "Decoding File Arrays..." : "Choose Image or Drop Receipt File"}</span>
                    <span className="text-[10px] text-zinc-500 block">PNG, JPG formats accepted (Max size 2MB)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" disabled={!screenshotBase64 || uploading} className="w-full py-4 bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:bg-emerald-400 text-black font-black uppercase rounded-xl tracking-wider text-xs transition-all">
            {uploading ? "Processing Asset Package..." : "Place Verified Equipment Order"}
          </button>
        </form>

        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 sticky top-28">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Order Manifest Aggregate</h3>
          
          <div className="divide-y divide-zinc-850 space-y-2 max-h-[30vh] overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs pt-2">
                <div>
                  <h5 className="font-bold text-zinc-200">{item.product.name}</h5>
                  <span className="text-zinc-500 font-mono text-[11px]">x{item.quantity} @ {item.product.elitePrice}</span>
                </div>
                <span className="font-mono font-bold text-zinc-300">{((parseInt(item.product.elitePrice.replace(/[^0-9]/g, '')) || 0) * item.quantity).toLocaleString()} PKR</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-850 pt-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Gross Basket Value:</span>
              <span className="font-mono">{totalAmount.toLocaleString()} PKR</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Logistics Fee:</span>
              <span className="font-mono text-emerald-400 uppercase font-black text-[10px]">Free Allocation</span>
            </div>
            <div className="border-t border-zinc-850 pt-3 flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-zinc-300">Net Invoice:</span>
              <span className="text-lg font-black font-mono text-emerald-400">{totalAmount.toLocaleString()} PKR</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
