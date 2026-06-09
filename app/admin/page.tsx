'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, set, onValue } from "firebase/database";

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
  const [dbProducts, setDbProducts] = useState<Record<string, any>>({});
  const [selectedProductKey, setSelectedProductKey] = useState<string>("NEW_ASSET");
  
  const [newProduct, setNewProduct] = useState<ProductForm>({ 
    name: "", marketPrice: "", elitePrice: "", imagesInput: "",
    category: "Padel", subcategory: "Rackets", description: "",
    specShape: "", specFace: "", specFrame: "", specCore: "",
    specWeight: "", specBalance: "", specBracket: "", specControl: "", specPower: ""
  });

  useEffect(() => {
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      setDbProducts(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  const isHardware = (sub: string) => ["Rackets", "Paddles", "Bats"].includes(sub);
  const isBall = (sub: string) => sub === "Balls" || sub === "Shuttlecocks";

  const handleProductSelection = (key: string) => {
    setSelectedProductKey(key);
    if (key === "NEW_ASSET") {
      setNewProduct({ 
        name: "", marketPrice: "", elitePrice: "", imagesInput: "",
        category: "Padel", subcategory: "Rackets", description: "",
        specShape: "", specFace: "", specFrame: "", specCore: "",
        specWeight: "", specBalance: "", specBracket: "", specControl: "", specPower: ""
      });
      return;
    }

    const target = dbProducts[key];
    const specSource = target.specs || {};
    const imgsStr = Array.isArray(target.images) ? target.images.join(', ') : (target.image || "");
    const isHW = isHardware(target.subcategory || "Rackets");

    setNewProduct({
      name: target.name || "",
      marketPrice: target.marketPrice || "",
      elitePrice: target.elitePrice || "",
      imagesInput: imgsStr,
      category: target.category || "Padel",
      subcategory: target.subcategory || "Rackets",
      description: target.description || "",
      specShape: isHW ? (specSource["Shape"] || "") : (specSource["Material"] || ""),
      specFace: isHW ? (specSource["Face Material"] || "") : (specSource["Dimensions"] || ""),
      specFrame: isHW ? (specSource["Frame Composition"] || "") : (specSource["Color"] || ""),
      specCore: isHW ? (specSource["Core Density"] || "") : (specSource["Compatibility"] || ""),
      specWeight: isHW ? (specSource["Weight Parameters"] || "") : (specSource["Thickness"] || ""),
      specBalance: isHW ? (specSource["Balance Profile"] || "") : (specSource["Pack Size"] || ""),
      specBracket: isHW ? (specSource["Player Bracket"] || "") : (specSource["Feature Note"] || ""),
      specControl: isHW ? (specSource["Control Rating"] || "") : (specSource["Durability"] || ""),
      specPower: isHW ? (specSource["Power Rating"] || "") : (specSource["Adhesion Level"] || "")
    });
  };

  const handleCategoryChange = (cat: string) => {
    setNewProduct({
      ...newProduct,
      category: cat,
      subcategory: SUBCATEGORIES[cat] ? SUBCATEGORIES[cat][0] : ""
    });
  };

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.marketPrice || !newProduct.elitePrice || !newProduct.imagesInput) {
      alert("Missing Required Fields!");
      return;
    }

    try {
      setIsDeploying(true);
      const imagesArray = newProduct.imagesInput.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
      const db = getDatabase(app);
      const productRef = selectedProductKey === "NEW_ASSET" ? push(ref(db, 'store/products')) : ref(db, `store/products/${selectedProductKey}`);
      
      const specsObject: Record<string, string> = {};
      const isHW = isHardware(newProduct.subcategory);
      const isBallItem = isBall(newProduct.subcategory);

      if (isHW) {
        if (newProduct.specShape) specsObject["Shape"] = newProduct.specShape;
        if (newProduct.specFace) specsObject["Face Material"] = newProduct.specFace;
        if (newProduct.specFrame) specsObject["Frame Composition"] = newProduct.specFrame;
        if (newProduct.specCore) specsObject["Core Density"] = newProduct.specCore;
        if (newProduct.specWeight) specsObject["Weight Parameters"] = newProduct.specWeight;
        if (newProduct.specBalance) specsObject["Balance Profile"] = newProduct.specBalance;
        if (newProduct.specBracket) specsObject["Player Bracket"] = newProduct.specBracket;
        if (newProduct.specControl) specsObject["Control Rating"] = newProduct.specControl;
        if (newProduct.specPower) specsObject["Power Rating"] = newProduct.specPower;
      } else {
        if (newProduct.specShape) specsObject["Material"] = newProduct.specShape;
        if (!isBallItem && newProduct.specFace) specsObject["Dimensions"] = newProduct.specFace;
        if (newProduct.specFrame) specsObject["Color"] = newProduct.specFrame;
        if (newProduct.specCore) specsObject["Compatibility"] = newProduct.specCore;
        if (!isBallItem && newProduct.specWeight) specsObject["Thickness"] = newProduct.specWeight;
        if (newProduct.specBalance) specsObject["Pack Size"] = newProduct.specBalance;
        if (newProduct.specBracket) specsObject["Feature Note"] = newProduct.specBracket;
        if (newProduct.specControl) specsObject["Durability"] = newProduct.specControl;
        if (newProduct.specPower) specsObject["Adhesion Level"] = newProduct.specPower;
      }

      await set(productRef, {
        name: newProduct.name,
        marketPrice: newProduct.marketPrice,
        elitePrice: newProduct.elitePrice,
        images: imagesArray,
        category: newProduct.category,
        subcategory: newProduct.subcategory,
        description: newProduct.description,
        specs: specsObject
      });
      
      alert("Success! Configuration synchronized safely.");
      setSelectedProductKey("NEW_ASSET");
      setNewProduct({ 
        name: "", marketPrice: "", elitePrice: "", imagesInput: "",
        category: "Padel", subcategory: "Rackets", description: "",
        specShape: "", specFace: "", specFrame: "", specCore: "",
        specWeight: "", specBalance: "", specBracket: "", specControl: "", specPower: ""
      });
    } catch (error: any) {
      alert(`Operation Failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const isHWMode = isHardware(newProduct.subcategory);
  const isBallMode = isBall(newProduct.subcategory);

  return (
    <div className="p-6 md:p-12 bg-zinc-950 min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <header className="mb-8 border-b border-zinc-900 pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight">Elite Matrix Inventory Control</h1>
        </header>
        
        <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl space-y-5 border border-zinc-800">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs uppercase font-black tracking-widest text-emerald-400 block mb-1.5">Console Execution Target</label>
            <select value={selectedProductKey} onChange={(e) => handleProductSelection(e.target.value)} className="w-full p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-100 focus:border-emerald-500">
              <option value="NEW_ASSET">✚ Create & Deploy Fresh Product Profile</option>
              {Object.keys(dbProducts).map((key) => (
                <option key={key} value={key}>📝 Modify: {dbProducts[key].name || `Unnamed Asset (${key})`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Product Name / Model Label</label>
            <input placeholder="e.g., Drop Shot Protective Tape Black" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm focus:border-emerald-500 text-white" />
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
              <input placeholder="Rs 2,500" value={newProduct.marketPrice} onChange={(e) => setNewProduct({...newProduct, marketPrice: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Elite Store Price</label>
              <input placeholder="Rs 1,800" value={newProduct.elitePrice} onChange={(e) => setNewProduct({...newProduct, elitePrice: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Image URLs (Comma separated links)</label>
            <input placeholder="https://i.ibb.co/abc/image.jpg" value={newProduct.imagesInput} onChange={(e) => setNewProduct({...newProduct, imagesInput: e.target.value})} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm" />
          </div>

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 block mb-1">Product Description</label>
            <textarea placeholder="Product description narratives..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows={3} className="w-full p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-sm resize-none" />
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isHWMode ? "Advanced Specifications Matrix Fields" : isBallMode ? "Ball Specifications" : "Accessory Specification Fields"}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input placeholder={isHWMode ? "Racket Shape" : "Material"} value={newProduct.specShape} onChange={(e) => setNewProduct({...newProduct, specShape: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              {!isBallMode && (
                <input placeholder={isHWMode ? "Face Material" : "Dimensions"} value={newProduct.specFace} onChange={(e) => setNewProduct({...newProduct, specFace: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              )}
              <input placeholder={isHWMode ? "Frame Material" : "Color/Design"} value={newProduct.specFrame} onChange={(e) => setNewProduct({...newProduct, specFrame: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder={isHWMode ? "Core Density" : "Compatibility"} value={newProduct.specCore} onChange={(e) => setNewProduct({...newProduct, specCore: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              {!isBallMode && (
                <input placeholder={isHWMode ? "Weight Parameters" : "Thickness"} value={newProduct.specWeight} onChange={(e) => setNewProduct({...newProduct, specWeight: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              )}
              <input placeholder={isHWMode ? "Balance Profile" : "Pack Size / Qty"} value={newProduct.specBalance} onChange={(e) => setNewProduct({...newProduct, specBalance: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pt-2">
              {isHWMode ? "Performance & Ratings" : "Performance Traits"}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder={isHWMode ? "Bracket" : "Key Feature"} value={newProduct.specBracket} onChange={(e) => setNewProduct({...newProduct, specBracket: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white col-span-1" />
              <input placeholder={isHWMode ? "Control" : "Durability"} value={newProduct.specControl} onChange={(e) => setNewProduct({...newProduct, specControl: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
              <input placeholder={isHWMode ? "Power" : "Adhesion"} value={newProduct.specPower} onChange={(e) => setNewProduct({...newProduct, specPower: e.target.value})} className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white" />
            </div>
          </div>

          <button onClick={saveProduct} disabled={isDeploying} className={`w-full py-3 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isDeploying ? 'bg-zinc-600 cursor-wait animate-pulse' : 'bg-emerald-500 hover:bg-emerald-400'}`}>
            {isDeploying ? "Processing Database Synchronization..." : selectedProductKey === "NEW_ASSET" ? "Deploy Catalog Assets" : "Update Catalog Assets"}
          </button>
        </div>
      </div>
    </div>
  );
}
