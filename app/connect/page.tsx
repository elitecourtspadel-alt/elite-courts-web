'use client';
import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import {
  Instagram,
  Star,
  Youtube,
  Trophy,
  UtensilsCrossed,
  ShoppingBag,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";

type MenuItem = {
  name: string;
  price: string;
  image: string;
  fallback?: string;
  description?: string;
};

type MenuSection = {
  category: string;
  emoji: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    category: "Hot Drinks",
    emoji: "☕",
    items: [
      { name: "Karak Chai", price: "Rs 150", image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&q=80" },
      { name: "Cardamom Chai", price: "Rs 150", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80" },
      { name: "Instant Coffee", price: "Rs 250", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80" },
      { name: "Caramel Latte", price: "Rs 350", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80" },
      { name: "Mocha", price: "Rs 350", image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&q=80" },
    ],
  },
  {
    category: "Iced Coffee",
    emoji: "🧋",
    items: [
      { name: "Vanilla Bean Iced Latte", price: "Rs 350", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80" },
      { name: "Classic Iced Latte", price: "Rs 300", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Caramel Iced Latte", price: "Rs 350", image: "/images/sports/Caramellatte.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Salted Caramel Iced Latte", price: "Rs 350", image: "/images/sports/salted_caramel_latte.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Mocha Iced Latte", price: "Rs 350", image: "/images/sports/iced-mocha-latte.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Spanish Iced Latte", price: "Rs 380", image: "/images/sports/iced-spanish-latte.webp", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Blueberry Iced Latte", price: "Rs 400", image: "/images/sports/Blueberry_Iced_Latte.webp", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Wild Berry Iced Latte", price: "Rs 400", image: "/images/sports/Wild_berry_latte.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Elite Iced Latte", price: "Rs 400", image: "/images/sports/Elite_Iced_Latte.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
    ],
  },
  {
    category: "Mocktails",
    emoji: "🍹",
    items: [
      { name: "Blue Lagoon Smash", price: "Rs 350", image: "/images/sports/blue_lagoon.jpeg", fallback: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80" },
      { name: "Lemonade / Mint Lemonade Cooler", price: "Rs 300", image: "/images/sports/lemondae.jpeg", fallback: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400&q=80" },
      { name: "Passion Fruit Sixer", price: "Rs 350", image: "/images/sports/Passion-Fruit.webp", fallback: "https://images.unsplash.com/photo-1607446045875-a59b83d27f14?w=400&q=80" },
      { name: "Elite Tropical Refresher", price: "Rs 400", image: "/images/sports/elite_mocktail.webp", fallback: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80" },
      { name: "Blueberry Crush", price: "Rs 350", image: "/images/sports/blueberry_mocktail.jpeg", fallback: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80" },
      { name: "Wild Berry Override", price: "Rs 350", image: "/images/sports/wild-berry-mocktail.webp", fallback: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80" },
      { name: "Peach Iced Tea Lob", price: "Rs 350", image: "/images/sports/peach_iced_tea.jpeg", fallback: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80" },
      { name: "Raspberry Punch", price: "Rs 350", image: "/images/sports/raspberry-mocktail.jpg", fallback: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80" },
    ],
  },
  {
    category: "Burgers",
    emoji: "🍔",
    items: [
      { name: "Chicken Pattie", price: "Rs 500", description: "Double pattie chicken burger with special sauces and a slice of cheese", image: "/images/sports/chicken_pattie_burger copy.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Crispy Chicken", price: "Rs 650", description: "Crispy chicken burger filled with signature sauces and a slice of cheese", image: "/images/sports/crispy_burger.webp", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Chicken Skewer", price: "Rs 550", description: "Grilled chicken skewer burger with veggies and our signature sauce", image: "/images/sports/chicken_skewer_burger.jpeg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
    ],
  },
  {
    category: "Snacks",
    emoji: "🍟",
    items: [
      { name: "Crispy Chicken", price: "Rs 350", description: "Zinger crispy golden chicken piece", image: "/images/sports/crispy_chicken.png", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Loaded Fries", price: "Rs 450", description: "Crispy golden fries topped with seasoned chicken, melted cheese, and our signature house sauces", image: "/images/sports/loaded_fries.jpeg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Panini Sandwich", price: "Rs 550", description: "Grilled chicken with melted cheese and signature sauces", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80" },
      { name: "Club Sandwich", price: "Rs 650", description: "Grilled chicken with veggies and our signature sauce", image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&q=80" },
      { name: "Chicken Nuggets", price: "Rs 300", description: "Crispy golden chicken nuggets served with signature sauce", image: "/images/sports/chicken-nuggets.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
    ],
  },
  {
    category: "Light Bites",
    emoji: "🥨",
    items: [
      { name: "Fries", price: "Rs 170", description: "Crispy golden fries", image: "/images/sports/fries.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Masala Fries", price: "Rs 170", description: "Crispy golden fries tossed in special masala", image: "/images/sports/fries.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Chicken Samosa", price: "Rs 50", description: "Crispy chicken juicy samosa", image: "/images/sports/chicken_samosa.jpeg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
    ],
  },
  {
    category: "Elite Pizza",
    emoji: "🍕",
    items: [
      { name: "Elite Pizza (Small)", price: "Rs 800", description: "Signature Elite Pizza with grilled chicken, melted cheese and signature sauce", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" },
      { name: "Elite Pizza (Medium)", price: "Rs 950", description: "Signature Elite Pizza with grilled chicken, melted cheese and signature sauce", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" },
      { name: "Elite Pizza (Large)", price: "Rs 1050", description: "Signature Elite Pizza with grilled chicken, melted cheese and signature sauce", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" },
    ],
  },
  {
    category: "Cold Drinks",
    emoji: "🥤",
    items: [
      { name: "Gatorade", price: "Rs 170", image: "/images/sports/gatorade.jpeg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Soft Drink 345 ml", price: "Rs 120", image: "/images/sports/pepsi_345.webp", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Soft Drink 500 ml", price: "Rs 170", image: "/images/sports/pepsi_500ml.webp", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Sting 500 ml", price: "Rs 170", image: "/images/sports/sting.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Mineral Water 500 ml", price: "Rs 100", image: "/images/sports/water_500ml.webp", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
      { name: "Mineral Water 1.5 L", price: "Rs 200", image: "/images/sports/water_1.5.jpg", fallback: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800" },
    ],
  },
];

const links = [
  {
    title: "Leave us a 5-Star Review",
    description: "Support us on Google Maps",
    url: "https://g.page/r/CYWJjkcweOHjEBM/review",
    icon: Star,
    color: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20",
    iconColor: "text-amber-400",
  },
  {
    title: "Elite Store",
    description: "Shop padel, pickleball & sports gear",
    url: "/store",
    icon: ShoppingBag,
    color: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Follow our Instagram",
    description: "Match highlights, community clips & updates",
    url: "https://www.instagram.com/elite.courts/",
    icon: Instagram,
    color: "border-pink-500/30 hover:border-pink-400 bg-pink-950/20",
    iconColor: "text-pink-400",
  },
  {
    title: "Watch on YouTube",
    description: "Court action, tutorials & event streams",
    url: "https://www.youtube.com/@Elite.courts",
    icon: Youtube,
    color: "border-red-500/30 hover:border-red-400 bg-red-950/20",
    iconColor: "text-red-400",
  },
  {
    title: "Elite Tournaments",
    description: "Live brackets, scores & standings",
    url: "/tournaments",
    icon: Trophy,
    color: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20",
    iconColor: "text-cyan-400",
  },
];

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState<"menu" | "links">("menu");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 sm:px-6">
      <Container className="max-w-md mx-auto text-center space-y-6">

        {/* Logo Header */}
        <div className="space-y-3">
          <div className="h-20 w-20 bg-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xl border border-emerald-400/20">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Elite Courts</h1>
          <p className="text-zinc-400 text-sm">Your premium sports destination in Lahore</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "menu"
                ? "bg-emerald-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            Café Menu
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "links"
                ? "bg-emerald-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Quick Links
          </button>
        </div>

        {/* ── MENU TAB ── */}
        {activeTab === "menu" && (
          <div className="space-y-3 text-left">
            <p className="text-xs text-zinc-500 text-center">Available at the Elite Courts café</p>
            {menuSections.map((section) => {
              const isOpen = expandedCategory === section.category;
              return (
                <div key={section.category} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isOpen ? null : section.category)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.emoji}</span>
                      <span className="font-bold text-sm text-zinc-100">{section.category}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{section.items.length} items</span>
                    </div>
                    {isOpen
                      ? <Minus className="h-4 w-4 text-zinc-500 shrink-0" />
                      : <Plus className="h-4 w-4 text-zinc-500 shrink-0" />
                    }
                  </button>

                  {isOpen && (
                    <div className="border-t border-zinc-800 divide-y divide-zinc-800/60">
                      {section.category === "Burgers" && (
                        <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-900/40 flex items-center gap-2">
                          <span className="text-base">🍔</span>
                          <p className="text-xs text-amber-300 font-semibold">
                            Make it a Meal — add fries + drink for <span className="text-amber-200">+Rs 250</span>
                          </p>
                        </div>
                      )}
                      {section.items.map((item: MenuItem) => (
                        <div key={item.name} className="flex items-center gap-4 px-4 py-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (item.fallback) {
                                  (e.currentTarget as HTMLImageElement).src = item.fallback;
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-200 leading-tight">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{item.description}</p>
                            )}
                          </div>
                          <span className="text-sm font-mono font-bold text-emerald-400 shrink-0">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}


          </div>
        )}

        {/* ── LINKS TAB ── */}
        {activeTab === "links" && (
          <div className="space-y-3 text-left">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.title}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`flex items-center p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 shadow-sm group ${link.color}`}
                >
                  <div className="p-2 rounded-lg bg-zinc-900 group-hover:scale-105 transition-transform">
                    <Icon className={`h-5 w-5 ${link.iconColor}`} />
                  </div>
                  <div className="ml-4 flex-1 text-left">
                    <h2 className="font-semibold text-sm text-zinc-100">{link.title}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">{link.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-zinc-600 pt-2">
          © {new Date().getFullYear()} Elite Courts. All rights reserved.
        </p>
      </Container>
    </div>
  );
}
