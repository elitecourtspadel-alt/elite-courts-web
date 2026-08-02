'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";

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
const db = getDatabase(app);

const TOURNEY_PATH = 'tournaments/americano_1';

// The whole tournament happens on a single day - update this once to that date.
// Times are stored as plain "HH:MM" and combined with this date only for internal
// live/upcoming/past calculations. It is never shown to admins or viewers.
const TOURNAMENT_DATE = '2026-07-26';

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

interface TournamentData {
  players?: Record<string, string>;
  rounds?: Record<string, AmericanoRound>;
  config?: {
    maxPoints?: number;
    streamLink?: string;
    championPhotoUrl?: string;
    closingPhotoUrl?: string;
  };
}

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

function addMinutesToTime(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = ((h * 60 + m + mins) % (24 * 60) + 24 * 60) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

interface PlayerStats {
  id: string;
  name: string;
  played: number;
  wins: number;
  pointsFor: number;
  pointsAgainst: number;
}

function computeLeaderboard(players: Record<string, string> | undefined, rounds: Record<string, AmericanoRound> | undefined): PlayerStats[] {
  const stats: Record<string, PlayerStats> = {};
  Object.entries(players || {}).forEach(([id, name]) => {
    stats[id] = { id, name, played: 0, wins: 0, pointsFor: 0, pointsAgainst: 0 };
  });
  Object.values(rounds || {}).forEach((round) => {
    Object.values(round.matches || {}).forEach((m) => {
      if (m.score1 === '' || m.score1 == null || m.score2 === '' || m.score2 == null) return;
      const s1 = Number(m.score1); const s2 = Number(m.score2);
      (m.team1 || []).forEach((pid) => {
        if (!stats[pid]) return;
        stats[pid].played += 1; stats[pid].pointsFor += s1; stats[pid].pointsAgainst += s2;
        if (s1 > s2) stats[pid].wins += 1;
      });
      (m.team2 || []).forEach((pid) => {
        if (!stats[pid]) return;
        stats[pid].played += 1; stats[pid].pointsFor += s2; stats[pid].pointsAgainst += s1;
        if (s2 > s1) stats[pid].wins += 1;
      });
    });
  });
  return Object.values(stats).sort((a, b) =>
    b.pointsFor - a.pointsFor ||
    (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst) ||
    b.wins - a.wins
  );
}

// ── Best-effort round-robin doubles scheduler ──────────────────────────────
// Not a guaranteed-perfect combinatorial design (that requires specific finite-field
// constructions for exact N). Instead, for every round it tries many random groupings
// and keeps the one with the fewest repeated partnerships / repeated opponents so far.
// Works well in practice for typical group sizes (8-20 players).
interface GeneratedMatch { team1: [string, string]; team2: [string, string]; }
interface GeneratedRound { matches: GeneratedMatch[]; sitOut: string[]; }

function generateAmericanoSchedule(playerIds: string[], numRounds: number): GeneratedRound[] {
  const n = playerIds.length;
  const courts = Math.floor(n / 4);
  if (courts < 1 || numRounds < 1) return [];

  const partnerCount: Record<string, Record<string, number>> = {};
  const opponentCount: Record<string, Record<string, number>> = {};
  const sitOutCount: Record<string, number> = {};
  playerIds.forEach((a) => {
    partnerCount[a] = {}; opponentCount[a] = {}; sitOutCount[a] = 0;
    playerIds.forEach((b) => { partnerCount[a][b] = 0; opponentCount[a][b] = 0; });
  });

  const rounds: GeneratedRound[] = [];

  for (let r = 0; r < numRounds; r++) {
    const sitOutNeeded = n % 4;
    let pool = [...playerIds];
    let sitOut: string[] = [];
    if (sitOutNeeded > 0) {
      const sorted = [...pool].sort((a, b) => sitOutCount[a] - sitOutCount[b] || Math.random() - 0.5);
      sitOut = sorted.slice(0, sitOutNeeded);
      pool = pool.filter((p) => !sitOut.includes(p));
    }

    let best: { matches: GeneratedMatch[]; cost: number } | null = null;
    const attempts = 250;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const groups: string[][] = [];
      for (let i = 0; i < shuffled.length; i += 4) groups.push(shuffled.slice(i, i + 4));

      let cost = 0;
      const matches: GeneratedMatch[] = [];
      for (const g of groups) {
        const [a, b, c, d] = g;
        const splits: [[string, string], [string, string]][] = [
          [[a, b], [c, d]],
          [[a, c], [b, d]],
          [[a, d], [b, c]],
        ];
        let bestSplit = splits[0];
        let bestSplitCost = Infinity;
        for (const [t1, t2] of splits) {
          const splitCost =
            partnerCount[t1[0]][t1[1]] * 10 + partnerCount[t2[0]][t2[1]] * 10 +
            opponentCount[t1[0]][t2[0]] + opponentCount[t1[0]][t2[1]] +
            opponentCount[t1[1]][t2[0]] + opponentCount[t1[1]][t2[1]];
          if (splitCost < bestSplitCost) { bestSplitCost = splitCost; bestSplit = [t1, t2]; }
        }
        cost += bestSplitCost;
        matches.push({ team1: bestSplit[0], team2: bestSplit[1] });
      }
      if (!best || cost < best.cost) best = { matches, cost };
      if (best.cost === 0) break;
    }

    const chosen = best!.matches;
    chosen.forEach((m) => {
      const [a, b] = m.team1; const [c, d] = m.team2;
      partnerCount[a][b] += 1; partnerCount[b][a] += 1;
      partnerCount[c][d] += 1; partnerCount[d][c] += 1;
      [a, b].forEach((x) => [c, d].forEach((y) => { opponentCount[x][y] += 1; opponentCount[y][x] += 1; }));
    });
    sitOut.forEach((p) => { sitOutCount[p] += 1; });

    rounds.push({ matches: chosen, sitOut });
  }

  return rounds;
}

