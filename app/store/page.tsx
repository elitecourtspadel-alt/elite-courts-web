'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

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

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');
    onValue(productsRef, (snapshot) => {
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
            <img src={p.image} className="rounded-xl mb-4 w-full h-48 object-cover" alt={p.name} />
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-emerald-400 font-mono font-bold mb-6">{p.price}</p>
            <button 
              onClick={() => window.open(`https://wa.me/923084708858?text=Interested in ${p.name}`, '_blank')} 
              className="w-full bg-emerald-500 py-3 rounded-lg font-bold text-black"
            >
              Order on WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
