'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
const db = getDatabase(app);
const storage = getStorage(app);

interface CartItem {
  name: string;
  category: string;
  quantity: number;
  unitPrice: string;
  totalItemCost: number;
}

export default function CheckoutPage() {
  // Mock cart item payload matching your schema requirements
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { name: "Elite Pro Carbon Padel Racket", category: "Padel", quantity: 1, unitPrice: "38,500 PKR", totalItemCost: 38500 }
  ]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer / Advance Account');
  
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate order total sum cleanly
  const grossTotal = cartItems.reduce((acc, item) => acc + item.totalItemCost, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    let uploadedScreenshotUrl = "";

    try {
      // 1. If a screenshot exists, upload it directly to Firebase Storage bucket link
      if (screenshotFile) {
        const fileExtension = screenshotFile.name.split('.').pop();
        const uniqueFileName = `receipts/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const screenshotStorageRef = storageRef(storage, uniqueFileName);
        
        // Execute block upload
        const uploadSnapshot = await uploadBytes(screenshotStorageRef, screenshotFile);
        // Extract public structural view path URL
        uploadedScreenshotUrl = await getDownloadURL(uploadSnapshot.ref);
      }

      // 2. Build out order payload structural record matching your Admin interface signature schema
      const orderPayload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          address: fulfillmentType === 'PICKUP' ? 'Complex Pickup HQ' : customerAddress,
          city: customerCity,
        },
        fulfillmentType: fulfillmentType,
        items: cartItems,
        financials: {
          orderTotal: `${grossTotal.toLocaleString()} PKR`,
          paymentMethod: paymentMethod,
          advancePaid: `${grossTotal.toLocaleString()} PKR`, // Can adjust if partial
          remainingBalance: "0 PKR"
        },
        orderStatus: "PENDING_VERIFICATION",
        timestamp: Date.now(),
        // Pass the uploaded URL straight to your Realtime Database node
        paymentScreenshot: uploadedScreenshotUrl || null 
      };

      // 3. Persist order reference node to Database location
      const ordersDbRef = ref(db, 'store/orders');
      await push(ordersDbRef, orderPayload);

      alert("Order manifest dispatch successful! Your transfer receipt verification node has been linked.");
      
      // Reset form setup state fields cleanly
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerCity('');
      setScreenshotFile(null);
    } catch (error) {
      console.error("Order processing pipeline error execution breakdown:", error);
      alert("Failed to securely complete order handshakes. Review connection criteria details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-emerald-400">Secure Order Gateway</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-1">Elite Store Checkout Operations</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Full Name</label>
              <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all" placeholder="Muhammad Ali" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Phone Number</label>
              <input type="text" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all" placeholder="03001234567" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Fulfillment Channel</label>
              <select value={fulfillmentType} onChange={e => setFulfillmentType(e.target.value as 'DELIVERY' | 'PICKUP')} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all">
                <option value="DELIVERY">Home Delivery Logistics</option>
                <option value="PICKUP">Complex Pickup HQ</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">City Location Node</label>
              <input type="text" required value={customerCity} onChange={e => setCustomerCity(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all" placeholder="Lahore" />
            </div>
          </div>

          {fulfillmentType === 'DELIVERY' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Physical Route Mailing Address</label>
              <textarea rows={2} required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all resize-none" placeholder="Street layout details, housing segment sector allocation..." />
            </div>
          )}

          <div className="border-t border-zinc-800/80 pt-4 bg-zinc-950/40 p-4 border rounded-xl space-y-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Payment Authorization Payload</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">Please wire the total of <span className="text-emerald-400 font-mono font-bold">{grossTotal.toLocaleString()} PKR</span> to our designated structural banking clearing details, then upload your transaction summary image module clear copy below.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Attach Proof Payment Snapshot</label>
              <input 
                type="file" 
                accept="image/*" 
                required
                onChange={handleFileChange} 
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-zinc-800 file:text-emerald-400 hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Uploading Credentials & Dispatched Manifest..." : "Submit Completed Package Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
