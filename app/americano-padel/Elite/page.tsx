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

type GroupKey = 'A' | 'B';
const GROUP_KEYS: GroupKey[] = ['A', 'B'];
const GROUP_LABELS: Record<GroupKey, string> = { A: 'Group A', B: 'Group B' };

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

interface TournamentData {
  players?: Record<string, PlayerInfo>;
  rounds?: Partial<Record<GroupKey, Record<string, AmericanoRound>>>;
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
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [newPlayerGroup, setNewPlayerGroup] = useState<GroupKey>('A');
  const [editingPlayerPhoto, setEditingPlayerPhoto] = useState<string | null>(null);
  const [editPlayerPhotoUrl, setEditPlayerPhotoUrl] = useState('');

  const [scheduleGroup, setScheduleGroup] = useState<GroupKey>('A');
  const [selectedRound, setSelectedRound] = useState<Partial<Record<GroupKey, string>>>({});
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScore1, setEditScore1] = useState('');
  const [editScore2, setEditScore2] = useState('');

  const [genStartTime, setGenStartTime] = useState('09:00');
  const [genRoundDuration, setGenRoundDuration] = useState('20');

  const [addMatchTeam1a, setAddMatchTeam1a] = useState('');
  const [addMatchTeam1b, setAddMatchTeam1b] = useState('');
  const [addMatchTeam2a, setAddMatchTeam2a] = useState('');
  const [addMatchTeam2b, setAddMatchTeam2b] = useState('');
  const [addMatchTime, setAddMatchTime] = useState('');
  const [addMatchDuration, setAddMatchDuration] = useState('20');
  const [showAddMatch, setShowAddMatch] = useState(false);

  const [maxPoints, setMaxPoints] = useState('');
  const [streamLink, setStreamLink] = useState('');
  const [championPhoto, setChampionPhoto] = useState('');
  const [closingPhoto, setClosingPhoto] = useState('');

  const showSaved = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  useEffect(() => {
    const tourneyRef = ref(db, TOURNEY_PATH);
    const unsub = onValue(tourneyRef, (snap) => {
      const val = snap.val() || {};
      setData(val);
      setMaxPoints(val.config?.maxPoints ? String(val.config.maxPoints) : '');
      setStreamLink(val.config?.streamLink || '');
      setChampionPhoto(val.config?.championPhotoUrl || '');
      setClosingPhoto(val.config?.closingPhotoUrl || '');
      setSelectedRound((prev) => {
        const next = { ...prev };
        GROUP_KEYS.forEach((g) => {
          const roundKeys = Object.keys(val.rounds?.[g] || {}).sort((a, b) => roundNum(a) - roundNum(b));
          if (roundKeys.length && !roundKeys.includes(next[g] || '')) next[g] = roundKeys[0];
        });
        return next;
      });
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const players = data.players || {};
  const allPlayerIds = Object.keys(players);
  const pName = (id: string) => players[id]?.name || '?';
  const playerIdsByGroup = (g: GroupKey) => allPlayerIds.filter((id) => players[id]?.group === g);

  const roundsFor = (g: GroupKey) => data.rounds?.[g] || {};
  const roundKeysFor = (g: GroupKey) => Object.keys(roundsFor(g)).sort((a, b) => roundNum(a) - roundNum(b));

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    await push(ref(db, `${TOURNEY_PATH}/players`), {
      name: newPlayerName.trim(), photoUrl: newPlayerPhoto.trim() || '', group: newPlayerGroup,
    });
    setNewPlayerName('');
    setNewPlayerPhoto('');
  };

  const openPhotoEditor = (playerId: string) => {
    setEditPlayerPhotoUrl(players[playerId]?.photoUrl || '');
    setEditingPlayerPhoto(playerId);
  };

  const handleSavePlayerPhoto = async (playerId: string) => {
    await set(ref(db, `${TOURNEY_PATH}/players/${playerId}`), {
      name: players[playerId]?.name || '',
      photoUrl: editPlayerPhotoUrl.trim(),
      group: players[playerId]?.group || 'A',
    });
    setEditingPlayerPhoto(null);
    showSaved('Photo saved');
  };

  const handleMovePlayerGroup = async (playerId: string, group: GroupKey) => {
    await set(ref(db, `${TOURNEY_PATH}/players/${playerId}`), {
      name: players[playerId]?.name || '',
      photoUrl: players[playerId]?.photoUrl || '',
      group,
    });
    showSaved(`Moved to ${GROUP_LABELS[group]}`);
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Remove this player? Existing matches will keep showing their name from history.')) return;
    await remove(ref(db, `${TOURNEY_PATH}/players/${playerId}`));
  };

  const handleGenerateSchedule = async (g: GroupKey) => {
    const groupPlayerIds = playerIdsByGroup(g);
    if (groupPlayerIds.length < 4) { alert(`Add at least 4 players to ${GROUP_LABELS[g]} first.`); return; }
    if (groupPlayerIds.length % 4 !== 0) {
      alert(`${GROUP_LABELS[g]} player count must be a multiple of 4 to guarantee everyone partners with everyone else exactly once. It currently has ${groupPlayerIds.length} players.`);
      return;
    }
    if (roundKeysFor(g).length > 0 && !confirm(`This replaces ${GROUP_LABELS[g]}'s entire schedule and any recorded scores. Continue?`)) return;

    const n = groupPlayerIds.length - 1;
    const generated = generateAmericanoSchedule(groupPlayerIds, n);

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

    await set(ref(db, `${TOURNEY_PATH}/rounds/${g}`), roundsPayload);
    setSelectedRound((prev) => ({ ...prev, [g]: 'round1' }));
    showSaved(`${GROUP_LABELS[g]} schedule generated`);
  };

  const handleAddRound = async (g: GroupKey) => {
    const keys = roundKeysFor(g);
    const nextNum = keys.length ? Math.max(...keys.map(roundNum)) + 1 : 1;
    const key = `round${nextNum}`;
    await set(ref(db, `${TOURNEY_PATH}/rounds/${g}/${key}`), { matches: {}, sitOut: [] });
    setSelectedRound((prev) => ({ ...prev, [g]: key }));
    showSaved(`Round ${nextNum} added to ${GROUP_LABELS[g]}`);
  };

  const handleDeleteRound = async (g: GroupKey, roundKey: string) => {
    if (!confirm(`Delete ${roundKey} from ${GROUP_LABELS[g]}? This cannot be undone.`)) return;
    await remove(ref(db, `${TOURNEY_PATH}/rounds/${g}/${roundKey}`));
  };

  const handleAddMatch = async (g: GroupKey, roundKey: string) => {
    const team1: [string, string] | null = addMatchTeam1a && addMatchTeam1b ? [addMatchTeam1a, addMatchTeam1b] : null;
    const team2: [string, string] | null = addMatchTeam2a && addMatchTeam2b ? [addMatchTeam2a, addMatchTeam2b] : null;
    if (!team1 || !team2) { alert('Pick two players for each team.'); return; }
    await push(ref(db, `${TOURNEY_PATH}/rounds/${g}/${roundKey}/matches`), {
      team1, team2, score1: '', score2: '',
      scheduledTime: addMatchTime || '',
      durationMins: Number(addMatchDuration) || 20,
    });
    setAddMatchTeam1a(''); setAddMatchTeam1b(''); setAddMatchTeam2a(''); setAddMatchTeam2b('');
    setAddMatchTime(''); setShowAddMatch(false);
    showSaved('Match added');
  };

  const handleDeleteMatch = async (g: GroupKey, roundKey: string, courtKey: string) => {
    if (!confirm('Delete this match?')) return;
    await remove(ref(db, `${TOURNEY_PATH}/rounds/${g}/${roundKey}/matches/${courtKey}`));
  };

  const openScoreEditor = (g: GroupKey, roundKey: string, courtKey: string, m: AmericanoMatch) => {
    setEditScore1(m.score1 || ''); setEditScore2(m.score2 || '');
    setEditingMatch(`${g}__${roundKey}__${courtKey}`);
  };

  const handleSaveScore = async (g: GroupKey, roundKey: string, courtKey: string, m: AmericanoMatch) => {
    const total = (Number(editScore1) || 0) + (Number(editScore2) || 0);
    const cap = Number(maxPoints);
    const hasCap = maxPoints !== '' && cap > 0;
    if (hasCap && total > cap) {
      alert(`Combined score can't exceed ${cap} points (currently ${total}).`);
      return;
    }
    await set(ref(db, `${TOURNEY_PATH}/rounds/${g}/${roundKey}/matches/${courtKey}`), {
      ...m, score1: editScore1, score2: editScore2,
    });
    setEditingMatch(null);
    showSaved('Score saved');
  };

  const handleSaveMaxPoints = async (value: string) => {
    setMaxPoints(value);
    await set(ref(db, `${TOURNEY_PATH}/config`), {
      maxPoints: Number(value) || null,
      streamLink, championPhotoUrl: championPhoto, closingPhotoUrl: closingPhoto,
    });
    showSaved('Points target saved');
  };

  const handleSaveConfig = async () => {
    await set(ref(db, `${TOURNEY_PATH}/config`), {
      maxPoints: Number(maxPoints) || null,
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
            <p className="text-zinc-500 text-xs mt-1">Elite Courts Padel — Americano Format — 2 Groups</p>
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
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Add Player</h3>
              <p className="text-[10px] text-zinc-500">Each group runs its own independent Americano — assign the player to a group now (you can move them later).</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="Player name"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder:text-zinc-600" />
                <input type="text" value={newPlayerPhoto}
                  onChange={e => setNewPlayerPhoto(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="Photo URL (optional)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder:text-zinc-600 font-mono" />
                <select value={newPlayerGroup} onChange={e => setNewPlayerGroup(e.target.value as GroupKey)}
                  className="bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none shrink-0">
                  {GROUP_KEYS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
                </select>
                <button onClick={handleAddPlayer}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0">
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {GROUP_KEYS.map((g) => {
                const ids = playerIdsByGroup(g);
                return (
                  <div key={g} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">{GROUP_LABELS[g]} ({ids.length})</h3>
                    <div className="space-y-2">
                      {ids.length === 0 ? (
                        <p className="text-zinc-600 text-xs text-center py-6 border border-dashed border-zinc-800 rounded-xl">No players yet</p>
                      ) : ids.map((id) => (
                        <div key={id} className="bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {players[id]?.photoUrl ? (
                                <img src={players[id].photoUrl} alt={players[id].name}
                                  className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                                  {(players[id]?.name || '?').slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <span className="text-xs font-semibold text-zinc-200">{players[id]?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleMovePlayerGroup(id, g === 'A' ? 'B' : 'A')}
                                className="text-zinc-600 hover:text-cyan-400 text-[10px] font-bold uppercase transition-colors">
                                Move to {GROUP_LABELS[g === 'A' ? 'B' : 'A']}
                              </button>
                              <button onClick={() => openPhotoEditor(id)}
                                className="text-zinc-600 hover:text-cyan-400 text-[10px] font-bold uppercase transition-colors">
                                {players[id]?.photoUrl ? 'Edit Photo' : '+ Photo'}
                              </button>
                              <button onClick={() => handleDeletePlayer(id)}
                                className="text-zinc-600 hover:text-red-400 text-xs font-bold transition-colors">✕</button>
                            </div>
                          </div>
                          {editingPlayerPhoto === id && (
                            <div className="flex gap-2 pt-1 border-t border-zinc-800">
                              <input type="text" value={editPlayerPhotoUrl}
                                onChange={e => setEditPlayerPhotoUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-[10px] outline-none text-white font-mono mt-2" />
                              <button onClick={() => handleSavePlayerPhoto(id)}
                                className="mt-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-[10px] font-black uppercase transition-all">
                                Save
                              </button>
                              <button onClick={() => setEditingPlayerPhoto(null)}
                                className="mt-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-[10px] font-black uppercase transition-all">
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {activeTab === 'Schedule' && (
          <div className="space-y-6">

            <div className="flex gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 w-fit">
              {GROUP_KEYS.map((g) => (
                <button key={g} onClick={() => setScheduleGroup(g)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                    scheduleGroup === g ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}>
                  {GROUP_LABELS[g]}
                </button>
              ))}
            </div>

            <div className={`bg-zinc-900 border rounded-2xl p-6 space-y-3 ${maxPoints === '' ? 'border-amber-500/40' : 'border-zinc-800'}`}>
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">Points Per Game</h3>
              <p className="text-[10px] text-zinc-500">
                Shared across both groups. How many combined points will each match go to?
              </p>
              <div className="flex gap-2 items-center">
                <input type="number" min="1" value={maxPoints}
                  onChange={e => setMaxPoints(e.target.value)}
                  onBlur={e => handleSaveMaxPoints(e.target.value)}
                  placeholder="e.g. 16, 21, 24..."
                  className="w-40 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm outline-none text-white font-mono font-bold" />
                <span className="text-xs text-zinc-500">points per match</span>
              </div>
              {maxPoints === '' && (
                <p className="text-[10px] text-amber-500">Not set yet — scores won't be capped until you enter a number.</p>
              )}
            </div>

            {(() => {
              const g = scheduleGroup;
              const groupPlayerIds = playerIdsByGroup(g);
              const roundKeys = roundKeysFor(g);
              const rounds = roundsFor(g);
              const activeRound = selectedRound[g] || (roundKeys[0] || '');

              return (
                <>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Generate Schedule — {GROUP_LABELS[g]}</h3>
                    <p className="text-[10px] text-zinc-500">
                      With a player count that's a multiple of 4, the generator uses exactly <strong>{Math.max(groupPlayerIds.length - 1, 0)} rounds</strong> —
                      mathematically just enough for every player in this group to partner with every other player in this group exactly once.
                      It optimizes hard for that outcome, though as a randomized search it isn't a guaranteed-perfect solver — check the
                      schedule after generating and use "Add Match Manually" to fix any repeat it missed.
                    </p>
                    {groupPlayerIds.length > 0 && groupPlayerIds.length % 4 !== 0 && (
                      <p className="text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                        {GROUP_LABELS[g]} currently has {groupPlayerIds.length} players — add or remove {4 - (groupPlayerIds.length % 4)} to reach a multiple of 4 before generating.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    {groupPlayerIds.length >= 4 && groupPlayerIds.length % 4 === 0 && (
                      <p className="text-[10px] text-zinc-500">
                        ≈ {Math.max(groupPlayerIds.length - 1, 0) * (Number(genRoundDuration) || 0)} minutes total, ending around{' '}
                        {addMinutesToTime(genStartTime, Math.max(groupPlayerIds.length - 1, 0) * (Number(genRoundDuration) || 0))}.
                      </p>
                    )}
                    <button onClick={() => handleGenerateSchedule(g)}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                      {roundKeys.length > 0 ? `Regenerate ${GROUP_LABELS[g]} Schedule` : `Generate ${GROUP_LABELS[g]} Schedule`}
                    </button>
                  </div>

                  {roundKeys.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                        {roundKeys.map((rk) => (
                          <button key={rk} onClick={() => setSelectedRound((prev) => ({ ...prev, [g]: rk }))}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              activeRound === rk ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                            }`}>
                            Round {roundNum(rk)}
                          </button>
                        ))}
                        <button onClick={() => handleAddRound(g)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white border border-dashed border-zinc-700">
                          + Round
                        </button>
                      </div>

                      {rounds[activeRound] && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">{GROUP_LABELS[g]} — Round {roundNum(activeRound)}</h4>
                            <button onClick={() => handleDeleteRound(g, activeRound)}
                              className="text-[10px] text-zinc-600 hover:text-red-400 font-bold uppercase transition-colors">
                              Delete Round
                            </button>
                          </div>

                          {(rounds[activeRound].sitOut || []).length > 0 && (
                            <p className="text-[10px] text-amber-500/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                              Sitting out: {(rounds[activeRound].sitOut || []).map(id => pName(id)).join(', ')}
                            </p>
                          )}

                          <div className="space-y-3">
                            {Object.entries(rounds[activeRound].matches || {}).map(([courtKey, m]) => {
                              const editKey = `${g}__${activeRound}__${courtKey}`;
                              const isEditing = editingMatch === editKey;
                              const status = matchStatus(m.scheduledTime, m.durationMins);
                              const total = (Number(editScore1) || 0) + (Number(editScore2) || 0);
                              const cap = Number(maxPoints);
                              const hasCap = maxPoints !== '' && cap > 0;
                              return (
                                <div key={courtKey} className={`bg-zinc-950 border rounded-xl p-4 space-y-3 ${
                                  status === 'live' ? 'border-red-500/40' : 'border-zinc-800'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{courtKey}</span>
                                    <button onClick={() => handleDeleteMatch(g, activeRound, courtKey)}
                                      className="text-zinc-600 hover:text-red-400 text-xs font-bold transition-colors">✕</button>
                                  </div>
                                  {m.scheduledTime && <TimeBadge iso={m.scheduledTime} duration={m.durationMins} />}
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-xs space-y-1.5 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-300">{pName(m.team1[0])} &amp; {pName(m.team1[1])}</span>
                                        {m.score1 !== '' && <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score1}</span>}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-300">{pName(m.team2[0])} &amp; {pName(m.team2[1])}</span>
                                        {m.score2 !== '' && <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score2}</span>}
                                      </div>
                                    </div>
                                    <button onClick={() => openScoreEditor(g, activeRound, courtKey, m)}
                                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] font-black uppercase hover:text-cyan-400 transition-colors shrink-0">
                                      {m.score1 !== '' ? 'Edit' : 'Score'}
                                    </button>
                                  </div>

                                  {isEditing && (
                                    <div className="border-t border-zinc-800 pt-3 space-y-2">
                                      {!hasCap && (
                                        <p className="text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                                          No points target set yet — set "Points Per Game" above to cap scores.
                                        </p>
                                      )}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{pName(m.team1[0])} &amp; {pName(m.team1[1])}</label>
                                          <input type="number" min="0" max={hasCap ? maxPoints : undefined} value={editScore1}
                                            onChange={e => {
                                              const v = e.target.value;
                                              const capped = v === '' ? '' : hasCap ? String(Math.max(0, Math.min(cap, Number(v)))) : String(Math.max(0, Number(v)));
                                              setEditScore1(capped);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                        </div>
                                        <div>
                                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{pName(m.team2[0])} &amp; {pName(m.team2[1])}</label>
                                          <input type="number" min="0" max={hasCap ? maxPoints : undefined} value={editScore2}
                                            onChange={e => {
                                              const v = e.target.value;
                                              const capped = v === '' ? '' : hasCap ? String(Math.max(0, Math.min(cap, Number(v)))) : String(Math.max(0, Number(v)));
                                              setEditScore2(capped);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                        </div>
                                      </div>
                                      {hasCap && (
                                        <p className={`text-[10px] font-mono ${total > cap ? 'text-red-400' : total === cap ? 'text-emerald-400' : 'text-amber-500'}`}>
                                          Total: {total} / {maxPoints} points{total > cap ? ' — over the limit' : ''}
                                        </p>
                                      )}
                                      <div className="flex gap-2 pt-1">
                                        <button onClick={() => handleSaveScore(g, activeRound, courtKey, m)}
                                          disabled={hasCap && total > cap}
                                          className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all">
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
                                  {groupPlayerIds.map(id => <option key={id} value={id}>{pName(id)}</option>)}
                                </select>
                                <select value={addMatchTeam1b} onChange={e => setAddMatchTeam1b(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                                  <option value="">Team 1 — Player 2</option>
                                  {groupPlayerIds.map(id => <option key={id} value={id}>{pName(id)}</option>)}
                                </select>
                                <select value={addMatchTeam2a} onChange={e => setAddMatchTeam2a(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                                  <option value="">Team 2 — Player 1</option>
                                  {groupPlayerIds.map(id => <option key={id} value={id}>{pName(id)}</option>)}
                                </select>
                                <select value={addMatchTeam2b} onChange={e => setAddMatchTeam2b(e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                                  <option value="">Team 2 — Player 2</option>
                                  {groupPlayerIds.map(id => <option key={id} value={id}>{pName(id)}</option>)}
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
                                <button onClick={() => handleAddMatch(g, activeRound)}
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
                </>
              );
            })()}
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === 'Leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {GROUP_KEYS.map((g) => {
              const leaderboard = computeLeaderboard(players, roundsFor(g), g);
              return (
                <div key={g} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4">{GROUP_LABELS[g]} Leaderboard</h3>
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
                            <td className="py-2.5 text-right pr-2 text-amber-400 font-mono font-bold">{p.pointsFor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {activeTab === 'Config' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Tournament Configuration</h3>
            <p className="text-[10px] text-zinc-600 -mt-2">Looking for "Points Per Game"? That now lives on the Schedule tab.</p>
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
