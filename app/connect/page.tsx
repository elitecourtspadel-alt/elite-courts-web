'use client';
import Link from "next/link";
import { Container } from "@/components/layout/container";
import {
  Instagram,
  Star,
  Globe,
  Youtube,
  Trophy,
  UtensilsCrossed,
  Coffee,
  ChevronRight,
} from "lucide-react";

export default function ConnectPage() {

  const menuItems = [
    { name: "Americano", price: "Rs 250" },
    { name: "Cappuccino", price: "Rs 300" },
    { name: "Latte", price: "Rs 320" },
    { name: "Cold Coffee", price: "Rs 350" },
    { name: "Green Tea", price: "Rs 200" },
    { name: "Energy Drink", price: "Rs 200" },
    { name: "Water Bottle", price: "Rs 100" },
  ];

  const links = [
    {
      title: "Leave us a 5-Star Review",
      description: "Support us on Google Maps",
      url: "https://g.page/r/CYWJjkcweOHjEBM/review",
      icon: Star,
      color: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20",
    },
    {
      title: "Elite Tournaments",
      description: "Check ongoing match scores & standings",
      url: "/tournaments",
      icon: Trophy,
      color: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20",
    },
    {
      title: "Follow our Instagram",
      description: "Match highlights, community clips & updates",
      url: "https://www.instagram.com/elite.courts/",
      icon: Instagram,
      color: "border-pink-500/30 hover:border-pink-400 bg-pink-950/20",
    },
    {
      title: "Watch on YouTube",
      description: "Court action, tutorials & event streams",
      url: "https://www.youtube.com/@Elite.courts",
      icon: Youtube,
      color: "border-red-500/30 hover:border-red-400 bg-red-950/20",
    },
    {
      title: "Official Website",
      description: "Explore our packages, memberships & amenities",
      url: "/",
      icon: Globe,
      color: "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 sm:px-6">
      <Container className="max-w-md mx-auto text-center space-y-8">

        {/* Profile / Logo Header */}
        <div className="space-y-3">
          <div className="h-20 w-20 bg-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xl border border-emerald-400/20">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Elite Courts</h1>
          <p className="text-zinc-400 text-sm">Your premium sports destination in Lahore</p>
        </div>

        {/* ── MENU SECTION ── */}
        <div className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Menu header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
            <div className="p-2 rounded-lg bg-zinc-800">
              <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-100">Café Menu</h2>
              <p className="text-xs text-zinc-500">Available at the facility</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="divide-y divide-zinc-800/60">
            {menuItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Coffee className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                  <span className="text-sm text-zinc-200">{item.name}</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LINKS ── */}
        <div className="space-y-3">
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
                <div className="p-2 rounded-lg bg-zinc-900 text-zinc-100 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-4 text-left flex-1">
                  <h2 className="font-semibold text-sm text-zinc-100">{link.title}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{link.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-xs text-zinc-600 pt-4">
          © {new Date().getFullYear()} Elite Courts. All rights reserved.
        </p>
      </Container>
    </div>
  );
}
