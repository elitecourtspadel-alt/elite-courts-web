'use client';
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { 
  Instagram, 
  Star, 
  Globe, 
  Youtube, 
  Calendar, 
  Trophy 
} from "lucide-react";

export default function ConnectPage() {
  // Centralized links so you can update them instantly anytime
  const links = [
    {
      title: "Book a Court",
      description: "Reserve your padel, pickleball, or cricket slot",
      url: "https://elite-courts-web.vercel.app", // Swap with booking link if needed
      icon: Calendar,
      color: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20",
    },
    {
      title: "Leave us a 5-Star Review",
      description: "Support us on Google Maps",
      url: "https://g.page/r/CYWJjkcweOHjEBM/review",
      icon: Star,
      color: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20",
    },
    {
      title: "Live Tournament Bracket",
      description: "Check ongoing match scores & standings",
      url: "/pickleball-tournament",
      icon: Trophy,
      color: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20",
    },
    {
      title: "Follow our Instagram",
      description: "Match highlights, community clips & updates",
      url: "https://instagram.com", // Replace with your actual handle
      icon: Instagram,
      color: "border-pink-500/30 hover:border-pink-400 bg-pink-950/20",
    },
    {
      title: "Watch on YouTube",
      description: "Court action, tutorials & event streams",
      url: "https://youtube.com", // Replace with your actual channel
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
        
        {/* Profile/Logo Header */}
        <div className="space-y-3">
          <div className="h-20 w-20 bg-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xl border border-emerald-400/20">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Elite Courts</h1>
          <p className="text-zinc-400 text-sm">Your premium sports destination in Lahore</p>
        </div>

        {/* Links Grid */}
        <div className="space-y-4">
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
                <div className="ml-4 text-left">
                  <h2 className="font-semibold text-sm text-zinc-100">{link.title}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{link.description}</p>
                </div>
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
