'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Trophy, Youtube, Sparkles, Clock, Users } from "lucide-react";

const DEFAULT_WINNER_IMAGE = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200";
const DEFAULT_CEREMONY_IMAGE = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200";

const firebaseConfig = {
  apiKey: "AizasyD4bPvYwRjOAGfiwoVPbG_4hj6QEbgdc9A",
  authDomain: "elitecourtsapp.firebaseapp.com",
  projectId: "elitecourtsapp",
  storageBucket: "elitecourtsapp.appspot.com",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d",
  databaseURL: "https://elitecourtsapp-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const TOURNEY_PATH = 'tournaments/americano_1';

// The whole tournament happens on a single day - keep this in sync with the
// same constant in the admin file. Times are stored as plain "HH:MM" and combined
// with this date only for internal live/upcoming/past calculations; it's never shown.
const TOURNAMENT_DATE = '2026-07-26';

type GroupKey = 'A' | 'B';
const GROUP_KEYS: GroupKey[] = ['A', 'B'];
const GROUP_LABELS: Record<GroupKey, string> = { A: 'Group A', B: 'Group B' };

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
  const end = start + (durationMins || 20) * 60000;
  const now = Date.now();
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'past';
}

function TimeBadge({ iso, duration }: { iso?: string; duration?: number }) {
  if (!iso) return null;
  const status = matchStatus(iso, duration);
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
      status === 'live' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
      status === 'past' ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500' :
      'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
    }`}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />}
      {status === 'upcoming' && <Clock className="w-3 h-3" />}
      <span>{formatTime(iso)}</span>
      {duration ? <><span>→</span><span>{endTime(iso, duration)}</span></> : null}
      {status === 'live' && <span className="ml-1">LIVE</span>}
    </div>
  );
}

interface AmericanoMatch {
  team1: [string, string];
  team2: [string, string];
  score1: string;
  score2: string;
  scheduledTime?: string;
  durationMins?: number;
}
interface AmericanoRound {
  matches: Record<string, AmericanoMatch>;
  sitOut?: string[];
}

interface PlayerInfo {
  name: string;
  photoUrl?: string;
  group: GroupKey;
}

interface PlayerStats {
  id: string;
  name: string;
  photoUrl?: string;
  played: number;
  wins: number;
  pointsFor: number;
}

function computeLeaderboard(players: Record<string, PlayerInfo> | undefined, rounds: Record<string, AmericanoRound> | undefined, group: GroupKey): PlayerStats[] {
  const stats: Record<string, PlayerStats> = {};
  Object.entries(players || {}).forEach(([id, info]) => {
    if (info.group !== group) return;
    stats[id] = { id, name: info.name, photoUrl: info.photoUrl, played: 0, wins: 0, pointsFor: 0 };
  });
  Object.values(rounds || {}).forEach((round) => {
    Object.values(round.matches || {}).forEach((m) => {
      if (m.score1 === '' || m.score1 == null || m.score2 === '' || m.score2 == null) return;
      const s1 = Number(m.score1); const s2 = Number(m.score2);
      (m.team1 || []).forEach((pid) => {
        if (!stats[pid]) return;
        stats[pid].played += 1; stats[pid].pointsFor += s1;
        if (s1 > s2) stats[pid].wins += 1;
      });
      (m.team2 || []).forEach((pid) => {
        if (!stats[pid]) return;
        stats[pid].played += 1; stats[pid].pointsFor += s2;
        if (s2 > s1) stats[pid].wins += 1;
      });
    });
  });
  return Object.values(stats).sort((a, b) =>
    b.pointsFor - a.pointsFor ||
    b.wins - a.wins
  );
}

const roundNum = (key: string) => Number(key.replace(/[^0-9]/g, '')) || 0;

export default function PadelAmericanoView() {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const [activeGroup, setActiveGroup] = useState<GroupKey>('A');

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, TOURNEY_PATH);
    const unsubscribe = onValue(tourneyRef, (snapshot) => {
      setTournamentData(snapshot.val());
      setLoading(false);
    }, () => setLoading(false));
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, []);

  const players: Record<string, PlayerInfo> = tournamentData?.players || {};
  const pName = (id: string) => players[id]?.name || '?';
  const streamLink = tournamentData?.config?.streamLink || "";
  const ceremonyImageUrl = tournamentData?.config?.closingPhotoUrl || DEFAULT_CEREMONY_IMAGE;

  const roundsFor = (g: GroupKey): Record<string, AmericanoRound> => tournamentData?.rounds?.[g] || {};
  const roundKeysFor = (g: GroupKey) => Object.keys(roundsFor(g)).sort((a, b) => roundNum(a) - roundNum(b));
  const playerCountFor = (g: GroupKey) => Object.values(players).filter((p) => p.group === g).length;

  const leaderboards: Record<GroupKey, PlayerStats[]> = {
    A: computeLeaderboard(players, roundsFor('A'), 'A'),
    B: computeLeaderboard(players, roundsFor('B'), 'B'),
  };

  const championsByGroup: Partial<Record<GroupKey, PlayerStats>> = {};
  GROUP_KEYS.forEach((g) => {
    const allMatches = roundKeysFor(g).flatMap((rk) => Object.values(roundsFor(g)[rk].matches || {}));
    const totalMatches = allMatches.length;
    const completedMatches = allMatches.filter((m) => m.score1 !== '' && m.score1 != null && m.score2 !== '' && m.score2 != null).length;
    const isComplete = totalMatches > 0 && completedMatches === totalMatches;
    if (isComplete && leaderboards[g].length > 0) championsByGroup[g] = leaderboards[g][0];
  });

  const winnerImageUrl = (g: GroupKey) => tournamentData?.config?.championPhotoUrl || championsByGroup[g]?.photoUrl || DEFAULT_WINNER_IMAGE;

  const g = activeGroup;
  const roundKeys = roundKeysFor(g);
  const rounds = roundsFor(g);
  const champion = championsByGroup[g];

  return (
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-10">

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">Padel</span>
          <span className="text-[10px] text-zinc-600 font-mono">Americano</span>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-cyan-400 text-center tracking-tight">Elite Courts Americano</h1>
          <p className="text-center text-zinc-400 text-sm">Live Leaderboard &amp; Schedule — Two Groups</p>
        </div>
        {streamLink && (
          <a href={streamLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-5 py-2 rounded-full text-xs transition-all border border-zinc-800">
            <Youtube className="w-4 h-4 text-red-500" /> Watch Live Stream
          </a>
        )}
      </div>

      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading tournament data...</p>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8">

          <div className="flex justify-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 w-fit mx-auto">
            {GROUP_KEYS.map((gk) => (
              <button key={gk} onClick={() => setActiveGroup(gk)}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  activeGroup === gk ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}>
                {GROUP_LABELS[gk]}
              </button>
            ))}
          </div>

          <div className="space-y-12">

            {champion && (
              <div className="bg-gradient-to-b from-cyan-950/20 to-zinc-900/40 border border-cyan-500/20 p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-2xl">
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> {GROUP_LABELS[g]} Champion Spotlight <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-cyan-500 tracking-tight">{champion.name}</h2>
                  <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">{champion.pointsFor} Points — {GROUP_LABELS[g]} Champion</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-3xl mx-auto">
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] shadow-lg group">
                      <img src={winnerImageUrl(g)} alt="Champion" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-mono tracking-wider font-bold text-cyan-400 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/10 inline-block">The Champion</span>
                  </div>
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] shadow-lg group">
                      <img src={ceremonyImageUrl} alt="Closing Ceremony" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                    <span className="text-xs font-mono tracking-wider font-bold text-zinc-400 bg-zinc-800/40 px-3 py-1 rounded-full border border-zinc-800 inline-block">Closing Ceremony</span>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div className="bg-zinc-900 border border-zinc-800/80 p-5 sm:p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Trophy className="h-5 w-5" />{GROUP_LABELS[g]} Leaderboard</h2>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />{playerCountFor(g)} PLAYERS
                </span>
              </div>

              {leaderboards[g].length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-8 border border-dashed border-zinc-800 rounded-xl">No players added yet</p>
              ) : (
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-2 text-left pl-2">Player</th>
                      <th className="py-2 text-center w-16">Played</th>
                      <th className="py-2 text-center w-14 text-emerald-500">Wins</th>
                      <th className="py-2 text-right pr-2 w-16 text-amber-400">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {leaderboards[g].map((row, idx) => (
                      <tr key={row.id} className={`hover:bg-zinc-800/30 ${idx === 0 && row.played > 0 ? 'bg-cyan-500/5' : ''}`}>
                        <td className="py-3 font-medium text-zinc-200 pl-2 flex items-center gap-2.5">
                          <span className="font-mono text-zinc-600 font-bold w-4">{idx + 1}</span>
                          {row.photoUrl ? (
                            <img src={row.photoUrl} alt={row.name} className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                              {row.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          {row.name}
                        </td>
                        <td className="py-3 text-center text-zinc-400 font-mono">{row.played}</td>
                        <td className="py-3 text-center text-emerald-400 font-mono">{row.wins}</td>
                        <td className="py-3 text-right pr-2 text-amber-400 font-mono font-bold">{row.pointsFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Rounds & Matches */}
            {roundKeys.length === 0 ? (
              <p className="text-zinc-700 text-xs text-center py-8">No schedule published yet for {GROUP_LABELS[g]}</p>
            ) : (
              <div className="space-y-8">
                {roundKeys.map((rk) => {
                  const round = rounds[rk];
                  const matches = Object.entries(round.matches || {});
                  const sitOut = round.sitOut || [];
                  return (
                    <div key={rk} className="bg-zinc-900/40 border border-zinc-800 p-5 sm:p-6 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-cyan-400 tracking-tight">Round {roundNum(rk)}</h3>
                        {sitOut.length > 0 && (
                          <span className="text-[10px] text-amber-500/80 font-mono">
                            Sitting out: {sitOut.map((id) => pName(id)).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matches.length === 0 ? (
                          <p className="text-zinc-700 text-xs text-center py-4 col-span-full">No matches in this round</p>
                        ) : matches.map(([courtKey, m]) => {
                          const status = matchStatus(m.scheduledTime, m.durationMins);
                          const hasScore = m.score1 !== '' && m.score1 != null && m.score2 !== '' && m.score2 != null;
                          return (
                            <div key={courtKey} className={`bg-zinc-950 border p-3 rounded-xl flex flex-col justify-between space-y-2 ${
                              status === 'live' ? 'border-red-500/40' : 'border-zinc-800/80'
                            }`}>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-zinc-900 pb-1">
                                <span>{courtKey.toUpperCase()}</span>
                                {hasScore ? <span className="text-emerald-400 font-bold">FINAL</span> :
                                 status === 'live' ? <span className="text-red-400 font-bold animate-pulse">LIVE 🔴</span> :
                                 <span className="text-amber-500 animate-pulse">PENDING</span>}
                              </div>
                              {m.scheduledTime && <TimeBadge iso={m.scheduledTime} duration={m.durationMins} />}
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className={hasScore && Number(m.score1) > Number(m.score2) ? 'text-cyan-400 font-bold' : 'text-zinc-300'}>
                                    {pName(m.team1[0])} &amp; {pName(m.team1[1])}
                                  </span>
                                  {hasScore && <span className="font-mono text-zinc-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score1}</span>}
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={hasScore && Number(m.score2) > Number(m.score1) ? 'text-cyan-400 font-bold' : 'text-zinc-300'}>
                                    {pName(m.team2[0])} &amp; {pName(m.team2[1])}
                                  </span>
                                  {hasScore && <span className="font-mono text-zinc-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score2}</span>}
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
            )}

          </div>
        </div>
      )}
    </div>
  );
}
