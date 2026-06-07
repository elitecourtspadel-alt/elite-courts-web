'use client';
import { useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, update } from "firebase/database";

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

export default function AdminPage() {
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    marketPrice: "", 
    elitePrice: "", 
    imagesInput: "" // Comma-separated field for input
  });

  const addProduct = () => {
    if (!newProduct.name || !newProduct.marketPrice || !newProduct.elitePrice || !newProduct.imagesInput) {
      alert("Please fill out all fields before uploading!");
      return;
    }

    // Convert the comma-separated string into a clean array of URLs
    const imagesArray = newProduct.imagesInput
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const db = getDatabase(app);
    const productRef = push(ref(db, 'store/products'));
    
    // Construct database payload
    const payload = {
      name: newProduct.name,
      marketPrice: newProduct.marketPrice,
      elitePrice: newProduct.elitePrice,
      images: imagesArray // Saved as a real database array
    };

    update(productRef, payload);
    
    alert("Product with multi-images uploaded successfully!");
    setNewProduct({ name: "", marketPrice: "", elitePrice: "", imagesInput: "" });
  };

  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-zinc-500 mb-8">Add premium stock with multiple layout views.</p>
        
        <div className="bg-zinc-900 p-6 rounded-2xl space-y-4 border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-bold text-emerald-400">Add New Product</h2>
          
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Product Name</label>
            <input 
              placeholder="e.g., Drop Shot Delta 2.0" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Original Market Price</label>
            <input 
              placeholder="e.g., Rs 10,500" 
              value={newProduct.marketPrice}
              onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Elite Discounted Price</label>
            <input 
              placeholder="e.g., Rs 9,500" 
              value={newProduct.elitePrice}
              onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Image URLs (Separate with commas)</label>
            <textarea 
              placeholder="https://link1.jpg, https://link2.jpg, https://link3.jpg" 
              value={newProduct.imagesInput}
              onChange={(e) => setNewProduct({...newProduct, imagesInput: e.target.value})} 
              rows={3}
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">Paste your ImgBB direct links separated by a comma.</span>
          </div>
          
          <button 
            onClick={addProduct} 
            className="w-full bg-emerald-500 py-3 font-bold text-black rounded-xl hover:bg-emerald-400 transition-colors mt-2 shadow-lg"
          >
            Upload to Store
          </button>
        </div>
      </div>
    </div>
  );
}
