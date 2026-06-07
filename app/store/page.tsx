'use client';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp, getApps } from "firebase/app";

// (Keep your firebaseConfig same as before)

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const db = getDatabase(getApps()[0]);
    onValue(ref(db, 'store/products'), (snapshot) => {
      const data = snapshot.val();
      setProducts(data ? Object.values(data) : []);
    });
  }, []);

  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-4xl font-bold text-emerald-400 mb-8">Elite Store</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <img src={p.image} className="rounded-xl mb-4 w-full h-48 object-cover" />
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-emerald-400 font-mono font-bold mb-6">{p.price}</p>
            <button onClick={() => window.open(`https://wa.me/923XXXXXXXXXX?text=Interested in ${p.name}`)} className="w-full bg-emerald-500 py-3 rounded-lg font-bold text-black">Order on WhatsApp</button>
          </div>
        ))}
      </div>
    </div>
  );
}
