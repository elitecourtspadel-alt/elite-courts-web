'use client';
import { useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, update } from "firebase/database";

// ... (keep your existing firebaseConfig and app initialization)

export default function AdminPage() {
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    marketPrice: "", // New field
    elitePrice: "",  // New field
    image: "" 
  });

  const addProduct = () => {
    const db = getDatabase(app);
    const productRef = push(ref(db, 'store/products'));
    update(productRef, newProduct);
    alert("Product Added successfully!");
    setNewProduct({ name: "", marketPrice: "", elitePrice: "", image: "" });
  };

  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="bg-zinc-900 p-6 rounded-xl space-y-4 max-w-md border border-zinc-800">
        <input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
        <input placeholder="Original Market Price (e.g. Rs 10,500)" value={newProduct.marketPrice} onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
        <input placeholder="Elite Price (e.g. Rs 9,500)" value={newProduct.elitePrice} onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
        <input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
        <button onClick={addProduct} className="bg-emerald-500 w-full py-2 font-bold text-black rounded">Upload to Store</button>
      </div>
    </div>
  );
}
