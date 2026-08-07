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
const TOURNEY_PATH = 'tournaments/pickleball_season_2';

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
    heroBackgroundUrl?: string;
  };
}

export default function PickleballSeason2Admin() {
  const [data, setData] = useState<TournamentData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Group A');
  const [saved, setSaved] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [matchTeam1, setMatchTeam1] = useState('');
  const [matchTeam2, setMatchTeam2] = useState('');

  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [resultScore1, setResultScore1] = useState('');
  const [resultScore2, setResultScore2] = useState('');
  const [resultWinner, setResultWinner] = useState('');

  const [semi1Score1, setSemi1Score1] = useState('');
  const [semi1Score2, setSemi1Score2] = useState('');
  const [semi1Winner, setSemi1Winner] = useState('');
  const [semi2Score1, setSemi2Score1] = useState('');
  const [semi2Score2, setSemi2Score2] = useState('');
  const [semi2Winner, setSemi2Winner] = useState('');
  const [finalScore1, setFinalScore1] = useState('');
  const [finalScore2, setFinalScore2] = useState('');
  const [finalWinner, setFinalWinner] = useState('');

  const [streamLink, setStreamLink] = useState('');
  const [championPhoto, setChampionPhoto] = useState('');
  const [closingPhoto, setClosingPhoto] = useState('');
  const [heroBackground, setHeroBackground] = useState('');

  const showSaved = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  useEffect(() => {
    const tourneyRef = ref(db, TOURNEY_PATH);
    const unsub = onValue(tourneyRef, (snap) => {
      const val = snap.val() || {};
      setData(val);

      setSemi1Score1(val.knockouts?.semi1?.score1 || '');
      setSemi1Score2(val.knockouts?.semi1?.score2 || '');
      setSemi1Winner(val.knockouts?.semi1?.winner || '');
      setSemi2Score1(val.knockouts?.semi2?.score1 || '');
      setSemi2Score2(val.knockouts?.semi2?.score2 || '');
      setSemi2Winner(val.knockouts?.semi2?.winner || '');
      setFinalScore1(val.knockouts?.final?.score1 || '');
      setFinalScore2(val.knockouts?.final?.score2 || '');
      setFinalWinner(val.knockouts?.final?.winner || '');

      setStreamLink(val.config?.streamLink || '');
      setChampionPhoto(val.config?.championPhotoUrl || '');
      setClosingPhoto(val.config?.closingPhotoUrl || '');
      setHeroBackground(val.config?.heroBackgroundUrl || '');

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
    await push(ref(db, `${TOURNEY_PATH}/groups/${group}/matches`), {
      team1: matchTeam1.trim(), team2: matchTeam2.trim(),
      score1: '', score2: '', winner: '',
    });
    setMatchTeam1(''); setMatchTeam2('');
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

  const handleSaveKnockout = async (stage: 'semi1' | 'semi2' | 'final') => {
    const payloads: Record<string, any> = {
      semi1: { score1: semi1Score1, score2: semi1Score2, winner: semi1Winner },
      semi2: { score1: semi2Score1, score2: semi2Score2, winner: semi2Winner },
      final: { score1: finalScore1, score2: finalScore2, winner: finalWinner },
    };
    await set(ref(db, `${TOURNEY_PATH}/knockouts/${stage}`), payloads[stage]);
    showSaved(`${stage === 'final' ? 'Grand Final' : stage} saved`);
  };

  const handleSaveConfig = async () => {
    await set(ref(db, `${TOURNEY_PATH}/config`), {
      streamLink, championPhotoUrl: championPhoto, closingPhotoUrl: closingPhoto,
      heroBackgroundUrl: heroBackground,
    });
    showSaved('Config saved');
  };

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
    <div className="bg-slate-950 min-h-screen flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest animate-pulse">
      Loading Pickleball Season 2 data...
    </div>
  );

  return (
    <div className="relative bg-slate-950 min-h-screen text-white p-6 md:p-10 font-sans overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative max-w-5xl mx-auto space-y-8">

        <div className="border-b border-white/10 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-300 bg-fuchsia-400/10 border border-fuchsia-400/30 px-2.5 py-1 rounded-full">Pickleball</span>
              <span className="text-[10px] text-slate-500 font-mono">Season 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-fuchsia-300 via-white to-amber-300 bg-clip-text text-transparent">
              Season 2 Admin
            </h1>
            <p className="text-slate-500 text-xs mt-1">Elite Courts Pickleball — Season 2</p>
          </div>
          {saved && (
            <div className="bg-fuchsia-400/10 border border-fuchsia-400/30 text-fuchsia-300 text-xs font-bold px-4 py-2 rounded-xl animate-pulse">
              ✓ {saved}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? tab === 'Knockouts' ? 'bg-amber-400 text-slate-950'
                  : tab === 'Config' ? 'bg-slate-300 text-slate-950'
                  : 'bg-fuchsia-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
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
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_40px_-16px_rgba(232,121,249,0.15)]">
                  <h3 className="text-xs font-black uppercase tracking-wider text-fuchsia-300 mb-4">Live Standings — {group}</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2 text-left pl-2">#</th>
                        <th className="py-2 text-left">Team</th>
                        <th className="py-2 text-center">P</th>
                        <th className="py-2 text-center text-emerald-400">W</th>
                        <th className="py-2 text-center text-rose-400">L</th>
                        <th className="py-2 text-center text-slate-300">Diff</th>
                        <th className="py-2 text-right pr-2 text-amber-300">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedStandings.map((row, idx) => (
                        <tr key={row.name} className={idx === 0 ? 'bg-fuchsia-400/5' : ''}>
                          <td className="py-2.5 pl-2 font-mono text-slate-600 font-bold">{idx + 1}</td>
                          <td className="py-2.5 font-semibold text-slate-100">
                            <div className="flex items-center gap-2">
                              {idx === 0 && <span className="text-[9px] bg-fuchsia-400/20 text-fuchsia-300 border border-fuchsia-400/30 px-1.5 py-0.5 rounded-full font-black uppercase">Leader</span>}
                              {row.name}
                            </div>
                          </td>
                          <td className="py-2.5 text-center text-slate-400 font-mono">{row.p}</td>
                          <td className="py-2.5 text-center text-emerald-400 font-mono">{row.w}</td>
                          <td className="py-2.5 text-center text-slate-500 font-mono">{row.l}</td>
                          <td className={`py-2.5 text-center font-mono font-medium ${row.diff > 0 ? 'text-fuchsia-300' : row.diff < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                            {row.diff > 0 ? `+${row.diff}` : row.diff}
                          </td>
                          <td className="py-2.5 text-right pr-2 text-amber-300 font-mono font-bold">{row.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-fuchsia-300">Teams — {group}</h3>
                  <div className="flex gap-2">
                    <input type="text" value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTeam(group)}
                      placeholder="Team name"
                      className="flex-1 bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder:text-slate-600" />
                    <button onClick={() => handleAddTeam(group)}
                      className="bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {teams.length === 0 ? (
                      <p className="text-slate-600 text-xs text-center py-6 border border-dashed border-white/10 rounded-xl">No teams yet</p>
                    ) : teams.map(([key, name]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-950/60 border border-white/10 px-4 py-2.5 rounded-xl">
                        <span className="text-xs font-semibold text-slate-200">{name}</span>
                        <button onClick={() => handleDeleteTeam(group, key)}
                          className="text-slate-600 hover:text-rose-400 text-xs font-bold transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-fuchsia-300">Matches — {group}</h3>
                  <div className="space-y-2">
                    <select value={matchTeam1} onChange={e => setMatchTeam1(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                      <option value="">Select Team 1</option>
                      {teams.map(([k, n]) => <option key={k} value={n}>{n}</option>)}
                    </select>
                    <select value={matchTeam2} onChange={e => setMatchTeam2(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                      <option value="">Select Team 2</option>
                      {teams.map(([k, n]) => <option key={k} value={n}>{n}</option>)}
                    </select>
                    <button onClick={() => handleAddMatch(group)}
                      className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                      + Add Match
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {matches.length === 0 ? (
                      <p className="text-slate-600 text-xs text-center py-6 border border-dashed border-white/10 rounded-xl">No matches yet</p>
                    ) : matches.map(([matchKey, m]: any) => {
                      const editKey = `${group}__${matchKey}`;
                      const isEditing = editingMatch === editKey;
                      return (
                        <div key={matchKey} className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs space-y-1">
                              <p className={m.winner === m.team1 ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{m.team1}</p>
                              <p className={m.winner === m.team2 ? 'text-fuchsia-300 font-bold' : 'text-slate-300'}>{m.team2}</p>
                            </div>
                            {m.winner && (
                              <div className="text-right font-mono text-xs text-slate-400">
                                <p>{m.score1}</p>
                                <p>{m.score2}</p>
                              </div>
                            )}
                            <div className="flex gap-1.5 ml-3">
                              <button onClick={() => openResultEditor(group, matchKey)}
                                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:text-fuchsia-300 transition-colors">
                                {m.winner ? 'Edit' : 'Result'}
                              </button>
                              <button onClick={() => handleDeleteMatch(group, matchKey)}
                                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:text-rose-400 transition-colors">✕</button>
                            </div>
                          </div>

                          {isEditing && (
                            <div className="border-t border-white/10 pt-3 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{m.team1} score</label>
                                  <input type="text" value={resultScore1} onChange={e => setResultScore1(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-400 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{m.team2} score</label>
                                  <input type="text" value={resultScore2} onChange={e => setResultScore2(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-400 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono" />
                                </div>
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Winner</label>
                                <select value={resultWinner} onChange={e => setResultWinner(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-400 rounded-lg px-3 py-1.5 text-xs outline-none text-white">
                                  <option value="">Select winner</option>
                                  <option value={m.team1}>{m.team1}</option>
                                  <option value={m.team2}>{m.team2}</option>
                                </select>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button onClick={() => handleSaveResult(group, matchKey)}
                                  className="flex-1 bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all">
                                  Save Result
                                </button>
                                <button onClick={() => setEditingMatch(null)}
                                  className="px-4 bg-white/5 hover:bg-white/10 text-slate-400 py-2 rounded-lg text-xs font-black uppercase transition-all">
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
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">Knockout Stage Results</h3>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Semifinal 1 — {groupWinners['Group A'] || 'Winner A'} vs {groupWinners['Group C'] || 'Winner C'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{groupWinners['Group A'] || 'Team A1'} Score</label>
                  <input type="text" value={semi1Score1} onChange={e => setSemi1Score1(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{groupWinners['Group C'] || 'Team C1'} Score</label>
                  <input type="text" value={semi1Score2} onChange={e => setSemi1Score2(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Winner</label>
                <select value={semi1Winner} onChange={e => setSemi1Winner(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs outline-none text-white">
                  <option value="">Select winner</option>
                  {semi1Teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleSaveKnockout('semi1')}
                className="w-full bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                Save Semifinal 1
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Semifinal 2 — {groupWinners['Group B'] || 'Winner B'} vs {groupWinners['Group D'] || 'Winner D'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{groupWinners['Group B'] || 'Team B1'} Score</label>
                  <input type="text" value={semi2Score1} onChange={e => setSemi2Score1(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{groupWinners['Group D'] || 'Team D1'} Score</label>
                  <input type="text" value={semi2Score2} onChange={e => setSemi2Score2(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Winner</label>
                <select value={semi2Winner} onChange={e => setSemi2Winner(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs outline-none text-white">
                  <option value="">Select winner</option>
                  {semi2Teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleSaveKnockout('semi2')}
                className="w-full bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                Save Semifinal 2
              </button>
            </div>

            <div className="relative bg-gradient-to-br from-amber-500/10 via-white/5 to-fuchsia-400/10 backdrop-blur-xl border-2 border-amber-400/30 rounded-3xl p-6 space-y-4 shadow-[0_8px_50px_-16px_rgba(251,191,36,0.3)]">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">🏆 Grand Final</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{data.knockouts?.semi1?.winner || 'Semi 1 Winner'} Score</label>
                  <input type="text" value={finalScore1} onChange={e => setFinalScore1(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{data.knockouts?.semi2?.winner || 'Semi 2 Winner'} Score</label>
                  <input type="text" value={finalScore2} onChange={e => setFinalScore2(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs outline-none text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Champion</label>
                <select value={finalWinner} onChange={e => setFinalWinner(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs outline-none text-white">
                  <option value="">Select champion</option>
                  {finalTeams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button onClick={() => handleSaveKnockout('final')}
                className="w-full bg-gradient-to-r from-amber-400 to-fuchsia-400 hover:opacity-90 text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                🏆 Save Grand Final
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Config' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Tournament Configuration</h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Hero Background Photo URL</label>
              <input type="text" value={heroBackground} onChange={e => setHeroBackground(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://... (shown behind the public page header)" />
              {heroBackground && (
                <div className="mt-2 h-28 rounded-xl overflow-hidden border border-white/10 relative">
                  <img src={heroBackground} className="w-full h-full object-cover" alt="hero preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">YouTube / Stream Link</label>
              <input type="text" value={streamLink} onChange={e => setStreamLink(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Champion Photo URL</label>
              <input type="text" value={championPhoto} onChange={e => setChampionPhoto(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://..." />
              {championPhoto && <img src={championPhoto} className="mt-2 h-24 rounded-xl object-cover border border-white/10" alt="preview" />}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Closing Ceremony Photo URL</label>
              <input type="text" value={closingPhoto} onChange={e => setClosingPhoto(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 focus:border-fuchsia-400 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono"
                placeholder="https://..." />
              {closingPhoto && <img src={closingPhoto} className="mt-2 h-24 rounded-xl object-cover border border-white/10" alt="preview" />}
            </div>

            <button onClick={handleSaveConfig}
              className="w-full bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
              Save Configuration
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
