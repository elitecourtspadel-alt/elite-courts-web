'use client';
import { useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

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

interface ProductForm {
  name: string;
  marketPrice: string;
  elitePrice: string;
  imagesInput: string;
  category: string;
  subcategory: string;
  description: string;
  specShape: string;
  specFace: string;
  specFrame: string;
  specCore: string;
  specWeight: string;
  specBalance: string;
  specBracket: string;
  specControl: string;
  specPower: string;
}

const CATEGORIES: string[] = ["Padel", "Pickleball", "Table Tennis", "Cricket", "Badminton"];
const SUBCATEGORIES: Record<string, string[]> = {
  "Padel": ["Rackets", "Balls", "Padel Grips", "Bags", "Accessories"],
  "Pickleball": ["Paddles", "Balls", "Grips", "Bags", "Accessories"],
  "Table Tennis": ["Bats", "Balls", "Rubbers", "Accessories"],
  "Cricket": ["Bats", "Balls", "Protective Gear", "Bags", "Accessories"],
  "Badminton": ["Rackets", "Shuttlecocks", "Grips", "Bags", "Accessories"]
};

export default function AdminPage() {
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<ProductForm>({ 
    name: "", marketPrice: "", elitePrice: "", imagesInput: "",
    category: "Padel", subcategory: "Rackets", description: "",
    specShape: "", specFace: "", specFrame: "", specCore: "",
    specWeight: "", specBalance: "", specBracket: "", specControl: "", specPower: ""
  });

  const handleCategoryChange = (cat: string) => {
    setNewProduct({
      ...newProduct,
      category: cat,
      subcategory: SUBCATEGORIES[cat] ? SUBCATEGORIES[cat][0] : ""
    });
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.marketPrice || !newProduct.elitePrice || !newProduct.imagesInput) {
      alert("Missing Required Fields! Please verify you filled out the Product Name, Prices, and Image URLs at the top of the form.");
      return;
    }

    try {
      setIsDeploying(true);

      const imagesArray = newProduct.imagesInput
        .split(',')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);

      const db = getDatabase(app);
      const productRef = push(ref(db, 'store/products'));
      
      // CLEAN STRINGS FOR FIREBASE COMPLIANCE (No forward slashes allowed)
      const specsObject: Record<string, string> = {};
      if (newProduct.specShape) specsObject["Shape"] = newProduct.specShape;
      if (newProduct.specFace) specsObject["Face Material"] = newProduct.specFace;
      if (newProduct.specFrame) specsObject["Frame Composition"] = newProduct.specFrame;
      if (newProduct.specCore) specsObject["Core Density"] = newProduct.specCore;
      if (newProduct.specWeight) specsObject["Weight Parameters"] = newProduct.specWeight;
      if (newProduct.specBalance) specsObject["Balance Profile"] = newProduct.specBalance;
      if (newProduct.specBracket) specsObject["Player Bracket"] = newProduct.specBracket;
      if (newProduct.specControl) specsObject["Control Rating"] = newProduct.specControl;
      if (newProduct.specPower) specsObject["Power Rating"] = newProduct.specPower;

      const payload = {
        name: newProduct.name,
        marketPrice: newProduct.marketPrice,
        elitePrice: newProduct.elitePrice,
        images: imagesArray,
        category: newProduct.category,
        subcategory: newProduct.subcategory,
        description: newProduct.description,
        specs: specsObject
      };

      await set(productRef, payload);
      
      alert("Success! Premium matrix configurations deployed smoothly to Realtime Database.");
      
      setNewProduct({ 
        name: "", marketPrice: "", elitePrice: "", imagesInput: "",
        category: "Padel", subcategory: "Rackets", description: "",
        specShape: "", specFace: "", specFrame: "", specCore: "",
        specWeight: "", specBalance: "", specBracket: "", specControl: "", specPower: ""
      });

    } catch (error: any) {
      console.error("Database Write Rejection Details:", error);
      alert(`Deployment Failed! Critical Error: ${error.message || "Unknown write error occurred. Check Firebase rules."}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="p-6 md:p-12 bg-zinc-950 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <header className="mb-8 border-b border-zinc-900 pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight">Elite Matrix Inventory Control</h1>
        </header>
        
        <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl space-y-5 border border-zinc-800">
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Product Name / Model Label</label>
            <input placeholder="e.g., Drop Shot Delta 2.0 3K" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:border-emerald-500 text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Category</label>
              <select value={newProduct.category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm text-zinc-200">
                {CATEGORIES.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Subcategory</label>
              <select value={newProduct.subcategory} onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm text-zinc-200">
                {(SUBCATEGORIES[newProduct.category] || []).map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Market Price</label>
              <input placeholder="Rs 21,000" value={newProduct.marketPrice} onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Elite Store Price</label>
              <input placeholder="Rs 15,000" value={newProduct.elitePrice} onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Image URLs (Comma separated ImgBB Links)</label>
            <input placeholder="https://i.ibb.co/abc/image.jpg" value={newProduct.imagesInput} onChange={(e) => setNewProduct({...newProduct, imagesInput: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm" />
          </div>

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Product Description</label>
            <textarea placeholder="Product description narratives..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows={3} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm resize-none" />
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Advanced Specifications Matrix Fields</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Racket Shape (Teardrop / Oversized Diamond)" value={newProduct.specShape} onChange={(e) => setNewProduct({...newProduct, specShape: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder="Face Material (3K Carbon Fiber Face)" value={newProduct.specFace} onChange={(e) => setNewProduct({...newProduct, specFace: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder="Frame Material (Twin Tubular Carbon)" value={newProduct.specFrame} onChange={(e) => setNewProduct({...newProduct, specFrame: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder="Core Core / Density (EVA Pro Medium)" value={newProduct.specCore} onChange={(e) => setNewProduct({...newProduct, specCore: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder="Weight Parameters (360g - 375g)" value={newProduct.specWeight} onChange={(e) => setNewProduct({...newProduct, specWeight: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder="Balance Profile (Mid-High Allocation)" value={newProduct.specBalance} onChange={(e) => setNewProduct({...newProduct, specBalance: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pt-2">Performance & Player Bracket Ratings</h3>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Bracket (Advanced / Intensive)" value={newProduct.specBracket} onChange={(e) => setNewProduct({...newProduct, specBracket: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white col-span-1" />
              <input placeholder="Control (e.g. 8.5 / 10)" value={newProduct.specControl} onChange={(e) => setNewProduct({...newProduct, specControl: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder="Power (e.g. 9.5 / 10)" value={newProduct.specPower} onChange={(e) => setNewProduct({...newProduct, specPower: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
            </div>
          </div>

          <button 
            onClick={addProduct} 
            disabled={isDeploying}
            className={`w-full py-3 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              isDeploying ? 'bg-zinc-600 cursor-wait animate-pulse' : 'bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            {isDeploying ? "Processing Deployment..." : "Deploy Catalog Assets"}
          </button>
        </div>
      </div>
    </div>
  );
}
