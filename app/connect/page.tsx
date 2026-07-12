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

const menuSections = [
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
      { name: "Caramel Iced Latte", price: "Rs 350", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Salted Caramel Iced Latte", price: "Rs 350", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Mocha Iced Latte", price: "Rs 350", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Spanish Iced Latte", price: "Rs 380", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Blueberry Iced Latte", price: "Rs 400", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Wild Berry Iced Latte", price: "Rs 400", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
      { name: "Elite Iced Latte", price: "Rs 400", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
    ],
  },
  {
    category: "Light Bites",
    emoji: "🍟",
    items: [
      { name: "Fries", price: "Rs 150", image: "https://images.unsplash.com/photo-1576107232684-1279f903166a?w=400&q=80" },
      { name: "Masala Fries", price: "Rs 170", image: "https://images.unsplash.com/photo-1576107232684-1279f903166a?w=400&q=80" },
      { name: "Nuggets (5 pcs)", price: "Rs 220", image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80" },
      { name: "Hot Shots (4 pcs)", price: "Rs 250", image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80" },
      { name: "Chicken Samosa", price: "Rs 70", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" },
      { name: "Malai Boti Samosa", price: "Rs 85", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" },
    ],
  },
  {
    category: "Cold Drinks",
    emoji: "🥤",
    items: [
      { name: "Gatorade", price: "Rs 170", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80" },
      { name: "Soft Drink 345 ml", price: "Rs 120", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80" },
      { name: "Soft Drink 500 ml", price: "Rs 170", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80" },
      { name: "Sting 500 ml", price: "Rs 170", image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80" },
      { name: "Mineral Water 500 ml", price: "Rs 100", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80" },
      { name: "Mineral Water 1.5 L", price: "Rs 200", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80" },
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Hot Drinks");

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
                      {section.items.map((item) => (
                        <div key={item.name} className="flex items-center gap-4 px-4 py-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-200 leading-tight">{item.name}</p>
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
