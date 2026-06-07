import { getDatabase, ref, update, push } from "firebase/database";

// ... inside your admin component
const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });

const addProduct = () => {
  const db = getDatabase();
  const productRef = push(ref(db, 'store/products'));
  update(productRef, newProduct);
  alert("Product Added!");
};

return (
  <div className="bg-zinc-900 p-6 rounded-xl space-y-4">
    <h2 className="text-xl font-bold text-emerald-400">Add New Product</h2>
    <input placeholder="Product Name" onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
    <input placeholder="Price (e.g. PKR 15,000)" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
    <input placeholder="Image URL (ImgBB Direct Link)" onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-2 bg-zinc-800 rounded"/>
    <button onClick={addProduct} className="bg-emerald-500 w-full py-2 font-bold rounded">Upload to Store</button>
  </div>
)