const roundNum = (key: string) => Number(key.replace(/[^0-9]/g, '')) || 0;

export default function PadelAmericanoAdmin() {
  const [data, setData] = useState<TournamentData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Players' | 'Schedule' | 'Leaderboard' | 'Config'>('Players');
  const [saved, setSaved] = useState<string | null>(null);

  const [newPlayerName, setNewPlayerName] = useState('');

  const [selectedRound, setSelectedRound] = useState<string>('round1');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScore1, setEditScore1] = useState('');
  const [editScore2, setEditScore2] = useState('');

  const [genNumRounds, setGenNumRounds] = useState('7');
  const [genStartTime, setGenStartTime] = useState('09:00');
  const [genRoundDuration, setGenRoundDuration] = useState('20');

  const [addMatchTeam1a, setAddMatchTeam1a] = useState('');
  const [addMatchTeam1b, setAddMatchTeam1b] = useState('');
  const [addMatchTeam2a, setAddMatchTeam2a] = useState('');
  const [addMatchTeam2b, setAddMatchTeam2b] = useState('');
  const [addMatchTime, setAddMatchTime] = useState('');
  const [addMatchDuration, setAddMatchDuration] = useState('20');
  const [showAddMatch, setShowAddMatch] = useState(false);

  const [maxPoints, setMaxPoints] = useState('16');
  const [streamLink, setStreamLink] = useState('');
  const [championPhoto, setChampionPhoto] = useState('');
  const [closingPhoto, setClosingPhoto] = useState('');

  const showSaved = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  useEffect(() => {
    const tourneyRef = ref(db, TOURNEY_PATH);
    const unsub = onValue(tourneyRef, (snap) => {
      const val = snap.val() || {};
      setData(val);
      setMaxPoints(String(val.config?.maxPoints || 16));
      setStreamLink(val.config?.streamLink || '');
      setChampionPhoto(val.config?.championPhotoUrl || '');
      setClosingPhoto(val.config?.closingPhotoUrl || '');
      const roundKeys = Object.keys(val.rounds || {}).sort((a, b) => roundNum(a) - roundNum(b));
      if (roundKeys.length && !roundKeys.includes(selectedRound)) setSelectedRound(roundKeys[0]);
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const players = data.players || {};
  const playerIds = Object.keys(players);
  const rounds = data.rounds || {};
  const roundKeys = Object.keys(rounds).sort((a, b) => roundNum(a) - roundNum(b));

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    await push(ref(db, `${TOURNEY_PATH}/players`), newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Remove this player? Existing matches will keep showing their name from history.')) return;
    await remove(ref(db, `${TOURNEY_PATH}/players/${playerId}`));
  };

  const handleGenerateSchedule = async () => {
    if (playerIds.length < 4) { alert('Add at least 4 players first.'); return; }
    if (roundKeys.length > 0 && !confirm('This replaces the entire schedule and any recorded scores. Continue?')) return;

    const n = Number(genNumRounds) || playerIds.length - 1;
    const generated = generateAmericanoSchedule(playerIds, Math.max(1, n));

    const roundsPayload: Record<string, AmericanoRound> = {};
    generated.forEach((round, idx) => {
      const startTime = addMinutesToTime(genStartTime, idx * Number(genRoundDuration));
      const matches: Record<string, AmericanoMatch> = {};
      round.matches.forEach((m, mi) => {
        matches[`court${mi + 1}`] = {
          team1: m.team1, team2: m.team2,
          score1: '', score2: '',
          scheduledTime: startTime,
          durationMins: Number(genRoundDuration) || 20,
        };
      });
      roundsPayload[`round${idx + 1}`] = { matches, sitOut: round.sitOut };
    });

    await set(ref(db, `${TOURNEY_PATH}/rounds`), roundsPayload);
    setSelectedRound('round1');
    showSaved('Schedule generated');
  };

  const handleAddRound = async () => {
    const nextNum = roundKeys.length ? Math.max(...roundKeys.map(roundNum)) + 1 : 1;
    const key = `round${nextNum}`;
    await set(ref(db, `${TOURNEY_PATH}/rounds/${key}`), { matches: {}, sitOut: [] });
    setSelectedRound(key);
    showSaved(`Round ${nextNum} added`);
  };

  const handleDeleteRound = async (roundKey: string) => {
    if (!confirm(`Delete ${roundKey}? This cannot be undone.`)) return;
    await remove(ref(db, `${TOURNEY_PATH}/rounds/${roundKey}`));
  };

  const handleAddMatch = async (roundKey: string) => {
    const team1: [string, string] | null = addMatchTeam1a && addMatchTeam1b ? [addMatchTeam1a, addMatchTeam1b] : null;
    const team2: [string, string] | null = addMatchTeam2a && addMatchTeam2b ? [addMatchTeam2a, addMatchTeam2b] : null;
    if (!team1 || !team2) { alert('Pick two players for each team.'); return; }
    await push(ref(db, `${TOURNEY_PATH}/rounds/${roundKey}/matches`), {
      team1, team2, score1: '', score2: '',
      scheduledTime: addMatchTime || '',
      durationMins: Number(addMatchDuration) || 20,
    });
    setAddMatchTeam1a(''); setAddMatchTeam1b(''); setAddMatchTeam2a(''); setAddMatchTeam2b('');
    setAddMatchTime(''); setShowAddMatch(false);
    showSaved('Match added');
  };

  const handleDeleteMatch = async (roundKey: string, courtKey: string) => {
    if (!confirm('Delete this match?')) return;
    await remove(ref(db, `${TOURNEY_PATH}/rounds/${roundKey}/matches/${courtKey}`));
  };

  const openScoreEditor = (roundKey: string, courtKey: string, m: AmericanoMatch) => {
    setEditScore1(m.score1 || ''); setEditScore2(m.score2 || '');
    setEditingMatch(`${roundKey}__${courtKey}`);
  };

  const handleSaveScore = async (roundKey: string, courtKey: string, m: AmericanoMatch) => {
    await set(ref(db, `${TOURNEY_PATH}/rounds/${roundKey}/matches/${courtKey}`), {
      ...m, score1: editScore1, score2: editScore2,
    });
    setEditingMatch(null);
    showSaved('Score saved');
  };

  const handleSaveConfig = async () => {
    await set(ref(db, `${TOURNEY_PATH}/config`), {
      maxPoints: Number(maxPoints) || 16,
      streamLink, championPhotoUrl: championPhoto, closingPhotoUrl: closingPhoto,
    });
    showSaved('Config saved');
  };

  const TimeBadge = ({ iso, duration }: { iso?: string; duration?: number }) => {
    if (!iso) return null;
    const status = matchStatus(iso, duration);
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border ${
        status === 'live' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
        status === 'past' ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500' :
        'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
      }`}>
        {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />}
        <span>{formatTime(iso)}</span>
        {duration ? <><span>→</span><span>{endTime(iso, duration)}</span></> : null}
        {status === 'live' && <span className="text-red-400 ml-1">LIVE</span>}
      </div>
    );
  };

  const leaderboard = computeLeaderboard(players, rounds);

  if (loading) return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 text-xs uppercase tracking-widest animate-pulse">
      Loading Americano tournament data...
    </div>
  );

  const TABS: ('Players' | 'Schedule' | 'Leaderboard' | 'Config')[] = ['Players', 'Schedule', 'Leaderboard', 'Config'];

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="border-b border-zinc-800 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">Padel</span>
              <span className="text-[10px] text-zinc-600 font-mono">Americano</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Americano Admin</h1>
            <p className="text-zinc-500 text-xs mt-1">Elite Courts Padel — Americano Format</p>
          </div>
          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl animate-pulse">
              ✓ {saved}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? tab === 'Leaderboard' ? 'bg-amber-500 text-black'
                  : tab === 'Config' ? 'bg-zinc-400 text-black'
                  : 'bg-cyan-500 text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── PLAYERS TAB ── */}
        {activeTab === 'Players' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Players ({playerIds.length})</h3>
            <p className="text-[10px] text-zinc-500">Americano needs groups of 4 — a multiple of 4 players means nobody sits out each round.</p>
            <div className="flex gap-2">
              <input type="text" value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Player name"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder:text-zinc-600" />
              <button onClick={handleAddPlayer}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                Add
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {playerIds.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-6 border border-dashed border-zinc-800 rounded-xl sm:col-span-2">No players yet</p>
              ) : playerIds.map((id) => (
                <div key={id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl">
                  <span className="text-xs font-semibold text-zinc-200">{players[id]}</span>
                  <button onClick={() => handleDeletePlayer(id)}
                    className="text-zinc-600 hover:text-red-400 text-xs font-bold transition-colors">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {activeTab === 'Schedule' && (
          <div className="space-y-6">

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Generate Schedule</h3>
              <p className="text-[10px] text-zinc-500">
                Best-effort round robin — it tries hard to give every player a different partner each round, but with odd
                player counts or few rounds it can't always guarantee zero repeats.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Number of Rounds</label>
                  <input type="number" min="1" value={genNumRounds} onChange={e => setGenNumRounds(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Start Time</label>
                  <input type="time" value={genStartTime} onChange={e => setGenStartTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Round Duration (mins)</label>
                  <input type="number" min="1" value={genRoundDuration} onChange={e => setGenRoundDuration(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <button onClick={handleGenerateSchedule}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                {roundKeys.length > 0 ? 'Regenerate Schedule' : 'Generate Schedule'}
              </button>
            </div>

            {roundKeys.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                  {roundKeys.map((rk) => (
                    <button key={rk} onClick={() => setSelectedRound(rk)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        selectedRound === rk ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}>
                      Round {roundNum(rk)}
                    </button>
                  ))}
                  <button onClick={handleAddRound}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white border border-dashed border-zinc-700">
                    + Round
                  </button>
                </div>

                {rounds[selectedRound] && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">Round {roundNum(selectedRound)}</h4>
                      <button onClick={() => handleDeleteRound(selectedRound)}
                        className="text-[10px] text-zinc-600 hover:text-red-400 font-bold uppercase transition-colors">
                        Delete Round
                      </button>
                    </div>

                    {(rounds[selectedRound].sitOut || []).length > 0 && (
                      <p className="text-[10px] text-amber-500/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                        Sitting out: {(rounds[selectedRound].sitOut || []).map(id => players[id] || 'Unknown').join(', ')}
                      </p>
                    )}

                    <div className="space-y-3">
                      {Object.entries(rounds[selectedRound].matches || {}).map(([courtKey, m]) => {
                        const editKey = `${selectedRound}__${courtKey}`;
                        const isEditing = editingMatch === editKey;
                        const status = matchStatus(m.scheduledTime, m.durationMins);
                        const total = (Number(editScore1) || 0) + (Number(editScore2) || 0);
                        return (
                          <div key={courtKey} className={`bg-zinc-950 border rounded-xl p-4 space-y-3 ${
                            status === 'live' ? 'border-red-500/40' : 'border-zinc-800'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{courtKey}</span>
                              <button onClick={() => handleDeleteMatch(selectedRound, courtKey)}
                                className="text-zinc-600 hover:text-red-400 text-xs font-bold transition-colors">✕</button>
                            </div>
                            {m.scheduledTime && <TimeBadge iso={m.scheduledTime} duration={m.durationMins} />}
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-xs space-y-1.5 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-300">{(players[m.team1[0]] || '?')} &amp; {(players[m.team1[1]] || '?')}</span>
                                  {m.score1 !== '' && <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score1}</span>}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-300">{(players[m.team2[0]] || '?')} &amp; {(players[m.team2[1]] || '?')}</span>
                                  {m.score2 !== '' && <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score2}</span>}
                                </div>
                              </div>
                              <button onClick={() => openScoreEditor(selectedRound, courtKey, m)}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] font-black uppercase hover:text-cyan-400 transition-colors shrink-0">
                                {m.score1 !== '' ? 'Edit' : 'Score'}
                              </button>
                            </div>

                            {isEditing && (
                              <div className="border-t border-zinc-800 pt-3 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{players[m.team1[0]] || '?'} &amp; {players[m.team1[1]] || '?'}</label>
                                    <input type="text" value={editScore1} onChange={e => setEditScore1(e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{players[m.team2[0]] || '?'} &amp; {players[m.team2[1]] || '?'}</label>
                                    <input type="text" value={editScore2} onChange={e => setEditScore2(e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                  </div>
                                </div>
                                <p className={`text-[10px] font-mono ${total === Number(maxPoints) ? 'text-emerald-400' : 'text-amber-500'}`}>
                                  Total: {total} / {maxPoints} points
                                </p>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => handleSaveScore(selectedRound, courtKey, m)}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all">
                                    Save Score
                                  </button>
                                  <button onClick={() => setEditingMatch(null)}
                                    className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 py-2 rounded-lg text-xs font-black uppercase transition-all">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!showAddMatch ? (
                      <button onClick={() => setShowAddMatch(true)}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                        + Add Match Manually
                      </button>
                    ) : (
                      <div className="border-t border-zinc-800 pt-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select value={addMatchTeam1a} onChange={e => setAddMatchTeam1a(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option value="">Team 1 — Player 1</option>
                            {playerIds.map(id => <option key={id} value={id}>{players[id]}</option>)}
                          </select>
                          <select value={addMatchTeam1b} onChange={e => setAddMatchTeam1b(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option value="">Team 1 — Player 2</option>
                            {playerIds.map(id => <option key={id} value={id}>{players[id]}</option>)}
                          </select>
                          <select value={addMatchTeam2a} onChange={e => setAddMatchTeam2a(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option value="">Team 2 — Player 1</option>
                            {playerIds.map(id => <option key={id} value={id}>{players[id]}</option>)}
                          </select>
                          <select value={addMatchTeam2b} onChange={e => setAddMatchTeam2b(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option value="">Team 2 — Player 2</option>
                            {playerIds.map(id => <option key={id} value={id}>{players[id]}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Match Time</label>
                            <input type="time" value={addMatchTime} onChange={e => setAddMatchTime(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Duration (mins)</label>
                            <input type="number" min="1" value={addMatchDuration} onChange={e => setAddMatchDuration(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAddMatch(selectedRound)}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all">
                            Add Match
                          </button>
                          <button onClick={() => setShowAddMatch(false)}
                            className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 py-2 rounded-lg text-xs font-black uppercase transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === 'Leaderboard' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4">Live Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <p className="text-zinc-600 text-xs text-center py-6 border border-dashed border-zinc-800 rounded-xl">No players yet</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                    <th className="py-2 text-left pl-2">#</th>
                    <th className="py-2 text-left">Player</th>
                    <th className="py-2 text-center">Played</th>
                    <th className="py-2 text-center text-emerald-500">Wins</th>
                    <th className="py-2 text-center text-teal-400">Diff</th>
                    <th className="py-2 text-right pr-2 text-amber-400">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {leaderboard.map((p, idx) => (
                    <tr key={p.id} className={idx === 0 && p.played > 0 ? 'bg-cyan-500/5' : ''}>
                      <td className="py-2.5 pl-2 font-mono text-zinc-600 font-bold">{idx + 1}</td>
                      <td className="py-2.5 font-semibold text-zinc-200">
                        <div className="flex items-center gap-2">
                          {idx === 0 && p.played > 0 && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-black uppercase">Leader</span>}
                          {p.name}
                        </div>
                      </td>
                      <td className="py-2.5 text-center text-zinc-400 font-mono">{p.played}</td>
                      <td className="py-2.5 text-center text-emerald-400 font-mono">{p.wins}</td>
                      <td className={`py-2.5 text-center font-mono font-medium ${(p.pointsFor - p.pointsAgainst) > 0 ? 'text-teal-400' : (p.pointsFor - p.pointsAgainst) < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                        {p.pointsFor - p.pointsAgainst > 0 ? `+${p.pointsFor - p.pointsAgainst}` : p.pointsFor - p.pointsAgainst}
                      </td>
                      <td className="py-2.5 text-right pr-2 text-amber-400 font-mono font-bold">{p.pointsFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {activeTab === 'Config' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Tournament Configuration</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Points Per Game</label>
              <input type="number" min="1" value={maxPoints} onChange={e => setMaxPoints(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono" />
              <p className="text-[10px] text-zinc-600 mt-1">Used as a live hint when entering scores (e.g. 9–7 for a 16-point game).</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">YouTube / Stream Link</label>
              <input type="text" value={streamLink} onChange={e => setStreamLink(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Champion Photo URL</label>
              <input type="text" value={championPhoto} onChange={e => setChampionPhoto(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://..." />
              {championPhoto && <img src={championPhoto} className="mt-2 h-24 rounded-xl object-cover border border-zinc-800" alt="preview" />}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Closing Ceremony Photo URL</label>
              <input type="text" value={closingPhoto} onChange={e => setClosingPhoto(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://..." />
              {closingPhoto && <img src={closingPhoto} className="mt-2 h-24 rounded-xl object-cover border border-zinc-800" alt="preview" />}
            </div>
            <button onClick={handleSaveConfig}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
              Save Configuration
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
