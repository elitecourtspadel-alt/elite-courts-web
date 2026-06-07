'use client';
import { useState, useEffect } from 'react';

interface ProductProps {
  product: {
    name: string;
    marketPrice: string;
    elitePrice: string;
    images: string[];
    description?: string;
    specs?: { [key: string]: string };
  };
  onBack: () => void;
}

export default function ProductDetailView({ product, onBack }: ProductProps) {
  const imageList = Array.isArray(product.images) ? product.images : [];
  const [activeImg, setActiveImg] = useState(imageList[0] || '/placeholder.jpg');

  useEffect(() => {
    if (imageList.length > 0) setActiveImg(imageList[0]);
  }, [product.images]);

  // Default premium specifications if none are provided by database fields yet
  const productSpecs = product.specs || {
    "Frame Material": "3K Carbon Fiber",
    "Core": "EVA Pro High Density",
    "Balance": "Medium-High",
    "Weight": "360g - 375g",
    "Game Level": "Advanced / Professional"
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium transition-colors text-sm"
        >
          ❮ Back to Elite Store
        </button>

        {/* Main Product Two-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* LEFT COLUMN: Gallery Container (Spans 5 Columns on large screens) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Display Window */}
            <div className="w-full h-[350px] md:h-[450px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-2xl relative overflow-hidden">
              <img 
                src={activeImg} 
                className="max-h-full max-w-full object-contain transition-all duration-300 transform hover:scale-105" 
                alt={product.name} 
              />
              <span className="absolute top-4 right-4 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                Sale
              </span>
            </div>

            {/* Thumbnail Navigation Strip */}
            {imageList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {imageList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(imgUrl)}
                    className={`w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border-2 flex-shrink-0 p-1 transition-all ${
                      activeImg === imgUrl ? 'border-emerald-500 scale-95 shadow-md shadow-emerald-500/10' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} className="w-full h-full object-contain" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Buying Details (Spans 7 Columns on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Premium Equipment</span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-100 tracking-tight mt-1 mb-3">{product.name}</h1>
              
              {/* Review Star Stand-In Row */}
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                ★★★★★ <span className="text-zinc-500 text-xs ml-2">(Verified Elite Gear)</span>
              </div>
            </div>

            {/* Anchored Pricing Presentation */}
            <div className="bg-zinc-900/50 border border-zinc-900 p-5 rounded-2xl flex items-center gap-4">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Regular Market Price</p>
                <span className="text-zinc-500 line-through text-lg font-semibold">{product.marketPrice}</span>
              </div>
              <div className="border-l border-zinc-800 h-10 mx-2" />
              <div>
                <p className="text-xs text-emerald-400/70 font-medium mb-1">Our Elite Price</p>
                <span className="text-emerald-400 font-black text-3xl md:text-4xl tracking-tight">{product.elitePrice}</span>
              </div>
            </div>

            {/* Description Paragraph Container */}
            <div className="space-y-2 text-zinc-400 text-sm md:text-base leading-relaxed">
              <h3 className="font-bold text-zinc-200 text-base">Product Overview</h3>
              <p>
                {product.description || "Engineered for high-performance competitors. This racket balances exceptional structural integrity with precision engineering to give you absolute control over every baseline drive and quick volley at the net."}
              </p>
            </div>

            {/* Action Direct Whatsapp Order Button */}
            <button 
              onClick={() => window.open(`https://wa.me/923084708858?text=Salam!%20I%20want%20to%20order%20the%20${encodeURIComponent(product.name)}.%20Please%20confirm%20availability.`, '_blank')} 
              className="w-full md:w-auto md:px-12 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 text-center block"
            >
              Order via WhatsApp
            </button>

            {/* Technical Specifications Sheet Matrix */}
            <div className="border-t border-zinc-900 pt-6 mt-8">
              <h3 className="font-bold text-zinc-200 text-base mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(productSpecs).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-zinc-900/30 border border-zinc-900/60 p-3 rounded-xl text-sm">
                    <span className="text-zinc-500 font-medium">{key}</span>
                    <span className="text-zinc-200 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
