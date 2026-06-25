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
const TOURNEY_PATH = 'tournaments/pickleball_may_2026';

interface Match {
  id: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  winner: string;
}

interface GroupData {
  teams: Record<string, string>;
  matches: Record<string, Omit<Match, 'id'>>;
}

interface TournamentData {
  groups?: Record<string, GroupData>;
  knockouts?: {
    semi1?: { winner: string; score1: string; score2: string };
    semi2?: { winner: string; score1: string; score2: string };
    final?: { winner: string; score1: string; score2: string };
  };
  config?: {
    streamLink?: string;
    championPhotoUrl?: string;
    closingPhotoUrl?: string;
  };
}

export default function TournamentAdmin() {
  const [data, setData] = useState<TournamentData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Group A');

  // Form states — Teams
  const [newTeamName, setNewTeamName] = useState('');

  // Form states — Matches
  const [matchTeam1, setMatchTeam1] = useState('');
  const [matchTeam2, setMatchTeam2] = useState('');

  // Form states — Results
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [resultScore1, setResultScore1] = useState('');
  const [resultScore2, setResultScore2] = useState('');
  const [resultWinner, setResultWinner] = useState('');

  // Form states — Knockouts
  const [semi1Score1, setSemi1Score1] = useState('');
  const [semi1Score2, setSemi1Score2] = useState('');
  const [semi1Winner, setSemi1Winner] = useState('');
  const [semi2Score1, setSemi2Score1] = useState('');
  const [semi2Score2, setSemi2Score2] = useState('');
  const [semi2Winner, setSemi2Winner] = useState('');
  const [finalScore1, setFinalScore1] = useState('');
  const [finalScore2, setFinalScore2] = useState('');
  const [finalWinner, setFinalWinner] = useState('');

  // Form states — Config
  const [streamLink, setStreamLink] = useState('');
  const [championPhoto, setChampionPhoto] = useState('');
  const [closingPhoto, setClosingPhoto] = useState('');

  useEffect(() => {
    const tourneyRef = ref(db, TOURNEY_PATH);
    const unsub = onValue(tourneyRef, (snap) => {
      const val = snap.val() || {};
      setData(val);

      // Hydrate knockout fields
      setSemi1Score1(val.knockouts?.semi1?.score1 || '');
      setSemi1Score2(val.knockouts?.semi1?.score2 || '');
      setSemi1Winner(val.knockouts?.semi1?.winner || '');
      setSemi2Score1(val.knockouts?.semi2?.score1 || '');
      setSemi2Score2(val.knockouts?.semi2?.score2 || '');
      setSemi2Winner(val.knockouts?.semi2?.winner || '');
      setFinalScore1(val.knockouts?.final?.score1 || '');
      setFinalScore2(val.knockouts?.final?.score2 || '');
      setFinalWinner(val.knockouts?.final?.winner || '');

      // Hydrate config
      setStreamLink(val.config?.streamLink || '');
      setChampionPhoto(val.config?.championPhotoUrl || '');
      setClosingPhoto(val.config?.closingPhotoUrl || '');

      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Teams ─────────────────────────────────────────────────────────────────
  const handleAddTeam = async (group: string) => {
    if (!newTeamName.trim()) return;
    const teamsRef = ref(db, `${TOURNEY_PATH}/groups/${group}/teams`);
    await push(teamsRef, newTeamName.trim());
    setNewTeamName('');
  };

  const handleDeleteTeam = async (group: string, teamKey: string) => {
    if (!confirm('Remove this team?')) return;
    await remove(ref(db, `${TOURNEY_PATH}/groups/${group}/teams/${teamKey}`));
  };

  // ── Matches ───────────────────────────────────────────────────────────────
  const handleAddMatch = async (group: string) => {
    if (!matchTeam1.trim() || !matchTeam2.trim()) return;
    const matchesRef = ref(db, `${TOURNEY_PATH}/groups/${group}/matches`);
    await push(matchesRef, {
      team1: matchTeam1.trim(),
      team2: matchTeam2.trim(),
      score1: '',
      score2: '',
      winner: '',
    });
    setMatchTeam1('');
    setMatchTeam2('');
  };

  const handleDeleteMatch = async (group: string, matchKey: string) => {
    if (!confirm('Delete this match?')) return;
    await remove(ref(db, `${TOURNEY_PATH}/groups/${group}/matches/${matchKey}`));
  };

  const handleSaveResult = async (group: string, matchKey: string) => {
    await set(ref(db, `${TOURNEY_PATH}/groups/${group}/matches/${matchKey}`), {
      team1: data.groups?.[group]?.matches?.[matchKey]?.team1 || '',
      team2: data.groups?.[group]?.matches?.[matchKey]?.team2 || '',
      score1: resultScore1,
      score2: resultScore2,
      winner: resultWinner,
    });
    setEditingMatch(null);
  };

  const openResultEditor = (group: string, matchKey: string) => {
    const m = data.groups?.[group]?.matches?.[matchKey];
    setResultScore1(m?.score1 || '');
    setResultScore2(m?.score2 || '');
    setResultWinner(m?.winner || '');
    setEditingMatch(`${group}__${matchKey}`);
  };

  // ── Knockouts ─────────────────────────────────────────────────────────────
  const handleSaveKnockout = async (stage: 'semi1' | 'semi2' | 'final') => {
    const scores: Record<string, { score1: string; score2: string; winner: string }> = {
      semi1: { score1: semi1Score1, score2: semi1Score2, winner: semi1Winner },
      semi2: { score1: semi2Score1, score2: semi2Score2, winner: semi2Winner },
      final: { score1: finalScore1, score2: finalScore2, winner: finalWinner },
    };
    await set(ref(db, `${TOURNEY_PATH}/knockouts/${stage}`), scores[stage]);
    alert(`${stage} saved!`);
  };

  // ── Config ────────────────────────────────────────────────────────────────
  const handleSaveConfig = async () => {
    await set(ref(db, `${TOURNEY_PATH}/config`), {
      streamLink,
      championPhotoUrl: championPhoto,
      closingPhotoUrl: closingPhoto,
    });
    alert('Config saved!');
  };

  // ── Derived data for knockout dropdowns ──────────────────────────────────
  const groupWinners: Record<string, string> = {};
  GROUPS.forEach((g) => {
    const gData = data.groups?.[g];
    const teams = gData?.teams ? Object.values(gData.teams) : [];
    const matches = gData?.matches ? Object.entries(gData.matches) : [];
    const allDone = matches.length > 0 && matches.every(([, m]: any) => m.winner?.trim());
    if (allDone) {
      const map: Record<string, { pts: number; diff: number }> = {};
      teams.forEach(t => { map[t] = { pts: 0, diff: 0 }; });
      matches.forEach(([, m]: any) => {
        if (map[m.team1] && map[m.team2] && m.winner) {
          map[m.team1].diff += Number(m.score1 || 0) - Number(m.score2 || 0);
          map[m.team2].diff += Number(m.score2 || 0) - Number(m.score1 || 0);
          if (m.winner === m.team1) map[m.team1].pts += 3;
          else map[m.team2].pts += 3;
        }
      });
      const sorted = Object.entries(map).sort(([, a], [, b]) => b.pts - a.pts || b.diff - a.diff);
      if (sorted.length) groupWinners[g] = sorted[0][0];
    }
  });

  const semi1Teams = [groupWinners['Group A'], groupWinners['Group C']].filter(Boolean);
  const semi2Teams = [groupWinners['Group B'], groupWinners['Group D']].filter(Boolean);
  const finalTeams = [data.knockouts?.semi1?.winner, data.knockouts?.semi2?.winner].filter(Boolean) as string[];

  const TABS = [...GROUPS, 'Knockouts', 'Config'];

  if (loading) return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 text-xs uppercase tracking-widest animate-pulse">
      Loading tournament data...
    </div>
  );

  return (
    <div className="bg-zinc-950 min-h-screen text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-emerald-400">Tournament Admin</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Pickleball May 2026 — Elite Courts</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── GROUP TABS ── */}
        {GROUPS.includes(activeTab) && (() => {
          const group = activeTab;
          const gData = data.groups?.[group];
          const teams = gData?.teams ? Object.entries(gData.teams) : [];
          const matches = gData?.matches ? Object.entries(gData.matches) : [];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Teams Panel */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">Teams — {group}</h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTeam(group)}
                    placeholder="Team name"
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white"
                  />
                  <button onClick={() => handleAddTeam(group)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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

              {/* Matches Panel */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">Matches — {group}</h3>

                <div className="space-y-2">
                  <select value={matchTeam1} onChange={e => setMatchTeam1(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                    <option value="">Select Team 1</option>
                    {teams.map(([k, n]) => <option key={k} value={n}>{n}</option>)}
                  </select>
                  <select value={matchTeam2} onChange={e => setMatchTeam2(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                    <option value="">Select Team 2</option>
                    {teams.map(([k, n]) => <option key={k} value={n}>{n}</option>)}
                  </select>
                  <button onClick={() => handleAddMatch(group)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                    + Add Match
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {matches.length === 0 ? (
                    <p className="text-zinc-600 text-xs text-center py-6 border border-dashed border-zinc-800 rounded-xl">No matches yet</p>
                  ) : matches.map(([matchKey, m]: any) => {
                    const editKey = `${group}__${matchKey}`;
                    const isEditing = editingMatch === editKey;
                    return (
                      <div key={matchKey} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs space-y-1">
                            <p className={m.winner === m.team1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{m.team1}</p>
                            <p className={m.winner === m.team2 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{m.team2}</p>
                          </div>
                          {m.winner && (
                            <div className="text-right font-mono text-xs text-zinc-400">
                              <p>{m.score1}</p>
                              <p>{m.score2}</p>
                            </div>
                          )}
                          <div className="flex gap-1.5 ml-3">
                            <button onClick={() => openResultEditor(group, matchKey)}
                              className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] font-black uppercase hover:text-emerald-400 transition-colors">
                              {m.winner ? 'Edit' : 'Result'}
                            </button>
                            <button onClick={() => handleDeleteMatch(group, matchKey)}
                              className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] font-black uppercase hover:text-red-400 transition-colors">✕</button>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="border-t border-zinc-800 pt-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{m.team1} score</label>
                                <input type="text" value={resultScore1} onChange={e => setResultScore1(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{m.team2} score</label>
                                <input type="text" value={resultScore2} onChange={e => setResultScore2(e.target.value)}
                                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Winner</label>
                              <select value={resultWinner} onChange={e => setResultWinner(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white">
                                <option value="">Select winner</option>
                                <option value={m.team1}>{m.team1}</option>
                                <option value={m.team2}>{m.team2}</option>
                              </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => handleSaveResult(group, matchKey)}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all">
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
          );
        })()}

        {/* ── KNOCKOUTS TAB ── */}
        {activeTab === 'Knockouts' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">Knockout Stage Results</h3>

            {/* Semifinal 1 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Semifinal 1 — {groupWinners['Group A'] || 'Winner A'} vs {groupWinners['Group C'] || 'Winner C'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{groupWinners['Group A'] || 'Team A1'} Score</label>
                  <input type="text" value={semi1Score1} onChange={e => setSemi1Score1(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{groupWinners['Group C'] || 'Team C1'} Score</label>
                  <input type="text" value={semi1Score2} onChange={e => setSemi1Score2(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Winner</label>
                <select value={semi1Winner} onChange={e => setSemi1Winner(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-white">
                  <option value="">Select winner</option>
                  {semi1Teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleSaveKnockout('semi1')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                Save Semifinal 1
              </button>
            </div>

            {/* Semifinal 2 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Semifinal 2 — {groupWinners['Group B'] || 'Winner B'} vs {groupWinners['Group D'] || 'Winner D'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{groupWinners['Group B'] || 'Team B1'} Score</label>
                  <input type="text" value={semi2Score1} onChange={e => setSemi2Score1(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{groupWinners['Group D'] || 'Team D1'} Score</label>
                  <input type="text" value={semi2Score2} onChange={e => setSemi2Score2(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Winner</label>
                <select value={semi2Winner} onChange={e => setSemi2Winner(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-white">
                  <option value="">Select winner</option>
                  {semi2Teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleSaveKnockout('semi2')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                Save Semifinal 2
              </button>
            </div>

            {/* Final */}
            <div className="bg-zinc-900 border-2 border-amber-500/30 rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">🏆 Grand Final</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{data.knockouts?.semi1?.winner || 'Semi 1 Winner'} Score</label>
                  <input type="text" value={finalScore1} onChange={e => setFinalScore1(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">{data.knockouts?.semi2?.winner || 'Semi 2 Winner'} Score</label>
                  <input type="text" value={finalScore2} onChange={e => setFinalScore2(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Champion</label>
                <select value={finalWinner} onChange={e => setFinalWinner(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs outline-none text-white">
                  <option value="">Select champion</option>
                  {finalTeams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleSaveKnockout('final')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                🏆 Save Grand Final
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {activeTab === 'Config' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Tournament Configuration</h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">YouTube / Stream Link</label>
              <input type="text" value={streamLink} onChange={e => setStreamLink(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Champion Photo URL</label>
              <input type="text" value={championPhoto} onChange={e => setChampionPhoto(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://..." />
              {championPhoto && <img src={championPhoto} className="mt-2 h-24 rounded-xl object-cover border border-zinc-800" alt="preview" />}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Closing Ceremony Photo URL</label>
              <input type="text" value={closingPhoto} onChange={e => setClosingPhoto(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://..." />
              {closingPhoto && <img src={closingPhoto} className="mt-2 h-24 rounded-xl object-cover border border-zinc-800" alt="preview" />}
            </div>

            <button onClick={handleSaveConfig}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
              Save Configuration
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
