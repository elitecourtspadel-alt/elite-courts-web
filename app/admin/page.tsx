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
    image: "" 
  });

  const addProduct = () => {
    if (!newProduct.name || !newProduct.marketPrice || !newProduct.elitePrice || !newProduct.image) {
      alert("Please fill out all fields before uploading!");
      return;
    }

    const db = getDatabase(app);
    const productRef = push(ref(db, 'store/products'));
    update(productRef, newProduct);
    
    alert("Product Added successfully!");
    // Clear form fields
    setNewProduct({ name: "", marketPrice: "", elitePrice: "", image: "" });
  };

  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-zinc-100">Admin Dashboard</h1>
        <p className="text-zinc-500 mb-8">Manage inventory and updates for Elite Store.</p>
        
        <div className="bg-zinc-900 p-6 rounded-2xl space-y-4 border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-bold text-emerald-400 mb-2">Add New Product</h2>
          
          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Product Name</label>
            <input 
              placeholder="e.g., Joola Perseus Pickleball Paddle" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Original Market Price</label>
            <input 
              placeholder="e.g., Rs 65,000" 
              value={newProduct.marketPrice}
              onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Elite Discounted Price</label>
            <input 
              placeholder="e.g., Rs 58,000" 
              value={newProduct.elitePrice}
              onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1 font-medium">Image URL (ImgBB Direct Link)</label>
            <input 
              placeholder="https://i.ibb.co/your-image.jpg" 
              value={newProduct.image}
              onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} 
              className="w-full p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <button 
            onClick={addProduct} 
            className="w-full bg-emerald-500 py-3 font-bold text-black rounded-xl hover:bg-emerald-400 transition-colors mt-4 shadow-lg shadow-emerald-500/10"
          >
            Upload to Store
          </button>
        </div>
      </div>
    </div>
  );
}
