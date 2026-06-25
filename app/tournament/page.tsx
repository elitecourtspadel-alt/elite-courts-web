'use client';
import Link from "next/link";
import { Trophy, Clock, ArrowRight, CalendarDays } from "lucide-react";

const tournaments = [
  {
    id: "pickleball-may-2026",
    name: "Pickleball Tournament",
    edition: "Season 1",
    date: "May 2026",
    status: "completed" as const,
    sport: "Pickleball",
    href: "/pickleball-tournament",
    description: "Elite Courts' inaugural pickleball tournament featuring group stage brackets and knockout rounds.",
    teams: 16,
    groups: 4,
  },
  {
    id: "pickleball-2",
    name: "Pickleball Tournament",
    edition: "Season 2",
    date: "Coming Soon",
    status: "soon" as const,
    sport: "Pickleball",
    href: null,
    description: "The second edition of Elite Courts Pickleball Tournament. Registration details coming soon.",
    teams: null,
    groups: null,
  },
  {
    id: "padel-1",
    name: "Padel Tournament",
    edition: "Season 1",
    date: "Coming Soon",
    status: "soon" as const,
    sport: "Padel",
    href: null,
    description: "Elite Courts' first ever Padel Tournament. Stay tuned for registration and bracket details.",
    teams: null,
    groups: null,
  },
];

const sportColors: Record<string, { badge: string; glow: string; icon: string }> = {
  Pickleball: {
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    glow: "hover:shadow-[0_16px_40px_-16px_rgba(16,185,129,0.25)]",
    icon: "text-emerald-400",
  },
  Padel: {
    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    glow: "hover:shadow-[0_16px_40px_-16px_rgba(6,182,212,0.25)]",
    icon: "text-cyan-400",
  },
};

export default function TournamentsPage() {
  return (
    <div className="bg-[color:var(--surface-soft)] min-h-screen">

      {/* Hero header */}
      <div className="bg-[color:var(--surface)] border-b border-[color:var(--border)] py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Elite Courts
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[color:var(--text)]">
            Tournaments
          </h1>
          <p className="text-[color:var(--muted)] text-sm sm:text-base max-w-xl mx-auto leading-7">
            All Elite Courts tournaments in one place — live brackets, final standings, and upcoming events.
          </p>
        </div>
      </div>

      {/* Tournament cards */}
      <div className="max-w-4xl mx-auto px-6 py-14 space-y-5">

        {tournaments.map((t) => {
          const colors = sportColors[t.sport] ?? sportColors.Pickleball;
          const isCompleted = t.status === "completed";

          return (
            <div
              key={t.id}
              className={`group relative bg-[color:var(--surface)] border border-[color:var(--border)] rounded-2xl p-6 sm:p-8 transition-all duration-200 ${colors.glow} ${isCompleted ? 'hover:-translate-y-0.5' : 'opacity-80'}`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-3">
                  {/* Sport + status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${colors.badge}`}>
                      <Trophy className="h-3 w-3" />
                      {t.sport}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-400/20 bg-zinc-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--muted)]">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[color:var(--text)] tracking-tight">
                      {t.name}
                    </h2>
                    <p className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-widest mt-0.5">
                      {t.edition}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[color:var(--muted)] leading-6 max-w-lg">
                    {t.description}
                  </p>

                  {/* Meta — date + teams */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="font-semibold">{t.date}</span>
                    </div>
                    {t.teams && (
                      <div className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
                        <span className="font-semibold">{t.teams} Teams</span>
                        <span className="text-[color:var(--border)]">·</span>
                        <span className="font-semibold">{t.groups} Groups</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0">
                  {isCompleted && t.href ? (
                    <Link
                      href={t.href}
                      className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider text-black bg-emerald-500 hover:bg-emerald-400 transition-all hover:scale-105 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]`}
                    >
                      View Bracket
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider text-[color:var(--muted)] border border-[color:var(--border)] bg-[color:var(--surface-soft)] cursor-not-allowed select-none">
                      <Clock className="h-3.5 w-3.5" />
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
