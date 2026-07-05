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
  Coffee,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";

const menuSections = [
  {
    category: "Hot Drinks",
    items: [
      { name: "Americano", price: "Rs 250" },
      { name: "Cappuccino", price: "Rs 300" },
      { name: "Latte", price: "Rs 320" },
      { name: "Green Tea", price: "Rs 200" },
    ],
  },
  {
    category: "Cold Drinks",
    items: [
      { name: "Cold Coffee", price: "Rs 350" },
      { name: "Energy Drink", price: "Rs 200" },
      { name: "Water Bottle", price: "Rs 100" },
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
  const [activeTab, setActiveTab] = useState<"links" | "menu">("links");
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
            onClick={() => setActiveTab("links")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "links"
                ? "bg-emerald-500 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Quick Links
          </button>
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
        </div>

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

        {/* ── MENU TAB ── */}
        {activeTab === "menu" && (
          <div className="space-y-3 text-left">
            <p className="text-xs text-zinc-500 text-center">Available at the Elite Courts café</p>
            {menuSections.map((section) => {
              const isOpen = expandedCategory === section.category;
              return (
                <div key={section.category} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  {/* Category header — tap to expand */}
                  <button
                    onClick={() => setExpandedCategory(isOpen ? null : section.category)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Coffee className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-sm text-zinc-100">{section.category}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{section.items.length} items</span>
                    </div>
                    {isOpen
                      ? <Minus className="h-4 w-4 text-zinc-500" />
                      : <Plus className="h-4 w-4 text-zinc-500" />
                    }
                  </button>

                  {/* Items */}
                  {isOpen && (
                    <div className="border-t border-zinc-800 divide-y divide-zinc-800/60">
                      {section.items.map((item) => (
                        <div key={item.name} className="flex items-center justify-between px-5 py-3">
                          <span className="text-sm text-zinc-300">{item.name}</span>
                          <span className="text-sm font-mono font-bold text-emerald-400">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
