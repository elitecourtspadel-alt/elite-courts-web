export default function StorePage() {
  return (
    <div className="p-10 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-4xl font-bold text-emerald-400 mb-8">Elite Store</h1>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Product Card Example */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <img src="your-racket-image-link.jpg" className="rounded-xl mb-4" />
          <h3 className="text-lg font-bold">Pro Padel Racket</h3>
          <p className="text-zinc-400 text-sm mb-4">High-performance carbon fiber.</p>
          <button className="w-full bg-emerald-500 py-2 rounded-lg font-bold">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
