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
    const db = getDatabase(app);
    const productRef = push(ref(db, 'store/products'));
    update(productRef, newProduct);
    alert("Product Added successfully!");
    // Clear form after submission
    setNewProduct({ name: "", marketPrice: "", elitePrice: "", image: "" });
  };

  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      <div className="bg-zinc-900 p-6 rounded-xl space-y-4 max-w-md border border-zinc-800">
        <h2 className="text-xl font-bold text-emerald-400">Add New Product</h2>
        
        <input 
          placeholder="Product Name" 
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
          className="w-full p-2 bg-zinc-800 rounded border border-zinc-700"
        />
        <input 
          placeholder="Original Market Price" 
          value={newProduct.marketPrice}
          onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} 
          className="w-full p-2 bg-zinc-800 rounded border border-zinc-700"
        />
        <input 
          placeholder="Elite Discounted Price" 
          value={newProduct.elitePrice}
          onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} 
          className="w-full p-2 bg-zinc-800 rounded border border-zinc-700"
        />
        <input 
          placeholder="Image URL (ImgBB Direct Link)" 
          value={newProduct.image}
          onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} 
          className="w-full p-2 bg-zinc-800 rounded border border-zinc-700"
        />
        
        <button 
          onClick={addProduct} 
          className="bg-emerald-500 w-full py-2 font-bold text-black rounded hover:bg-emerald-400 transition"
        >
          Upload to Store
        </button>
      </div>
    </div>
  );
}
