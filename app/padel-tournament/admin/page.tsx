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

const GROUPS = ['Group A', 'Group B', 'Group C', 'Group D'];
const TOURNEY_PATH = 'tournaments/padel_season_1';

// The whole tournament happens on a single day - update this once to that date.
// Times are stored as plain "HH:MM" and combined with this date only for internal
// live/upcoming/past calculations. It is never shown to admins or viewers.
const TOURNAMENT_DATE = '2026-07-26';

interface Match {
  id: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  winner: string;
  scheduledTime?: string;   // time only, e.g. "14:30" (tournament runs in a single day)
  durationMins?: number;    // expected match duration in minutes
  matchNumber?: number;     // display order / label, e.g. Match 1, Match 2...
}

interface GroupData {
  teams: Record<string, string>;
  matches: Record<string, Omit<Match, 'id'>>;
}

interface KnockoutMatch {
  team1?: string;
  team2?: string;
  winner: string;
  score1: string;
  score2: string;
  scheduledTime?: string;
  durationMins?: number;
}

interface TournamentData {
  groups?: Record<string, GroupData>;
  knockouts?: {
    qf1?: KnockoutMatch;
    qf2?: KnockoutMatch;
    qf3?: KnockoutMatch;
    qf4?: KnockoutMatch;
    semi1?: KnockoutMatch;
    semi2?: KnockoutMatch;
    final?: KnockoutMatch;
  };
  config?: {
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
  const end = start + (durationMins || 45) * 60000;
  const now = Date.now();
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'past';
}

type KOStage = 'qf1' | 'qf2' | 'qf3' | 'qf4' | 'semi1' | 'semi2' | 'final';

interface KOFormState {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  winner: string;
  time: string;
  duration: string;
}

const makeEmptyKO = (duration: string): KOFormState => ({
  team1: '', team2: '', score1: '', score2: '', winner: '', time: '', duration,
});

const KO_LABELS: Record<KOStage, string> = {
  qf1: 'Quarterfinal 1', qf2: 'Quarterfinal 2', qf3: 'Quarterfinal 3', qf4: 'Quarterfinal 4',
  semi1: 'Semifinal 1', semi2: 'Semifinal 2', final: 'Grand Final',
};

export default function PadelTournamentAdmin() {
  const [data, setData] = useState<TournamentData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Group A');
  const [saved, setSaved] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [matchTeam1, setMatchTeam1] = useState('');
  const [matchTeam2, setMatchTeam2] = useState('');
  const [matchNumber, setMatchNumber] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [matchDuration, setMatchDuration] = useState('45');

  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [resultScore1, setResultScore1] = useState('');
  const [resultScore2, setResultScore2] = useState('');
  const [resultWinner, setResultWinner] = useState('');

  const [ko, setKo] = useState<Record<KOStage, KOFormState>>({
    qf1: makeEmptyKO('45'),
    qf2: makeEmptyKO('45'),
    qf3: makeEmptyKO('45'),
    qf4: makeEmptyKO('45'),
    semi1: makeEmptyKO('45'),
    semi2: makeEmptyKO('45'),
    final: makeEmptyKO('60'),
  });

  const [streamLink, setStreamLink] = useState('');
  const [championPhoto, setChampionPhoto] = useState('');
  const [closingPhoto, setClosingPhoto] = useState('');

  const showSaved = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  useEffect(() => {
    const tourneyRef = ref(db, TOURNEY_PATH);
    const unsub = onValue(tourneyRef, (snap) => {
      const val = snap.val() || {};
      setData(val);

      const loadKO = (stage: KOStage, fallbackDuration: string): KOFormState => ({
        team1: val.knockouts?.[stage]?.team1 || '',
        team2: val.knockouts?.[stage]?.team2 || '',
        score1: val.knockouts?.[stage]?.score1 || '',
        score2: val.knockouts?.[stage]?.score2 || '',
        winner: val.knockouts?.[stage]?.winner || '',
        time: val.knockouts?.[stage]?.scheduledTime || '',
        duration: String(val.knockouts?.[stage]?.durationMins || fallbackDuration),
      });

      setKo({
        qf1: loadKO('qf1', '45'),
        qf2: loadKO('qf2', '45'),
        qf3: loadKO('qf3', '45'),
        qf4: loadKO('qf4', '45'),
        semi1: loadKO('semi1', '45'),
        semi2: loadKO('semi2', '45'),
        final: loadKO('final', '60'),
      });

      setStreamLink(val.config?.streamLink || '');
      setChampionPhoto(val.config?.championPhotoUrl || '');
      setClosingPhoto(val.config?.closingPhotoUrl || '');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddTeam = async (group: string) => {
    if (!newTeamName.trim()) return;
    await push(ref(db, `${TOURNEY_PATH}/groups/${group}/teams`), newTeamName.trim());
    setNewTeamName('');
  };

  const handleDeleteTeam = async (group: string, teamKey: string) => {
    if (!confirm('Remove this team?')) return;
    await remove(ref(db, `${TOURNEY_PATH}/groups/${group}/teams/${teamKey}`));
  };

  const handleAddMatch = async (group: string) => {
    if (!matchTeam1.trim() || !matchTeam2.trim()) return;
    const existingCount = data.groups?.[group]?.matches ? Object.keys(data.groups[group].matches).length : 0;
    await push(ref(db, `${TOURNEY_PATH}/groups/${group}/matches`), {
      team1: matchTeam1.trim(), team2: matchTeam2.trim(),
      score1: '', score2: '', winner: '',
      scheduledTime: matchTime || '',
      durationMins: Number(matchDuration) || 45,
      matchNumber: Number(matchNumber) || existingCount + 1,
    });
    setMatchTeam1(''); setMatchTeam2(''); setMatchTime(''); setMatchNumber('');
  };

  const handleDeleteMatch = async (group: string, matchKey: string) => {
    if (!confirm('Delete this match?')) return;
    await remove(ref(db, `${TOURNEY_PATH}/groups/${group}/matches/${matchKey}`));
  };

  const handleSaveResult = async (group: string, matchKey: string) => {
    const m = data.groups?.[group]?.matches?.[matchKey];
    await set(ref(db, `${TOURNEY_PATH}/groups/${group}/matches/${matchKey}`), {
      team1: m?.team1 || '', team2: m?.team2 || '',
      score1: resultScore1, score2: resultScore2, winner: resultWinner,
      scheduledTime: m?.scheduledTime || '',
      durationMins: m?.durationMins || 45,
    });
    setEditingMatch(null);
    showSaved('Result saved');
  };

  const openResultEditor = (group: string, matchKey: string) => {
    const m = data.groups?.[group]?.matches?.[matchKey];
    setResultScore1(m?.score1 || '');
    setResultScore2(m?.score2 || '');
    setResultWinner(m?.winner || '');
    setEditingMatch(`${group}__${matchKey}`);
  };

  const updateKo = (stage: KOStage, field: keyof KOFormState, value: string) => {
    setKo(prev => ({ ...prev, [stage]: { ...prev[stage], [field]: value } }));
  };

  const handleSaveKnockout = async (stage: KOStage) => {
    const s = ko[stage];
    const payload: any = {
      score1: s.score1,
      score2: s.score2,
      winner: s.winner,
      scheduledTime: s.time,
      durationMins: Number(s.duration) || 45,
    };
    if (stage === 'qf1' || stage === 'qf2' || stage === 'qf3' || stage === 'qf4') {
      payload.team1 = s.team1;
      payload.team2 = s.team2;
    }
    await set(ref(db, `${TOURNEY_PATH}/knockouts/${stage}`), payload);
    showSaved(`${KO_LABELS[stage]} saved`);
  };

  const handleSaveConfig = async () => {
    await set(ref(db, `${TOURNEY_PATH}/config`), {
      streamLink, championPhotoUrl: championPhoto, closingPhotoUrl: closingPhoto,
    });
    showSaved('Config saved');
  };

  // All teams across every group, for the quarterfinal team pickers
  const allTeams: string[] = [];
  GROUPS.forEach((g) => {
    const t = data.groups?.[g]?.teams;
    if (t) Object.values(t).forEach((name) => allTeams.push(name as string));
  });

  // Semi/Final matchups are derived from the *saved* winner of the previous round
  const semi1Teams = [data.knockouts?.qf1?.winner, data.knockouts?.qf2?.winner].filter(Boolean) as string[];
  const semi2Teams = [data.knockouts?.qf3?.winner, data.knockouts?.qf4?.winner].filter(Boolean) as string[];
  const finalTeams = [data.knockouts?.semi1?.winner, data.knockouts?.semi2?.winner].filter(Boolean) as string[];

  const TABS = [...GROUPS, 'Knockouts', 'Config'];

  const TimeBadge = ({ iso, duration, winner }: { iso?: string; duration?: number; winner?: string }) => {
    if (!iso) return null;
    const status = matchStatus(iso, duration);
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border ${
        status === 'live' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
        status === 'past' ? 'bg-zinc-800/60 border-zinc-700 text-zinc-500' :
        'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
      }`}>
        {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />}
        <span>{formatTime(iso)}</span>
        {duration ? <><span>→</span><span>{endTime(iso, duration)}</span></> : null}
        {status === 'live' && !winner && <span className="text-red-400 ml-1">LIVE</span>}
        {status === 'past' && winner && <span className="text-emerald-400 ml-1">DONE</span>}
      </div>
    );
  };

  if (loading) return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 text-xs uppercase tracking-widest animate-pulse">
      Loading padel tournament data...
    </div>
  );

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="border-b border-zinc-800 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">Padel</span>
              <span className="text-[10px] text-zinc-600 font-mono">Season 1</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Tournament Admin</h1>
            <p className="text-zinc-500 text-xs mt-1">Elite Courts Padel — Season 1</p>
          </div>
          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2 rounded-xl animate-pulse">
              ✓ {saved}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? tab === 'Knockouts' ? 'bg-amber-500 text-black'
                  : tab === 'Config' ? 'bg-zinc-400 text-black'
                  : 'bg-cyan-500 text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {GROUPS.includes(activeTab) && (() => {
          const group = activeTab;
          const gData = data.groups?.[group];
          const teams = gData?.teams ? Object.entries(gData.teams) : [];
          const matches = gData?.matches ? Object.entries(gData.matches) : [];

          const standingsMap: Record<string, { name: string; p: number; w: number; l: number; diff: number; pts: number }> = {};
          teams.forEach(([, n]) => { standingsMap[n] = { name: n, p: 0, w: 0, l: 0, diff: 0, pts: 0 }; });
          matches.forEach(([, m]: any) => {
            if (standingsMap[m.team1] && standingsMap[m.team2] && m.winner?.trim()) {
              standingsMap[m.team1].p += 1; standingsMap[m.team2].p += 1;
              standingsMap[m.team1].diff += Number(m.score1 || 0) - Number(m.score2 || 0);
              standingsMap[m.team2].diff += Number(m.score2 || 0) - Number(m.score1 || 0);
              if (m.winner === m.team1) { standingsMap[m.team1].w += 1; standingsMap[m.team1].pts += 3; standingsMap[m.team2].l += 1; }
              else if (m.winner === m.team2) { standingsMap[m.team2].w += 1; standingsMap[m.team2].pts += 3; standingsMap[m.team1].l += 1; }
            }
          });
          const sortedStandings = Object.values(standingsMap).sort((a, b) => b.pts - a.pts || b.diff - a.diff);

          return (
            <div className="space-y-6">
              {sortedStandings.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-4">Live Standings — {group}</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                        <th className="py-2 text-left pl-2">#</th>
                        <th className="py-2 text-left">Team</th>
                        <th className="py-2 text-center">P</th>
                        <th className="py-2 text-center text-emerald-500">W</th>
                        <th className="py-2 text-center text-red-400">L</th>
                        <th className="py-2 text-center text-teal-400">Diff</th>
                        <th className="py-2 text-right pr-2 text-amber-400">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {sortedStandings.map((row, idx) => (
                        <tr key={row.name} className={idx === 0 ? 'bg-cyan-500/5' : ''}>
                          <td className="py-2.5 pl-2 font-mono text-zinc-600 font-bold">{idx + 1}</td>
                          <td className="py-2.5 font-semibold text-zinc-200">
                            <div className="flex items-center gap-2">
                              {idx === 0 && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-black uppercase">Leader</span>}
                              {row.name}
                            </div>
                          </td>
                          <td className="py-2.5 text-center text-zinc-400 font-mono">{row.p}</td>
                          <td className="py-2.5 text-center text-emerald-400 font-mono">{row.w}</td>
                          <td className="py-2.5 text-center text-zinc-500 font-mono">{row.l}</td>
                          <td className={`py-2.5 text-center font-mono font-medium ${row.diff > 0 ? 'text-teal-400' : row.diff < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {row.diff > 0 ? `+${row.diff}` : row.diff}
                          </td>
                          <td className="py-2.5 text-right pr-2 text-amber-400 font-mono font-bold">{row.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Teams — {group}</h3>
                  <div className="flex gap-2">
                    <input type="text" value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTeam(group)}
                      placeholder="Team / player name"
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder:text-zinc-600"
                    />
                    <button onClick={() => handleAddTeam(group)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {teams.length === 0 ? (
                      <p className="text-zinc-600 text-xs text-center py-6 border border-dashed border-zinc-800 rounded-xl">No teams yet</p>
                    ) : teams.map(([key, name]) => (
                      <div key={key} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl">
                        <span className="text-xs font-semibold text-zinc-200">{name}</span>
                        <button onClick={() => handleDeleteTeam(group, key)}
                          className="text-zinc-600 hover:text-red-400 text-xs font-bold transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Schedule Match — {group}</h3>
                  <div className="space-y-2">
                    <select value={matchTeam1} onChange={e => setMatchTeam1(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                      <option value="">Select Team 1</option>
                      {teams.map(([k, n]) => <option key={k} value={n}>{n}</option>)}
                    </select>
                    <select value={matchTeam2} onChange={e => setMatchTeam2(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                      <option value="">Select Team 2</option>
                      {teams.map(([k, n]) => <option key={k} value={n}>{n}</option>)}
                    </select>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Match #</label>
                        <input type="number" min="1" value={matchNumber}
                          onChange={e => setMatchNumber(e.target.value)}
                          placeholder={String(matches.length + 1)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Match Time</label>
                        <input type="time" value={matchTime}
                          onChange={e => setMatchTime(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Duration (mins)</label>
                        <select value={matchDuration} onChange={e => setMatchDuration(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                          <option value="20">20 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                          <option value="75">75 min</option>
                          <option value="90">90 min</option>
                        </select>
                      </div>
                    </div>

                    <button onClick={() => handleAddMatch(group)}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                      + Schedule Match
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {matches.length === 0 ? (
                      <p className="text-zinc-600 text-xs text-center py-6 border border-dashed border-zinc-800 rounded-xl">No matches scheduled yet</p>
                    ) : [...matches].sort(([, a]: any, [, b]: any) => (a.matchNumber || 0) - (b.matchNumber || 0)).map(([matchKey, m]: any) => {
                      const editKey = `${group}__${matchKey}`;
                      const isEditing = editingMatch === editKey;
                      const status = matchStatus(m.scheduledTime, m.durationMins);
                      return (
                        <div key={matchKey} className={`bg-zinc-950 border rounded-xl p-4 space-y-3 ${
                          status === 'live' ? 'border-red-500/40' : 'border-zinc-800'
                        }`}>
                          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                            {m.matchNumber ? `Match ${m.matchNumber}` : 'Match'}
                          </div>
                          {m.scheduledTime && (
                            <TimeBadge iso={m.scheduledTime} duration={m.durationMins} winner={m.winner} />
                          )}

                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs space-y-1.5 flex-1">
                              <div className="flex items-center justify-between">
                                <span className={m.winner === m.team1 ? 'text-cyan-400 font-bold' : 'text-zinc-300'}>{m.team1}</span>
                                {m.winner && <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score1}</span>}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={m.winner === m.team2 ? 'text-cyan-400 font-bold' : 'text-zinc-300'}>{m.team2}</span>
                                {m.winner && <span className="font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{m.score2}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button onClick={() => openResultEditor(group, matchKey)}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] font-black uppercase hover:text-cyan-400 transition-colors">
                                {m.winner ? 'Edit' : 'Score'}
                              </button>
                              <button onClick={() => handleDeleteMatch(group, matchKey)}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] font-black uppercase hover:text-red-400 transition-colors">✕</button>
                            </div>
                          </div>

                          {isEditing && (
                            <div className="border-t border-zinc-800 pt-3 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{m.team1}</label>
                                  <input type="text" value={resultScore1} onChange={e => setResultScore1(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                </div>
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{m.team2}</label>
                                  <input type="text" value={resultScore2} onChange={e => setResultScore2(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                </div>
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Winner</label>
                                <select value={resultWinner} onChange={e => setResultWinner(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white">
                                  <option value="">Select winner</option>
                                  <option value={m.team1}>{m.team1}</option>
                                  <option value={m.team2}>{m.team2}</option>
                                </select>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button onClick={() => handleSaveResult(group, matchKey)}
                                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all">
                                  Save Result
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
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'Knockouts' && (
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">Knockout Stage</h3>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">Quarterfinals</h4>
              <p className="text-[10px] text-zinc-500">Pick the two teams for each quarterfinal yourself — they don't have to follow group order.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['qf1', 'qf2', 'qf3', 'qf4'] as KOStage[]).map((stage, i) => {
                  const s = ko[stage];
                  const winnerOptions = [s.team1, s.team2].filter(Boolean);
                  return (
                    <div key={stage} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                      <h5 className="text-xs font-black uppercase tracking-wider text-zinc-300">Quarterfinal {i + 1}</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={s.team1} onChange={e => updateKo(stage, 'team1', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                          <option value="">Select Team 1</option>
                          {allTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={s.team2} onChange={e => updateKo(stage, 'team2', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                          <option value="">Select Team 2</option>
                          {allTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Match Time</label>
                          <input type="time" value={s.time} onChange={e => updateKo(stage, 'time', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Duration (mins)</label>
                          <select value={s.duration} onChange={e => updateKo(stage, 'duration', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option value="20">20 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="75">75 min</option>
                            <option value="90">90 min</option>
                          </select>
                        </div>
                      </div>
                      {s.time && <TimeBadge iso={s.time} duration={Number(s.duration)} winner={s.winner} />}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{s.team1 || 'Team 1'} Score</label>
                          <input type="text" value={s.score1} onChange={e => updateKo(stage, 'score1', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{s.team2 || 'Team 2'} Score</label>
                          <input type="text" value={s.score2} onChange={e => updateKo(stage, 'score2', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Winner</label>
                        <select value={s.winner} onChange={e => updateKo(stage, 'winner', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white">
                          <option value="">Select winner</option>
                          {winnerOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button onClick={() => handleSaveKnockout(stage)}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                        Save Quarterfinal {i + 1}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">Semifinals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  { stage: 'semi1' as KOStage, label: 'Semifinal 1', teams: semi1Teams },
                  { stage: 'semi2' as KOStage, label: 'Semifinal 2', teams: semi2Teams },
                ]).map(({ stage, label, teams }) => {
                  const s = ko[stage];
                  return (
                    <div key={stage} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                      <h5 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                        {label}{teams.length === 2 ? ` — ${teams[0]} vs ${teams[1]}` : ''}
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Match Time</label>
                          <input type="time" value={s.time} onChange={e => updateKo(stage, 'time', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Duration (mins)</label>
                          <select value={s.duration} onChange={e => updateKo(stage, 'duration', e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                            <option value="20">20 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="75">75 min</option>
                            <option value="90">90 min</option>
                          </select>
                        </div>
                      </div>
                      {s.time && <TimeBadge iso={s.time} duration={Number(s.duration)} winner={s.winner} />}
                      {teams.length < 2 ? (
                        <p className="text-zinc-600 text-[10px] text-center py-3 border border-dashed border-zinc-800 rounded-xl">Waiting on quarterfinal results</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{teams[0]} Score</label>
                              <input type="text" value={s.score1} onChange={e => updateKo(stage, 'score1', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{teams[1]} Score</label>
                              <input type="text" value={s.score2} onChange={e => updateKo(stage, 'score2', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Winner</label>
                            <select value={s.winner} onChange={e => updateKo(stage, 'winner', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs outline-none text-white">
                              <option value="">Select winner</option>
                              {teams.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                      <button onClick={() => handleSaveKnockout(stage)} disabled={teams.length < 2}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                        Save {label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Grand Final</h4>
              <div className="bg-zinc-900 border-2 border-amber-500/30 rounded-2xl p-6 space-y-4">
                <h5 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  🏆 Grand Final{finalTeams.length === 2 ? ` — ${finalTeams[0]} vs ${finalTeams[1]}` : ''}
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Match Time</label>
                    <input type="time" value={ko.final.time} onChange={e => updateKo('final', 'time', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Duration (mins)</label>
                    <select value={ko.final.duration} onChange={e => updateKo('final', 'duration', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                      <option value="20">20 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="75">75 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>
                {ko.final.time && <TimeBadge iso={ko.final.time} duration={Number(ko.final.duration)} winner={ko.final.winner} />}
                {finalTeams.length < 2 ? (
                  <p className="text-zinc-600 text-[10px] text-center py-3 border border-dashed border-zinc-800 rounded-xl">Waiting on semifinal results</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{finalTeams[0]} Score</label>
                        <input type="text" value={ko.final.score1} onChange={e => updateKo('final', 'score1', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{finalTeams[1]} Score</label>
                        <input type="text" value={ko.final.score2} onChange={e => updateKo('final', 'score2', e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Champion</label>
                      <select value={ko.final.winner} onChange={e => updateKo('final', 'winner', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white">
                        <option value="">Select champion</option>
                        {finalTeams.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <button onClick={() => handleSaveKnockout('final')} disabled={finalTeams.length < 2}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                  🏆 Save Grand Final
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Config' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Tournament Configuration</h3>
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
