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
  };
  orderStatus: string;
  timestamp: number;
}

const CATEGORIES = ["Padel", "Pickleball", "Table Tennis", "Cricket", "Badminton"];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS'>('PRODUCTS');
  
  // Product Form Management State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'Padel', subcategory: '', marketPrice: '', elitePrice: '',
    description: '', model3d: '', image: '', images: ['']
  });
  const [specWeight, setSpecWeight] = useState('');
  const [specBalance, setSpecBalance] = useState('');
  const [specThickness, setSpecThickness] = useState('');

  useEffect(() => {
    const db = getDatabase(app);
    
    // Listen to Products Node
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

    // Listen to Orders Node
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

  // Secure WhatsApp Notification Parser Matrix
  const triggerWhatsAppNotification = (order: Order, nextStatus: string) => {
    // Sanitize the phone number string format cleanly
    let cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '92' + cleanPhone.substring(1);
    }
    if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) {
      cleanPhone = '92' + cleanPhone;
    }

    // Build the structural manifest layout text
    const itemsText = order.items.map(it => `• ${it.name} (x${it.quantity})`).join('\n');
    
    let statusMessage = '';
    if (nextStatus === 'PROCESSING') {
      statusMessage = `✅ *Your Elite Store Order has been Acknowledged!*\n\nHi ${order.customer.name},\nWe are currently processing your high-performance equipment payload.`;
    } else if (nextStatus === 'DISPATCHED_COMPOUND') {
      statusMessage = `🚚 *Your Elite Store Order is out for Dispatch!*\n\nHi ${order.customer.name},\nYour equipment has been securely packaged and forwarded to logistics handlers.`;
    } else {
      statusMessage = `🏁 *Your Elite Store Order is Complete!*\n\nHi ${order.customer.name},\nYour transaction package has been successfully finalized. Thank you for choosing Elite Courts.`;
    }

    const totalText = `\n\n📦 *Order Reference:* ${order.id}\n🛒 *Manifest Items:*\n${itemsText}\n\n💰 *Total Payable:* ${order.financials.orderTotal}\n📍 *Fulfillment:* ${order.fulfillmentType === 'PICKUP' ? 'Complex Pickup HQ' : 'Home Delivery'}`;
    const closingText = `\n\nIf you have any instant queries, feel free to reply directly to this thread.`;

    const fullMessage = encodeURIComponent(`${statusMessage}${totalText}${closingText}`);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${fullMessage}`;
    
    // Launch secure child thread window cleanly
    window.open(whatsappUrl, '_blank');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDatabase(app);
    const productsRef = ref(db, 'store/products');

    const cleanImages = (newProduct.images || [])
      .map(url => url.trim())
      .filter(url => url !== "");

    const productPayload: Product = {
      name: newProduct.name || 'Unnamed Equipment',
      category: newProduct.category || 'Padel',
      subcategory: newProduct.subcategory || 'Standard',
      marketPrice: newProduct.marketPrice?.endsWith(' PKR') ? newProduct.marketPrice : `${newProduct.marketPrice} PKR`,
      elitePrice: newProduct.elitePrice?.endsWith(' PKR') ? newProduct.elitePrice : `${newProduct.elitePrice} PKR`,
      description: newProduct.description || '',
      model3d: newProduct.model3d || '',
      image: cleanImages[0] || '',
      images: cleanImages,
      specs: {
        weight: specWeight || undefined,
        balance: specBalance || undefined,
        thickness: specThickness || undefined
      }
    };

    try {
      await push(productsRef, productPayload);
      setNewProduct({
        name: '', category: 'Padel', subcategory: '', marketPrice: '', elitePrice: '',
        description: '', model3d: '', image: '', images: ['']
      });
      setSpecWeight('');
      setSpecBalance('');
      setSpecThickness('');
      alert("Inventory catalog node expanded cleanly.");
    } catch (err) {
      console.error("Database structural push failure:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you certain you want to purge this record payload?")) return;
    const db = getDatabase(app);
    const targetRef = ref(db, `store/products/${id}`);
    await remove(targetRef);
  };

  const handleUpdateOrderStatus = async (order: Order) => {
    const nextStatusMap: Record<string, string> = {
      "PENDING_VERIFICATION": "PROCESSING",
      "PROCESSING": "DISPATCHED_COMPOUND",
      "DISPATCHED_COMPOUND": "COMPLETED_DELIVERY"
    };
    const targetNext = nextStatusMap[order.orderStatus] || "COMPLETED_DELIVERY";
    const db = getDatabase(app);
    const statusRef = ref(db, `store/orders/${order.id}/orderStatus`);
    
    try {
      await set(statusRef, targetNext);
      // Automatically generate up-to-date message layout to buyer
      triggerWhatsAppNotification(order, targetNext);
    } catch (err) {
      console.error("Failed to cycle processing step:", err);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Console Elements */}
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
            
            {/* New Asset Form Layout */}
            <form onSubmit={handleCreateProduct} className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">Append New Equipment Data</h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Equipment Variant Title</label>
                <input type="text" required value={newProduct.name} onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="e.g. Elite Pro Carbon Padel Racket" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Primary Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Subcategory Node</label>
                  <input type="text" value={newProduct.subcategory} onChange={e => setNewProduct(prev => ({ ...prev, subcategory: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="e.g. Bats / Rackets" />
                </div>
              </div>

              {/* Secure Dual Pricing Form Framework */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-3 border border-zinc-850 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Standard Market Rate</label>
                  <input type="text" required value={newProduct.marketPrice} onChange={e => setNewProduct(prev => ({ ...prev, marketPrice: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none transition-all" placeholder="e.g. 45,000" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">Discounted Elite Price</label>
                  <input type="text" required value={newProduct.elitePrice} onChange={e => setNewProduct(prev => ({ ...prev, elitePrice: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-none transition-all" placeholder="e.g. 38,500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Media Source URL (Image Primary)</label>
                <input type="text" required value={newProduct.images?.[0] || ''} onChange={e => setNewProduct(prev => ({ ...prev, images: [e.target.value] }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Engine GLTF Vector Resource Path (3D Model)</label>
                <input type="text" value={newProduct.model3d} onChange={e => setNewProduct(prev => ({ ...prev, model3d: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all" placeholder="/models/equipment.gltf" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Performance Description Manifest</label>
                <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all resize-none" placeholder="Provide specification log layout summary..." />
              </div>

              {/* Performance Specifications Configuration */}
              <div className="border-t border-zinc-800 pt-3 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Total Weight</label>
                  <input type="text" value={specWeight} onChange={e => setSpecWeight(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500" placeholder="365g" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Balance Point</label>
                  <input type="text" value={specBalance} onChange={e => setSpecBalance(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500" placeholder="265mm" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Thickness</label>
                  <input type="text" value={specThickness} onChange={e => setSpecThickness(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500" placeholder="38mm" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all mt-2">
                Inject into Active Database
              </button>
            </form>

            {/* Catalog Grid View */}
            <div className="lg:col-span-7 space-y-3 max-h-[75vh] overflow-y-auto pr-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Current Production Registry ({products.length})</h3>
              {products.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">No storage indices populated currently.</div>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-950 rounded-lg border border-zinc-800 p-1 flex items-center justify-center">
                        <img src={Array.isArray(p.images) ? p.images[0] : p.image} className="max-h-full max-w-full object-contain" alt="" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">{p.category}</span>
                          <span className="text-[11px] text-zinc-500 line-through">{p.marketPrice}</span>
                          <span className="text-[11px] text-emerald-400 font-extrabold">{p.elitePrice}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => p.id && handleDeleteProduct(p.id)} className="text-xs font-bold uppercase text-red-500 hover:text-red-400 px-3 py-1.5 transition-colors">
                      Purge
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          
          /* Orders Inbound Processing Management */
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Live Client Transaction Streams</h3>
            {orders.length === 0 ? (
              <div className="p-12 border border-dashed border-zinc-800 rounded-2xl text-center text-xs text-zinc-500">No client ledger requests received via backend router.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 tracking-tight block">{ord.id}</span>
                          <span className="text-xs font-bold text-zinc-200 mt-0.5 block">{ord.customer.name}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          ord.orderStatus === 'PENDING_VERIFICATION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          ord.orderStatus === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {ord.orderStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-zinc-400">
                        <p><span className="text-zinc-500">Phone:</span> {ord.customer.phone}</p>
                        <p><span className="text-zinc-500">Logistics Type:</span> {ord.fulfillmentType === 'PICKUP' ? '🏢 Complex Collection' : '🚚 Home Dispatch'}</p>
                        <p><span className="text-zinc-500">Destination:</span> {ord.customer.address}, {ord.customer.city}</p>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Manifest Items</span>
                        <div className="divide-y divide-zinc-900 space-y-1">
                          {ord.items?.map((it, idx) => (
                            <div key={idx} className="text-xs flex justify-between pt-1">
                              <span className="text-zinc-300 font-medium">{it.name} <span className="text-zinc-500 font-mono">x{it.quantity}</span></span>
                              <span className="font-mono text-zinc-400">{(it.totalItemCost || 0).toLocaleString()} PKR</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-850 pt-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-medium block">Total Payable Invoice</span>
                        <span className="text-base font-black text-emerald-400 font-mono">{ord.financials.orderTotal}</span>
                      </div>

                      {ord.orderStatus !== 'COMPLETED_DELIVERY' && (
                        <button onClick={() => handleUpdateOrderStatus(ord)} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all">
                          {ord.orderStatus === 'PENDING_VERIFICATION' ? 'Acknowledge Order' :
                           ord.orderStatus === 'PROCESSING' ? 'Dispatch Payload' : 'Finalize Delivery'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
