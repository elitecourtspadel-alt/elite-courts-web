'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AizasyD4bPvYwRjOAGfiwoVPbG_4hj6QEbgdc9A",
  authDomain: "elitecourtsapp.firebaseapp.com",
  projectId: "elitecourtsapp",
  storageBucket: "gs://elitecourtsapp.firebasestorage.app",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d",
  databaseURL: "https://elitecourtsapp-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const storage = getStorage(app);

interface CartItem {
  name: string;
  category: string;
  quantity: number;
  unitPrice: string;
  totalItemCost: number;
}

type CheckoutChannel = 'DELIVERY_FULL' | 'DELIVERY_COD' | 'PICKUP_STORE';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  
  const [checkoutChannel, setCheckoutChannel] = useState<CheckoutChannel>('DELIVERY_FULL');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe client-side local storage loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('elite_store_active_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          
          const normalizedItems = parsedCart.map((item: any) => {
            if (item.product) {
              // Strip all commas, letters, spaces to ensure pure integer extraction
              const cleanPriceString = item.product.elitePrice.replace(/[^0-9]/g, '');
              const priceNum = parseInt(cleanPriceString, 10) || 0;
              
              return {
                name: item.product.name,
                category: item.product.category,
                quantity: item.quantity || 1,
                unitPrice: item.product.elitePrice,
                totalItemCost: priceNum * (item.quantity || 1)
              };
            }
            return item;
          });

          setCartItems(normalizedItems);
        } catch (e) {
          console.error("Cart hydration execution breakdown error:", e);
        }
      }
    }
  }, []);

  // Compute values safely with structural fallback limits
  const grossTotal = cartItems.reduce((acc, item) => acc + (item.totalItemCost || 0), 0);
  const isFullPayment = checkoutChannel === 'DELIVERY_FULL';
  const requiredPaymentAmount = isFullPayment ? grossTotal : Math.round(grossTotal * 0.20);
  const remainingBalanceAmount = Math.max(0, grossTotal - requiredPaymentAmount);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (cartItems.length === 0) {
      alert("Your active cart node allocation is empty.");
      return;
    }

    if (!screenshotFile) {
      alert("Please upload your transfer screenshot payload validation copy first.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // 1. Process block upload to Storage Bucket reference locations cleanly
      const fileExtension = screenshotFile.name.split('.').pop() || 'jpg';
      const uniqueFileName = `receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const screenshotStorageRef = storageRef(storage, uniqueFileName);
      
      const uploadSnapshot = await uploadBytes(screenshotStorageRef, screenshotFile);
      const uploadedScreenshotUrl = await getDownloadURL(uploadSnapshot.ref);

      // 2. Format explicit fulfillment definitions to database strings
      const databaseFulfillment = checkoutChannel === 'PICKUP_STORE' ? 'PICKUP' : 'DELIVERY';
      
      let databasePaymentMethodText = "";
      if (checkoutChannel === 'DELIVERY_FULL') databasePaymentMethodText = "Bank Transfer (Full Pre-Paid)";
      if (checkoutChannel === 'DELIVERY_COD') databasePaymentMethodText = "Cash on Delivery (20% Advance Paid)";
      if (checkoutChannel === 'PICKUP_STORE') databasePaymentMethodText = "Complex Store Pickup (20% Advance Paid)";

      const orderPayload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          address: checkoutChannel === 'PICKUP_STORE' ? 'Complex Pickup HQ' : customerAddress,
          city: customerCity,
        },
        fulfillmentType: databaseFulfillment,
        items: cartItems,
        financials: {
          orderTotal: `${grossTotal.toLocaleString()} PKR`,
          paymentMethod: databasePaymentMethodText,
          advancePaid: `${requiredPaymentAmount.toLocaleString()} PKR`,
          remainingBalance: `${remainingBalanceAmount.toLocaleString()} PKR`
        },
        orderStatus: "PENDING_VERIFICATION",
        timestamp: Date.now(),
        paymentScreenshot: uploadedScreenshotUrl
      };

      // 3. Write data frame explicitly to real-time sync target
      const ordersDbRef = ref(db, 'store/orders');
      await push(ordersDbRef, orderPayload);

      alert("Order package metadata synced successfully!");
      
      // Reset variables smoothly on structural completion
      localStorage.removeItem('elite_store_active_cart');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerCity('');
      setScreenshotFile(null);
      setCartItems([]);

    } catch (error: any) {
      console.error("Critical breakdown details inside deployment pipeline:", error);
      // Give a clean, detailed prompt response if safety rules or connection failure interrupts execution
      alert(`Order handshakes transmission failure: ${error?.message || "Check storage bucket connection rules layouts."}`);
    } finally {
      // Ensure the button unlocked state always executes no matter what happens
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-emerald-400">Secure Order Gateway</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-1">Elite Store Checkout Operations</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Full Name</label>
              <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-medium" placeholder="Muhammad Shahrukh" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Phone Number</label>
              <input type="text" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-mono" placeholder="03001234567" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Order Logistics & Payment Channel</label>
              <select 
                value={checkoutChannel} 
                onChange={e => setCheckoutChannel(e.target.value as CheckoutChannel)} 
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all text-emerald-400"
              >
                <option value="DELIVERY_FULL">Home Delivery (Full Pre-Payment Plan)</option>
                <option value="DELIVERY_COD">Home Delivery (Cash on Delivery - 20% Advance)</option>
                <option value="PICKUP_STORE">Elite Courts Complex HQ (Self Pickup - 20% Advance)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">City Location Node</label>
              <input type="text" required value={customerCity} onChange={e => setCustomerCity(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all font-medium" placeholder="Lahore" />
            </div>
          </div>

          {checkoutChannel !== 'PICKUP_STORE' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Physical Route Delivery Address</label>
              <textarea rows={2} required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all resize-none font-medium leading-relaxed" placeholder="Provide clear street coordinates, home number layout and area description allocations..." />
            </div>
          )}

          <div className="border border-zinc-800 bg-zinc-950/60 p-4 rounded-xl space-y-3 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block border-b border-zinc-900 pb-1.5">Financial Summary Breakdown</span>
            <div className="grid grid-cols-3 text-center text-xs gap-2">
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-850 rounded-lg">
                <span className="text-[9px] font-sans font-bold text-zinc-500 uppercase block mb-0.5">Gross Total</span>
                <span className="text-white font-bold">{grossTotal.toLocaleString()} PKR</span>
              </div>
              <div className="bg-emerald-950/20 p-2.5 border border-emerald-900/30 rounded-lg">
                <span className="text-[9px] font-sans font-bold text-emerald-500/80 uppercase block mb-0.5">Required Deposit ({isFullPayment ? "100%" : "20%"})</span>
                <span className="text-emerald-400 font-extrabold">{requiredPaymentAmount.toLocaleString()} PKR</span>
              </div>
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-850 rounded-lg">
                <span className="text-[9px] font-sans font-bold text-zinc-500 uppercase block mb-0.5">Remaining Due</span>
                <span className="text-zinc-400 font-bold">{remainingBalanceAmount.toLocaleString()} PKR</span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 pt-4 bg-zinc-950/40 p-4 rounded-xl space-y-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                {isFullPayment ? "🧾 Full Amount Deposit Verification" : "🛡️ 20% Security Hold Authorization"}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-relaxed">
                To commit this order tracking reference payload to our processing queue, transfer exactly <span className="text-emerald-400 font-mono font-bold">{requiredPaymentAmount.toLocaleString()} PKR</span> to our checking account ledger, then submit a screenshot confirmation matrix below.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Attach Proof Picture ({isFullPayment ? "100% Total Cost" : "20% Advance Commitment"})
              </label>
              <input 
                type="file" 
                key={screenshotFile ? screenshotFile.name : 'empty-file'}
                accept="image/*" 
                required
                onChange={handleFileChange} 
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-zinc-800 file:text-emerald-400 hover:file:bg-zinc-700 cursor-pointer transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/20"
          >
            {isSubmitting ? "Uploading Receipt & Dispatching Payload Logs..." : "Submit Completed Package Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
