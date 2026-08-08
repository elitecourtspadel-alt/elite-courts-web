'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Trophy, GitFork, Youtube, Sparkles } from "lucide-react";

const DEFAULT_WINNER_IMAGE = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200";
const DEFAULT_CEREMONY_IMAGE = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200";
const DEFAULT_HERO_BACKGROUND = "https://images.unsplash.com/photo-1687975733837-1959daf0c56e?q=80&w=2000";

const firebaseConfig = {
  apiKey: "AizasyD4bPvYwRjOAGfiwoVPbG_4hj6QEbgdc9A",
  authDomain: "elitecourtsapp.firebaseapp.com",
  projectId: "elitecourtsapp",
  storageBucket: "elitecourtsapp.firebasestorage.app",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d",
  databaseURL: "https://elitecourtsapp-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// The whole tournament happens on a single day - keep this in sync with the
// same constant in the admin file. Times are stored as plain "HH:MM" and combined
// with this date only for internal live/upcoming/past calculations; it's never shown.
const TOURNAMENT_DATE = '2026-08-08';

function toDateTime(time: string) {
  if (!time) return '';
  return `${TOURNAMENT_DATE}T${time}`;
}

function formatTime(time: string) {
  if (!time) return '';
  const d = new Date(toDateTime(time));
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function endTime(time: string, mins: number) {
  if (!time || !mins) return '';
  const d = new Date(new Date(toDateTime(time)).getTime() + mins * 60000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function matchStatus(time?: string, durationMins?: number) {
  if (!time) return 'unscheduled';
  const start = new Date(toDateTime(time)).getTime();
  const end = start + (durationMins || 10) * 60000;
  const now = Date.now();
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'past';
}

function TimeBadge({ iso, duration }: { iso?: string; duration?: number }) {
  if (!iso) return null;
  const status = matchStatus(iso, duration);
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
      status === 'live' ? 'bg-rose-400/10 border-rose-400/30 text-rose-300' :
      status === 'past' ? 'bg-white/5 border-white/10 text-slate-500' :
      'bg-fuchsia-400/10 border-fuchsia-400/30 text-fuchsia-300'
    }`}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse inline-block" />}
      <span>{formatTime(iso)}</span>
      {duration ? <><span>→</span><span>{endTime(iso, duration)}</span></> : null}
      {status === 'live' && <span className="ml-1">LIVE</span>}
    </div>
  );
}

export default function PickleballSeason2View() {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const requiredGroups = ['Group A', 'Group B', 'Group C', 'Group D'];

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_season_2');
    const unsubscribe = onValue(tourneyRef, (snapshot) => {
      setTournamentData(snapshot.val());
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const qf1 = tournamentData?.knockouts?.qf1 || {};
  const qf2 = tournamentData?.knockouts?.qf2 || {};
  const qf3 = tournamentData?.knockouts?.qf3 || {};
  const qf4 = tournamentData?.knockouts?.qf4 || {};
  const semi1 = tournamentData?.knockouts?.semi1 || {};
  const semi2 = tournamentData?.knockouts?.semi2 || {};
  const finalMatch = tournamentData?.knockouts?.final || {};
  const streamLink = tournamentData?.config?.streamLink || "";
  const winnerImageUrl = tournamentData?.config?.championPhotoUrl || DEFAULT_WINNER_IMAGE;
  const ceremonyImageUrl = tournamentData?.config?.closingPhotoUrl || DEFAULT_CEREMONY_IMAGE;
  const heroBackgroundUrl = tournamentData?.config?.heroBackgroundUrl || DEFAULT_HERO_BACKGROUND;

  const isSemi1Ready = !!(qf1.winner && qf2.winner);
  const isSemi2Ready = !!(qf3.winner && qf4.winner);

  return (
    <div className="bg-slate-950 min-h-screen text-white">

      {/* Hero — full-bleed background photo with gradient overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBackgroundUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        </div>
        <div className="relative flex flex-col items-center justify-center space-y-4 px-4 py-20 sm:py-28">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-300 bg-fuchsia-400/10 border border-fuchsia-400/30 px-3 py-1 rounded-full backdrop-blur-sm">Pickleball</span>
            <span className="text-[10px] text-slate-300 font-mono">Season 2</span>
          </div>
          <div>
            <h1 className="text-4xl sm:text-6xl font-black mb-2 text-center tracking-tight bg-gradient-to-r from-fuchsia-300 via-white to-amber-300 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              Elite Courts Pickleball
            </h1>
            <p className="text-center text-slate-300 text-sm sm:text-base">Season 2 — Live Brackets &amp; Standings</p>
          </div>
          {streamLink && (
            <a href={streamLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs transition-all border border-white/20">
              <Youtube className="w-4 h-4 text-red-400" /> Watch Live Stream
            </a>
          )}
        </div>
      </div>

      <div className="relative p-4 sm:p-10 -mt-10">
        <div className="pointer-events-none absolute top-0 -right-32 w-[32rem] h-[32rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-40 w-[36rem] h-[36rem] rounded-full bg-amber-500/10 blur-3xl" />

        {loading ? (
          <p className="text-slate-500 text-center animate-pulse">Loading tournament data...</p>
        ) : (
          <div className="relative max-w-7xl mx-auto space-y-12">

            {finalMatch.winner && (
              <div className="bg-gradient-to-b from-amber-500/10 via-white/5 to-fuchsia-400/10 backdrop-blur-xl border border-amber-400/20 p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-[0_8px_60px_-16px_rgba(251,191,36,0.25)]">
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Champions Spotlight <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-fuchsia-300 tracking-tight">
                    {finalMatch.winner}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">Pickleball Season 2 Champions</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-5xl mx-auto">
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 aspect-[16/10] shadow-lg group">
                      <img src={winnerImageUrl} alt="Winning Team" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-mono tracking-wider font-bold text-fuchsia-300 bg-fuchsia-400/5 px-3 py-1 rounded-full border border-fuchsia-400/10 inline-block">The Champions</span>
                  </div>
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 aspect-[16/10] shadow-lg group">
                      <img src={ceremonyImageUrl} alt="Closing Ceremony" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-mono tracking-wider font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 inline-block">Closing Ceremony</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {requiredGroups.map((groupName) => {
                const groupData = tournamentData?.groups?.[groupName];
                const teamsRaw = groupData?.teams ? (Object.values(groupData.teams) as string[]) : [];
                const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];
                const standingsMap: Record<string, { name: string; p: number; w: number; l: number; diff: number; pts: number }> = {};
                teamsRaw.forEach((tName) => { standingsMap[tName] = { name: tName, p: 0, w: 0, l: 0, diff: 0, pts: 0 }; });
                matchesRaw.forEach((match: any) => {
                  const mData = match[1];
                  const t1 = mData.team1; const t2 = mData.team2; const win = mData.winner;
                  const s1 = Number(mData.score1 || 0); const s2 = Number(mData.score2 || 0);
                  if (standingsMap[t1] && standingsMap[t2] && win && win.trim() !== "") {
                    standingsMap[t1].p += 1; standingsMap[t2].p += 1;
                    standingsMap[t1].diff += (s1 - s2); standingsMap[t2].diff += (s2 - s1);
                    if (win === t1) { standingsMap[t1].w += 1; standingsMap[t1].pts += 3; standingsMap[t2].l += 1; }
                    else if (win === t2) { standingsMap[t2].w += 1; standingsMap[t2].pts += 3; standingsMap[t1].l += 1; }
                  }
                });
                const sortedStandings = Object.values(standingsMap).sort((a, b) => b.pts - a.pts || b.diff - a.diff);

                return (
                  <div key={groupName} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h2 className="text-xl font-bold text-fuchsia-300 flex items-center gap-2"><Trophy className="h-5 w-5" />{groupName}</h2>
                      <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full font-mono font-bold">{teamsRaw.length} TEAMS</span>
                    </div>

                    {teamsRaw.length === 0 ? (
                      <p className="text-slate-600 text-xs text-center py-8 border border-dashed border-white/10 rounded-xl">No teams added yet</p>
                    ) : (
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="py-2 text-left pl-2">Team</th>
                            <th className="py-2 text-center w-10">P</th>
                            <th className="py-2 text-center w-10 text-emerald-400">W</th>
                            <th className="py-2 text-center w-10 text-rose-400">L</th>
                            <th className="py-2 text-center w-12 text-slate-300">Diff</th>
                            <th className="py-2 text-right pr-2 w-14 text-amber-300">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {sortedStandings.map((row, idx) => (
                            <tr key={row.name} className={`hover:bg-white/5 ${idx === 0 && row.pts > 0 ? 'bg-fuchsia-400/5' : ''}`}>
                              <td className="py-3 font-medium text-slate-200 pl-2 flex items-center gap-2">
                                <span className="font-mono text-slate-600 font-bold w-4">{idx + 1}</span>
                                {row.name}
                              </td>
                              <td className="py-3 text-center text-slate-400 font-mono">{row.p}</td>
                              <td className="py-3 text-center text-emerald-400 font-mono">{row.w}</td>
                              <td className="py-3 text-center text-slate-500 font-mono">{row.l}</td>
                              <td className={`py-3 text-center font-mono font-medium ${row.diff > 0 ? 'text-fuchsia-300' : row.diff < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                {row.diff > 0 ? `+${row.diff}` : row.diff}
                              </td>
                              <td className="py-3 text-right pr-2 text-amber-300 font-mono font-bold">{row.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {matchesRaw.length === 0 ? (
                        <p className="text-slate-700 text-xs text-center py-4 col-span-2">No matches scheduled yet</p>
                      ) : matchesRaw.map((match: any) => {
                        const matchId = match[0]; const mData = match[1];
                        const status = matchStatus(mData.scheduledTime, mData.durationMins);
                        return (
                          <div key={matchId} className={`bg-slate-950/60 border p-3 rounded-xl flex flex-col justify-between space-y-2 ${
                            status === 'live' ? 'border-rose-400/40' : 'border-white/10'
                          }`}>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-b border-white/5 pb-1">
                              <span>MATCH</span>
                              {mData.winner ? <span className="text-emerald-400 font-bold">FINAL</span> :
                               status === 'live' ? <span className="text-rose-400 font-bold animate-pulse">LIVE 🔴</span> :
                               <span className="text-amber-400 animate-pulse">PENDING</span>}
                            </div>
                            {mData.scheduledTime && <TimeBadge iso={mData.scheduledTime} duration={mData.durationMins} />}
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className={mData.winner === mData.team1 ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{mData.team1}</span>
                                {mData.winner && <span className="font-mono text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{mData.score1}</span>}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className={mData.winner === mData.team2 ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{mData.team2}</span>
                                {mData.winner && <span className="font-mono text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded text-[10px]">{mData.score2}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quarterfinals */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-fuchsia-300 text-center flex items-center justify-center gap-2 tracking-tight">
                <GitFork className="h-6 w-6 rotate-180" /> Quarterfinals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {[
                  { label: 'QUARTERFINAL 1', data: qf1 },
                  { label: 'QUARTERFINAL 2', data: qf2 },
                  { label: 'QUARTERFINAL 3', data: qf3 },
                  { label: 'QUARTERFINAL 4', data: qf4 },
                ].map((q) => (
                  <div key={q.label} className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl space-y-3 shadow-md">
                    <div className="flex justify-between font-mono text-[9px] text-slate-500 border-b border-white/5 pb-1">
                      <span>{q.label}</span>
                      {q.data.winner ? <span className="text-emerald-400 font-bold">FINAL</span> : <span className="text-amber-400/50">PENDING</span>}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className={q.data.winner && q.data.winner === q.data.team1 ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{q.data.team1 || 'TBD'}</span>
                        {q.data.winner && <span className="bg-white/5 text-slate-400 font-mono px-1.5 py-0.5 rounded text-[10px]">{q.data.score1}</span>}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={q.data.winner && q.data.winner === q.data.team2 ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{q.data.team2 || 'TBD'}</span>
                        {q.data.winner && <span className="bg-white/5 text-slate-400 font-mono px-1.5 py-0.5 rounded text-[10px]">{q.data.score2}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Semifinals + Final Bracket */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl space-y-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-amber-300 text-center flex items-center justify-center gap-2 tracking-tight">
                <GitFork className="h-6 w-6 rotate-180" /> Semifinals &amp; Final
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto pt-4">

                <div className="space-y-8 lg:col-span-1">
                  <div className="text-center font-bold text-[10px] tracking-widest text-slate-500 uppercase mb-2">Semifinals</div>

                  {[
                    { label: 'SEMIFINAL 1', data: semi1, ga: qf1.winner || 'Winner QF1', gc: qf2.winner || 'Winner QF2', tagA: 'QF1', tagC: 'QF2', ready: isSemi1Ready },
                    { label: 'SEMIFINAL 2', data: semi2, ga: qf3.winner || 'Winner QF3', gc: qf4.winner || 'Winner QF4', tagA: 'QF3', tagC: 'QF4', ready: isSemi2Ready },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl space-y-3 shadow-md">
                      <div className="flex justify-between font-mono text-[9px] text-slate-500 border-b border-white/5 pb-1">
                        <span>{s.label}</span>
                        {s.data.winner ? <span className="text-emerald-400 font-bold">FINAL</span> :
                         s.ready ? <span className="text-rose-400 font-bold animate-pulse">LIVE 🔴</span> :
                         <span className="text-amber-400/50">PENDING</span>}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className={s.data.winner === s.ga ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{s.ga}</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            {s.data.winner && <span className="bg-white/5 text-slate-400 px-1 rounded text-[10px]">{s.data.score1}</span>}
                            <span className="text-[10px] text-slate-600">({s.tagA})</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={s.data.winner === s.gc ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{s.gc}</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            {s.data.winner && <span className="bg-white/5 text-slate-400 px-1 rounded text-[10px]">{s.data.score2}</span>}
                            <span className="text-[10px] text-slate-600">({s.tagC})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-1 flex flex-col justify-center space-y-3">
                  <div className="text-center font-bold text-[10px] tracking-widest text-slate-500 uppercase mb-2">Grand Championship</div>
                  <div className="bg-gradient-to-b from-amber-500/10 via-white/5 to-fuchsia-400/10 border-2 border-amber-400/30 p-5 rounded-2xl space-y-4 shadow-xl">
                    <div className="flex justify-between font-mono text-[9px] text-amber-300 font-bold border-b border-white/10 pb-1">
                      <span>CHAMPIONSHIP MATCH</span>
                      {finalMatch.winner ? <span className="text-emerald-400">FINAL</span> :
                       (semi1.winner && semi2.winner) ? <span className="text-rose-400 animate-pulse">LIVE 🔴</span> :
                       <span className="text-amber-400/50 font-normal">PENDING</span>}
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={finalMatch.winner && finalMatch.winner === semi1.winner ? 'text-amber-300 font-bold' : 'text-slate-400'}>{semi1.winner || "Winner Semifinal 1"}</span>
                        {finalMatch.winner && <span className="font-mono text-slate-400 text-xs font-bold bg-slate-950 px-1.5 py-0.5 rounded">{finalMatch.score1}</span>}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={finalMatch.winner && finalMatch.winner === semi2.winner ? 'text-amber-300 font-bold' : 'text-slate-400'}>{semi2.winner || "Winner Semifinal 2"}</span>
                        {finalMatch.winner && <span className="font-mono text-slate-400 text-xs font-bold bg-slate-950 px-1.5 py-0.5 rounded">{finalMatch.score2}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-white/10 rounded-3xl text-center space-y-3 shadow-lg">
                  <div className="bg-amber-400/10 p-4 rounded-full border border-amber-400/30">
                    <Trophy className="h-10 w-10 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider">Tournament Champion</h3>
                    <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-fuchsia-300 mt-1">
                      {finalMatch.winner || "TBD"}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
