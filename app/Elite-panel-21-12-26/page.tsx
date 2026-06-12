'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";

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

interface Product {
  id?: string;
  name: string;
  category: string;
  subcategory: string;
  materialFace?: string; // Glass Fiber, 3K, 12K, 24K Carbon Fiber
  marketPrice: string;
  elitePrice: string;
  images?: string[];
  image?: string;
  model3d?: string;
  description?: string;
  specs?: {
    weight?: string;
    balance?: string;
    thickness?: string;
    shape?: string;        
    characters?: string;   
    [key: string]: string | undefined;
  };
}

interface OrderItem {
  name: string;
  category: string;
  quantity: number;
  unitPrice: string;
  totalItemCost: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  items: OrderItem[];
  financials: {
    orderTotal: string; 
    paymentMethod: string;
    advancePaid?: string;     
    remainingBalance?: string; 
  };
  orderStatus: string;
  timestamp: number;
  paymentScreenshot?: string;
}

const CATEGORIES = ["Padel", "Pickleball", "Table Tennis", "Cricket", "Badminton"];
const SUBCATEGORIES = ["Rackets", "Balls", "Grips", "Bags", "Footwear", "Accessories"];
const MATERIALS = ["None / Standard", "Glass Fiber", "3K Carbon Fiber", "12K Carbon Fiber", "24K Carbon Fiber"];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS'>('PRODUCTS');
  
  // Filtering states for active management views
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('ALL');
  const [adminMaterialFilter, setAdminMaterialFilter] = useState<string>('ALL');
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'Padel', subcategory: 'Rackets', materialFace: 'None / Standard', 
    marketPrice: '', elitePrice: '', description: '', model3d: '', image: '', images: ['']
  });
  
  const [specWeight, setSpecWeight] = useState('');
  const [specBalance, setSpecBalance] = useState('');
  const [specThickness, setSpecThickness] = useState('');
  const [specShape, setSpecShape] = useState('');         
  const [specCharacters, setSpecCharacters] = useState(''); 
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    const db = getDatabase(app);
    
    const productsRef = ref(db, 'store/products');
    const unsubProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]) => ({
          ...(val as Product),
          id: key
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
    });

    const ordersRef = ref(db, 'store/orders');
    const unsubOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]) => ({
          ...(val as Order),
          id: key
        }));
        setOrders(list.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setOrders([]);
      }
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const triggerWhatsAppNotification = (order: Order, nextStatus: string) => {
    let cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
      cleanPhone = '92' + cleanPhone;
    }

    const itemsText = order.items.map(it => `• ${it.name} (x${it.quantity})`).join('\n');
    
    let statusMessage = '';
    if (nextStatus === 'PROCESSING') {
      statusMessage = `✅ *Your Elite Store Order has been Acknowledged!*\n\nHi ${order.customer.name},\nWe are currently processing your high-performance equipment payload.`;
    } else if (nextStatus === 'DISPATCHED_COMPOUND') {
      statusMessage = `🚚 *Your Elite Store Order is out for Dispatch!*\n\nHi ${order.customer.name},\nYour equipment has been securely packaged and forwarded to logistics handlers.`;
    } else if (nextStatus === 'PENDING_VERIFICATION') {
      statusMessage = `⚠️ *Elite Store Notice: Order Returned to Verification Status*\n\nHi ${order.customer.name},\nYour order package assignment has been placed back into evaluation phases.`;
    } else {
      statusMessage = `🏁 *Your Elite Store Order is Complete!*\n\nHi ${order.customer.name},\nYour transaction package has been successfully finalized. Thank you for choosing Elite Courts.`;
    }

    const totalAmountNum = parseInt(order.financials.orderTotal.replace(/[^0-9]/g, '')) || 0;
    let advanceNum = 0;
    let remainingNum = totalAmountNum;

    if (order.financials.advancePaid) {
      advanceNum = parseInt(order.financials.advancePaid.replace(/[^0-9]/g, '')) || 0;
      remainingNum = totalAmountNum - advanceNum;
    }

    let financialSummaryBlock = `• Total Amount: ${totalAmountNum.toLocaleString()} PKR`;
    if (advanceNum > 0 && advanceNum < totalAmountNum) {
      financialSummaryBlock += `\n• Advance Paid: ${advanceNum.toLocaleString()} PKR\n• Remaining Balance: ${remainingNum.toLocaleString()} PKR`;
    } else if (advanceNum === totalAmountNum) {
      financialSummaryBlock += `\n• Status: Fully Pre-Paid`;
    } else {
      financialSummaryBlock += `\n• Remaining Balance: ${totalAmountNum.toLocaleString()} PKR`;
    }

    const totalText = `\n\n📦 *Order Reference:* ${order.id}\n🛒 *Manifest Items:*\n${itemsText}\n\n💰 *Financial Summary:*\n${financialSummaryBlock}\n\n📍 *Fulfillment:* ${order.fulfillmentType === 'PICKUP' ? 'Complex Pickup HQ' : 'Home Delivery'}`;
    const closingText = `\n\nIf you have any instant queries, feel free to reply directly to this thread.`;

    const fullMessage = encodeURIComponent(`${statusMessage}${totalText}${closingText}`);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${fullMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleEditSelect = (product: Product) => {
    if (!product.id) return;
    setEditingProductId(product.id);
    
    const rawMarket = product.marketPrice ? product.marketPrice.replace(/[^0-9]/g, '') : '';
    const rawElite = product.elitePrice ? product.elitePrice.replace(/[^0-9]/g, '') : '';
    const initialImgUrl = Array.isArray(product.images) ? product.images[0] : (product.image || '');

    setNewProduct({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || 'Rackets',
      materialFace: product.materialFace || 'None / Standard',
      marketPrice: rawMarket,
      elitePrice: rawElite,
      description: product.description || '',
      model3d: product.model3d || '',
      image: initialImgUrl,
      images: [initialImgUrl]
    });

    setSpecWeight(product.specs?.weight || '');
    setSpecBalance(product.specs?.balance || '');
    setSpecThickness(product.specs?.thickness || '');
    setSpecShape(product.specs?.shape || '');               
    setSpecCharacters(product.specs?.characters || '');       
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setNewProduct({
      name: '', category: 'Padel', subcategory: 'Rackets', materialFace: 'None / Standard', 
      marketPrice: '', elitePrice: '', description: '', model3d: '', image: '', images: ['']
    });
    setSpecWeight('');
    setSpecBalance('');
    setSpecThickness('');
    setSpecShape('');
    setSpecCharacters('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDatabase(app);

    const enteredUrl = (newProduct.images?.[0] || newProduct.image || '').trim();
    const cleanImages = enteredUrl !== "" ? [enteredUrl] : [];

    const parsedMarket = parseInt(newProduct.marketPrice?.replace(/[^0-9]/g, '') || '0').toLocaleString();
    const parsedElite = parseInt(newProduct.elitePrice?.replace(/[^0-9]/g, '') || '0').toLocaleString();

    const productPayload: Product = {
      name: newProduct.name || 'Unnamed Equipment',
      category: newProduct.category || 'Padel',
      subcategory: newProduct.subcategory || 'Rackets',
      materialFace: newProduct.materialFace || 'None / Standard',
      marketPrice: `${parsedMarket} PKR`,
      elitePrice: `${parsedElite} PKR`,
      description: newProduct.description || '',
      model3d: newProduct.model3d || '',
      image: enteredUrl,
      images: cleanImages,
      specs: {
        weight: specWeight || undefined,
        balance: specBalance || undefined,
        thickness: specThickness || undefined,
        shape: specShape || undefined,            
        characters: specCharacters || undefined    
      }
    };

    try {
      if (editingProductId) {
        const targetRef = ref(db, `store/products/${editingProductId}`);
        await set(targetRef, productPayload);
        alert("Inventory dataset node synchronized successfully.");
      } else {
        const productsRef = ref(db, 'store/products');
        await push(productsRef, productPayload);
        alert("Inventory catalog node expanded cleanly.");
      }
      resetProductForm();
    } catch (err) {
      console.error("Database persistence operations failure:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you certain you want to purge this record payload?")) return;
    const db = getDatabase(app);
    const targetRef = ref(db, `store/products/${id}`);
    await remove(targetRef);
    if (editingProductId === id) {
      resetProductForm();
    }
  };

  const handleUpdateOrderStatus = async (order: Order) => {
    const nextStatusMap: Record<string, string> = {
      "PENDING_VERIFICATION": "PROCESSING",
      "PROCESSING": "DISPATCHED_COMPOUND",
      "DISPATCHED_COMPOUND": "COMPLETED_DELIVERY"
    };
    const targetNext = nextStatusMap[order.orderStatus];
    if (!targetNext) return;

    const db = getDatabase(app);
    const statusRef = ref(db, `store/orders/${order.id}/orderStatus`);
    
    try {
      await set(statusRef, targetNext);
      triggerWhatsAppNotification(order, targetNext);
    } catch (err) {
      console.error("Failed to cycle processing step forward:", err);
    }
  };

  const handleRevertOrderStatus = async (order: Order) => {
    const prevStatusMap: Record<string, string> = {
      "PROCESSING": "PENDING_VERIFICATION",
      "DISPATCHED_COMPOUND": "PROCESSING",
      "COMPLETED_DELIVERY": "DISPATCHED_COMPOUND"
    };
    const targetPrev = prevStatusMap[order.orderStatus];
    if (!targetPrev) return;

    if (!confirm(`Are you sure you want to revert this order status back to ${targetPrev}?`)) return;

    const db = getDatabase(app);
    const statusRef = ref(db, `store/orders/${order.id}/orderStatus`);
    
    try {
      await set(statusRef, targetPrev);
      triggerWhatsAppNotification(order, targetPrev);
    } catch (err) {
      console.error("Failed to cycle processing step backward:", err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`⚠️ CRITICAL COMMAND: Are you completely certain you want to cancel and delete Order #${orderId} from the master database? This action cannot be reversed.`)) {
      return;
    }
    const db = getDatabase(app);
    const orderRef = ref(db, `store/orders/${orderId}`);
    try {
      await remove(orderRef);
      alert("Order entry purged cleanly.");
    } catch (err) {
      console.error("Failed to eliminate targeted order payload record:", err);
    }
  };

  // Safe Multi-tier pipeline filter configuration logic
  const filteredProductsList = products.filter(product => {
    const matchesCategory = adminCategoryFilter === 'ALL' || product.category === adminCategoryFilter;
    const matchesMaterial = adminMaterialFilter === 'ALL' || product.materialFace === adminMaterialFilter;
    return matchesCategory && matchesMaterial;
  });

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Control Workspace Tab Controller */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">System Control Matrix</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-1">HQ Store Administration Panel</p>
          </div>
          
          <div className="flex bg-zinc-900 p-1 border border-zinc-800 rounded-xl">
            <button onClick={() => setActiveTab('PRODUCTS')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'PRODUCTS' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
              Inventory Base
            </button>
            <button onClick={() => setActiveTab('ORDERS')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'ORDERS' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'}`}>
              Incoming Orders ({orders.filter(o => o.orderStatus !== "COMPLETED_DELIVERY").length})
            </button>
          </div>
        </div>

        {activeTab === 'PRODUCTS' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form Module Context Block */}
            <form onSubmit={handleSaveProduct} className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                  {editingProductId ? "Modify Active Equipment Node" : "Append New Equipment Data"}
                </h3>
                {editingProductId && (
                  <button type="button" onClick={resetProductForm} className="text-[10px] font-black tracking-widest text-zinc-500 hover:text-zinc-300 uppercase">
                    Cancel Edit
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Equipment Variant Title</label>
                <input type="text" required value={newProduct.name} onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-medium" placeholder="e.g. Pro Air 12K Edition" />
              </div>

              {/* SEPARATED CATEGORY AND SUBCATEGORY SELECTORS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Primary Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all font-bold">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Equipment Subcategory</label>
                  <select value={newProduct.subcategory} onChange={e => setNewProduct(prev => ({ ...prev, subcategory: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all font-bold">
                    {SUBCATEGORIES.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              {/* MATERIAL SELECTOR COMPONENT BLOCK */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Material Composition Matrix</label>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  {MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setNewProduct(prev => ({ ...prev, materialFace: mat }))}
                      className={`py-2 px-3 border rounded-xl text-left text-[11px] font-bold transition-all ${
                        newProduct.materialFace === mat
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {newProduct.materialFace === mat ? '◈ ' : '◇ '} {mat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-3 border border-zinc-850 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Standard Market Rate</label>
                  <input type="text" required value={newProduct.marketPrice} onChange={e => setNewProduct(prev => ({ ...prev, marketPrice: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none transition-all font-mono" placeholder="e.g. 45,000" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">Discounted Elite Price</label>
                  <input type="text" required value={newProduct.elitePrice} onChange={e => setNewProduct(prev => ({ ...prev, elitePrice: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-none transition-all font-mono" placeholder="e.g. 38,500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Media Source URL (Image Primary)</label>
                <input type="text" required value={newProduct.images?.[0] || newProduct.image || ''} onChange={e => setNewProduct(prev => ({ ...prev, image: e.target.value, images: [e.target.value] }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-mono" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Engine GLTF Vector Resource Path</label>
                <input type="text" value={newProduct.model3d} onChange={e => setNewProduct(prev => ({ ...prev, model3d: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-mono" placeholder="/models/equipment.gltf" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Performance Description Manifest</label>
                <textarea rows={2} value={newProduct.description} onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all resize-none font-medium leading-relaxed" placeholder="Provide specification log layout summary..." />
              </div>

              <div className="border-t border-zinc-800 pt-3 space-y-3">
                <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400/80">Key Feature Metrics</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Total Weight</label>
                    <input type="text" value={specWeight} onChange={e => setSpecWeight(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 text-white" placeholder="365g" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Balance Matrix</label>
                    <input type="text" value={specBalance} onChange={e => setSpecBalance(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 text-white" placeholder="Medium" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Thickness</label>
                    <input type="text" value={specThickness} onChange={e => setSpecThickness(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 text-white" placeholder="38mm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Structural Shape</label>
                    <input type="text" value={specShape} onChange={e => setSpecShape(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 text-white" placeholder="Diamond" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Characteristics / Fit</label>
                    <input type="text" value={specCharacters} onChange={e => setSpecCharacters(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 text-white" placeholder="Power / Control" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-xl tracking-wider transition-all mt-2">
                {editingProductId ? "Synchronize System Changes" : "Save Node Entry"}
              </button>
            </form>

            {/* Live Interactive Column Pipeline Preview Dashboard Layout */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              
              {/* ADVANCED MULTI-LEVEL FILTER MATRIX COMPONENT */}
              <div className="space-y-3 border-b border-zinc-850 pb-4 font-mono">
                <div>
                  <span className="block text-[9px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Sort Category:</span>
                  <div className="flex flex-wrap gap-1">
                    {['ALL', ...CATEGORIES].map((cat) => (
                      <button key={cat} type="button" onClick={() => setAdminCategoryFilter(cat)} className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded border ${adminCategoryFilter === cat ? 'bg-zinc-800 text-emerald-400 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase text-zinc-500 tracking-wider mb-1">Sort Composition Matrix:</span>
                  <div className="flex flex-wrap gap-1">
                    {['ALL', ...MATERIALS.filter(m => m !== "None / Standard")].map((mat) => (
                      <button key={mat} type="button" onClick={() => setAdminMaterialFilter(mat === 'ALL' ? 'ALL' : mat)} className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider rounded border ${adminMaterialFilter === mat ? 'bg-zinc-800 text-emerald-400 border-zinc-700' : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300'}`}>
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Current Inventory Registry</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">{filteredProductsList.length} Nodes Rendered</span>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {filteredProductsList.length === 0 ? (
                  <div className="py-12 border border-dashed border-zinc-800 rounded-xl text-center font-mono text-zinc-600 text-xs uppercase tracking-wider">
                    No records found matching current configuration parameters.
                  </div>
                ) : (
                  filteredProductsList.map((product) => (
                    <div key={product.id} className="flex bg-zinc-950 border border-zinc-850 p-4 rounded-xl justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-850 rounded-lg flex items-center justify-center p-1">
                          <img src={Array.isArray(product.images) ? product.images[0] : product.image} className="max-h-full object-contain" alt="" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-200">{product.name}</h4>
                          <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 font-bold">{product.category} ({product.subcategory})</span>
                            {product.materialFace && product.materialFace !== 'None / Standard' && (
                              <span className="text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 font-mono font-bold">⌺ {product.materialFace}</span>
                            )}
                          </div>
                          
                          {(product.specs?.shape || product.specs?.characters) && (
                            <div className="flex gap-2 text-[9px] text-zinc-500 uppercase tracking-wider mt-1 font-semibold">
                              {product.specs.shape && <span>⬡ {product.specs.shape}</span>}
                              {product.specs.characters && <span>⚡ {product.specs.characters}</span>}
                            </div>
                          )}

                          <div className="flex gap-2 text-[11px] font-mono mt-1">
                            <span className="text-zinc-500 line-through">{product.marketPrice}</span>
                            <span className="text-emerald-400 font-bold">{product.elitePrice}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSelect(product)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-wider hover:text-emerald-400 transition-colors">Edit</button>
                        <button onClick={() => product.id && handleDeleteProduct(product.id)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-wider hover:text-red-400 transition-colors">Purge</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Live Orders Pipeline Matrix Block Module Layout Map */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Live Orders Pipeline Matrix</h3>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {orders.map((order) => (
                <div key={order.id} className="bg-zinc-950 border border-zinc-850 p-6 rounded-xl space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">ID: {order.id}</span>
                      <h4 className="text-sm font-black text-zinc-200">{order.customer.name} ({order.customer.city})</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.orderStatus === 'COMPLETED_DELIVERY' ? 'bg-zinc-900 text-zinc-500' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {order.orderStatus}
                      </span>
                      {order.orderStatus !== 'PENDING_VERIFICATION' && (
                        <button onClick={() => handleRevertOrderStatus(order)} className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all border border-zinc-800">
                          🔀 Revert / Undo
                        </button>
                      )}
                      {order.orderStatus !== 'COMPLETED_DELIVERY' && (
                        <button onClick={() => handleUpdateOrderStatus(order)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider rounded-lg transition-all">
                          Cycle Next Status →
                        </button>
                      )}
                      <button onClick={() => handleCancelOrder(order.id)} className="px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-400 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all border border-red-900/40">
                        🗑️ Cancel Order
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Logistics Matrix</span>
                      <p className="text-zinc-300"><span className="text-zinc-500">Phone:</span> {order.customer.phone}</p>
                      <p className="text-zinc-300 bg-zinc-900/50 border border-zinc-850/80 p-2 rounded-lg mt-1 whitespace-pre-wrap leading-relaxed">
                        {order.customer.address}
                      </p>
                      <p className="text-zinc-400 font-bold pt-1 uppercase text-[10px]">Fulfillment: {order.fulfillmentType}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Manifest Items Bundle</span>
                      <div className="space-y-1">
                        {order.items?.map((it, idx) => (
                          <p key={idx} className="text-zinc-300 font-medium">
                            • {it.name} <span className="text-zinc-500 font-mono">x{it.quantity}</span> @ <span className="text-emerald-400 font-mono">{it.unitPrice}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Financial State Summary</span>
                      <p className="text-zinc-300 font-mono"><span className="text-zinc-500">Gross Total:</span> {order.financials.orderTotal}</p>
                      <p className="text-zinc-300 font-mono mt-0.5"><span className="text-zinc-500">Channel Method:</span> {order.financials.paymentMethod}</p>
                    </div>
                    <div className="border-l border-zinc-900 pl-0 md:pl-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Client Transfer Verification</span>
                      {order.paymentScreenshot ? (
                        <div className="space-y-2">
                          <div className="relative group w-32 h-36 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden cursor-zoom-in">
                            <img src={order.paymentScreenshot} alt="Receipt Proof Payload" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                          <button type="button" onClick={() => window.open(order.paymentScreenshot, '_blank')} className="text-[10px] font-bold text-emerald-400 hover:underline block">Open attachment ↗</button>
                        </div>
                      ) : (
                        <div className="bg-zinc-900/30 border border-zinc-850/60 rounded-xl p-3 text-center text-zinc-600 font-mono text-[10px]">No screenshot payload uploaded.</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
