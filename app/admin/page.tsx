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

const CATEGORIES = ["Padel", "Pickleball", "Table Tennis"];
const SUBCATEGORIES: { [key: string]: string[] } = {
  "Padel": ["Rackets", "Balls", "Padel Grips", "Bags", "Accessories"],
  "Pickleball": ["Paddles", "Balls", "Grips", "Bags", "Accessories"],
  "Table Tennis": ["Bats", "Balls", "Rubbers", "Accessories"]
};

export default function AdminPage() {
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    marketPrice: "", 
    elitePrice: "", 
    imagesInput: "",
    category: "Padel",
    subcategory: "Rackets",
    description: "",
    // Explicit spec variables to pass structured data to Firebase cleanly
    specMaterial: "",
    specWeight: "",
    specBalance: "",
    specLevel: ""
  });

  const handleCategoryChange = (cat: string) => {
    setNewProduct({
      ...newProduct,
      category: cat,
      subcategory: SUBCATEGORIES[cat][0]
    });
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.marketPrice || !newProduct.elitePrice || !newProduct.imagesInput || !newProduct.description) {
      alert("Please fill out all fundamental details and descriptions before saving!");
      return;
    }

    const imagesArray = newProduct.imagesInput
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const db = getDatabase(app);
    const productRef = push(ref(db, 'store/products'));
    
    // Constructing a structured tech specs payload matching your storefront layout matrix
    const specsObject = {
      "Material / Composition": newProduct.specMaterial || "Premium Carbon Fiber Blend",
      "Average Weight": newProduct.specWeight || "Standard Weight Configuration",
      "Balance Allocation": newProduct.specBalance || "Balanced Optimization",
      "Intended Skill Level": newProduct.specLevel || "Intermediate / Professional"
    };

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

    update(productRef, payload);
    alert("Premium stock profile written to Firebase ledger successfully!");
    
    // Clear all fields down cleanly
    setNewProduct({ 
      name: "", 
      marketPrice: "", 
      elitePrice: "", 
      imagesInput: "",
      category: "Padel",
      subcategory: "Rackets",
      description: "",
      specMaterial: "",
      specWeight: "",
      specBalance: "",
      specLevel: ""
    });
  };

  return (
    <div className="p-6 md:p-12 bg-zinc-950 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <header className="mb-8 border-b border-zinc-900 pb-4 w-full">
          <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-100">Elite Inventory Engine</h1>
          <p className="text-zinc-500 text-sm mt-1">Populate specialized high-fidelity gear assets directly onto the live web catalogs.</p>
        </header>
        
        <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl space-y-6 border border-zinc-800 shadow-2xl">
          <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-wide border-b border-zinc-800 pb-3">New Product Configuration</h2>
          
          {/* Row 1: Title */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Product Name / Model Label</label>
            <input 
              placeholder="e.g., Drop Shot Delta 2.0 Padel Racket 3K" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
              className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Row 2: Category System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Primary Sport Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 text-zinc-200"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Specific Subcategory Equipment Type</label>
              <select
                value={newProduct.subcategory}
                onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})}
                className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 text-zinc-200"
              >
                {SUBCATEGORIES[newProduct.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Pricing Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Standard Market Value Strike</label>
              <input 
                placeholder="e.g., Rs 45,500" 
                value={newProduct.marketPrice}
                onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} 
                className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Elite Store Member Offer Price</label>
              <input 
                placeholder="e.g., Rs 39,900" 
                value={newProduct.elitePrice}
                onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} 
                className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Row 4: Multi-Image Stack URLs */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">Asset Links (Comma-Separated Grid List)</label>
            <textarea 
              placeholder="https://i.ibb.co/pic1.jpg, https://i.ibb.co/pic2.jpg, https://i.ibb.co/pic3.jpg" 
              value={newProduct.imagesInput}
              onChange={(e) => setNewProduct({...newProduct, imagesInput: e.target.value})} 
              rows={3}
              className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 resize-none transition-colors"
            />
            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Paste consecutive absolute links cleanly broken up strictly with a single comma character.</span>
          </div>

          {/* Row 5: Detailed Rich Text Marketing Description */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">E-Commerce Product Overview Narrative</label>
            <textarea 
              placeholder="Provide a compelling overview detailing structural integrity, power control balance ratios, and structural touch performance profiles..." 
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
              rows={4}
              className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500 resize-none transition-colors"
            />
          </div>

          {/* Row 6: Detailed Structural Tech Specs Component Matrix */}
          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Technical Attribute Matrix (Optional spec overrides)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Face/Frame Material</label>
                <input 
                  placeholder="e.g., 3K Carbon Fiber Face" 
                  value={newProduct.specMaterial}
                  onChange={(e) => setNewProduct({...newProduct, specMaterial: e.target.value})}
                  className="w-full p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Weight Parameters</label>
                <input 
                  placeholder="e.g., 360g - 375g (+/- 10g)" 
                  value={newProduct.specWeight}
                  onChange={(e) => setNewProduct({...newProduct, specWeight: e.target.value})}
                  className="w-full p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Sweet-spot Balance Profile</label>
                <input 
                  placeholder="e.g., Medium-High Over-balance" 
                  value={newProduct.specBalance}
                  onChange={(e) => setNewProduct({...newProduct, specBalance: e.target.value})}
                  className="w-full p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Target Skill Bracket</label>
                <input 
                  placeholder="e.g., Competitive / Advanced Pro" 
                  value={newProduct.specLevel}
                  onChange={(e) => setNewProduct({...newProduct, specLevel: e.target.value})}
                  className="w-full p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submission Execution */}
          <button 
            onClick={addProduct} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 py-3.5 font-black uppercase text-xs tracking-widest text-black rounded-xl transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.99] mt-2"
          >
            Deploy Product Stream
          </button>
        </div>
      </div>
    </div>
  );
}
