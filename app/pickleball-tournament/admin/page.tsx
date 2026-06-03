'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, set, onValue } from "firebase/database";

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

export default function TournamentAdmin() {
  const [teamName, setTeamName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Group A');
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [matchGroup, setMatchGroup] = useState('Group A');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [matchCustomId, setMatchCustomId] = useState('match1');
  const [youtubeLink, setYoutubeLink] = useState('');

  // Local state map for writing scores smoothly
  const [inputScores, setInputScores] = useState<Record<string, { s1: string; s2: string }>>({});

  const availableGroups = ['Group A', 'Group B', 'Group C', 'Group D'];

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    onValue(tourneyRef, (snapshot) => { 
      const data = snapshot.val();
      setTournamentData(data);
      if (data?.config?.streamLink !== undefined) setYoutubeLink(data.config.streamLink);
    });
  }, []);

  useEffect(() => {
    const currentGroupTeams = tournamentData?.groups?.[matchGroup]?.teams 
      ? Object.values(tournamentData.groups[matchGroup].teams) as string[] 
      : [];
    setTeam1(currentGroupTeams[0] || ''); setTeam2(currentGroupTeams[1] || '');
  }, [matchGroup, tournamentData]);

  const getGroupWinner = (groupName: string): string => {
    const groupData = tournamentData?.groups?.[groupName];
    const teamsRaw = groupData?.teams ? Object.values(groupData.teams) as string[] : [];
    const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];
    const standings: Record<string, { pts: number; diff: number }> = {};
    teamsRaw.forEach(t => standings[t] = { pts: 0, diff: 0 });
    
    matchesRaw.forEach(([_, m]: any) => {
      const s1 = Number(m.score1 || 0); const s2 = Number(m.score2 || 0);
      if (m.winner === m.team1) { standings[m.team1].pts += 3; }
      if (m.winner === m.team2) { standings[m.team2].pts += 3; }
      if (m.winner) {
        standings[m.team1].diff += (s1 - s2);
        standings[m.team2].diff += (s2 - s1);
      }
    });
    const sorted = Object.entries(standings).sort((a,b) => b[1].pts - a[1].pts || b[1].diff - a[1].diff);
    return sorted[0]?.[0] || `1st Place ${groupName}`;
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault(); if (!teamName.trim()) return;
    try {
      const db = getDatabase(app);
      await push(ref(db, `tournaments/pickleball_may_2026/groups/${selectedGroup}/teams`), teamName.trim());
      setTeamName(''); showStatus(`Added "${teamName}"!`);
    } catch { showStatus('Database error.'); }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault(); if (!team1 || !team2 || !matchCustomId.trim()) return;
    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/groups/${matchGroup}/matches/${matchCustomId.trim().toLowerCase()}`), { team1, team2, winner: "", score1: 0, score2: 0 });
      showStatus(`Match created.`);
    } catch { showStatus('Error creating match.'); }
  };

  // Score publisher helper logic
  const handleSaveMatchScore = async (groupName: string, matchId: string, t1Name: string, t2Name: string) => {
    const s1Str = inputScores[`${groupName}-${matchId}-1`] || "";
    const s2Str = inputScores[`${groupName}-${matchId}-2`] || "";
    if (!s1Str || !s2Str) { showStatus("Please enter scores for both teams"); return; }
    
    const s1 = parseInt(s1Str); const s2 = parseInt(s2Str);
    if (isNaN(s1) || isNaN(s2)) return;
    const winner = s1 > s2 ? t1Name : s2 > s1 ? t2Name : "";

    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/matches/${matchId}`), {
        team1: t1Name, team2: t2Name, winner, score1: s1, score2: s2
      });
      showStatus("Score locked in!");
    } catch { showStatus("Error saving score."); }
  };

  const handleResetMatch = async (groupName: string, matchId: string, t1Name: string, t2Name: string) => {
    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/matches/${matchId}`), {
        team1: t1Name, team2: t2Name, winner: "", score1: 0, score2: 0
      });
      setInputScores(prev => ({...prev, [`${groupName}-${matchId}-1`]: "", [`${groupName}-${matchId}-2`]: ""}));
      showStatus("Match reset complete.");
    } catch { showStatus("Error resetting."); }
  };

  const handleSaveKnockoutScore = async (matchKey: string, t1Name: string, t2Name: string) => {
    const s1Str = inputScores[`ko-${matchKey}-1`] || "";
    const s2Str = inputScores[`ko-${matchKey}-2`] || "";
    if (!s1Str || !s2Str) { showStatus("Enter both scores"); return; }
    
    const s1 = parseInt(s1Str); const s2 = parseInt(s2Str);
    const winner = s1 > s2 ? t1Name : s2 > s1 ? t2Name : "";

    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/knockouts/${matchKey}`), {
        winner, score1: s1, score2: s2
      });
      showStatus("Bracket card saved.");
    } catch { showStatus("Error."); }
  };

  const handleResetKnockout = async (matchKey: string) => {
    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/knockouts/${matchKey}`), { winner: "", score1: 0, score2: 0 });
      setInputScores(prev => ({...prev, [`ko-${matchKey}-1`]: "", [`ko-${matchKey}-2`]: ""}));
      showStatus("Knockout slot reset.");
    } catch { showStatus("Error resetting."); }
  };

  const handleSaveYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await set(ref(getDatabase(app), `tournaments/pickleball_may_2026/config/streamLink`), youtubeLink.trim()); showStatus('Live stream link updated!'); } catch { showStatus('Error.'); }
  };

  const showStatus = (msg: string) => { setStatusMessage(msg); setTimeout(() => setStatusMessage(''), 3000); };

  const s1Winner = tournamentData?.knockouts?.semi1?.winner || "";
  const s2Winner = tournamentData?.knockouts?.semi2?.winner || "";

  return (
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-10">
      <h1 className="text-3xl font-bold text-amber-400 text-center">Tournament Control Panel</h1>
      {statusMessage && <div className="max-w-md mx-auto text-xs text-center font-bold text-emerald-400 bg-emerald-950/40 py-2 px-4 rounded-xl border border-emerald-500/20">{statusMessage}</div>}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Stream Config */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <h2 className="text-xs font-bold mb-3 uppercase tracking-wide text-zinc-300">📺 Live Stream Link</h2>
          <form onSubmit={handleSaveYoutube} className="flex gap-3">
            <input type="url" placeholder="https://youtube.com/live/..." value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white" />
            <button type="submit" className="py-2 px-6 bg-red-600 hover:bg-red-700 font-bold rounded text-xs transition-colors">Save Link</button>
          </form>
        </div>

        {/* Entry Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
            <h2 className="text-xs font-bold mb-3 uppercase tracking-wide text-zinc-300">🔹 Add Team</h2>
            <form onSubmit={handleAddTeam} className="space-y-3">
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs">{availableGroups.map(g => <option key={g} value={g}>{g}</option>)}</select>
              <input type="text" placeholder="Team name..." value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs" />
              <button type="submit" className="w-full py-2 bg-emerald-600 font-bold rounded text-xs">Save Team</button>
            </form>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
            <h2 className="text-xs font-bold mb-3 uppercase tracking-wide text-zinc-300">⚔️ Set Group Fixture</h2>
            <form onSubmit={handleCreateMatch} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select value={matchGroup} onChange={(e) => setMatchGroup(e.target.value)} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-xs">{availableGroups.map(g => <option key={g} value={g}>{g}</option>)}</select>
                <input type="text" value={matchCustomId} onChange={(e) => setMatchCustomId(e.target.value)} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={team1} onChange={(e) => setTeam1(e.target.value)} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-xs"><option value="">-- Team 1 --</option>{tournamentData?.groups?.[matchGroup]?.teams && Object.values(tournamentData.groups[matchGroup].teams).map((n: any) => <option key={n} value={n}>{n}</option>)}</select>
                <select value={team2} onChange={(e) => setTeam2(e.target.value)} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-xs"><option value="">-- Team 2 --</option>{tournamentData?.groups?.[matchGroup]?.teams && Object.values(tournamentData.groups[matchGroup].teams).map((n: any) => <option key={n} value={n}>{n}</option>)}</select>
              </div>
              <button type="submit" className="w-full py-2 bg-amber-500 font-bold text-zinc-950 rounded text-xs mt-1">Publish Match</button>
            </form>
          </div>
        </div>
      </div>

      {/* Group Scorecard Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {availableGroups.map((groupName) => {
          const groupData = tournamentData?.groups?.[groupName];
          const matches = groupData?.matches ? Object.entries(groupData.matches) : [];
          return (
            <div key={groupName} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-4">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1">{groupName}</h3>
              {matches.map(([id, data]: any) => (
                <div key={id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>{id.toUpperCase()}</span>
                    {data.winner && <span className="text-emerald-400">Score Locked ({data.score1}-{data.score2})</span>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs truncate text-zinc-300 flex-1">{data.team1}</span>
                      <input type="number" placeholder="Score" value={inputScores[`${groupName}-${id}-1`] ?? (data.winner ? data.score1 : "")} onChange={(e) => setInputScores({...inputScores, [`${groupName}-${id}-1`]: e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center text-xs" />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs truncate text-zinc-300 flex-1">{data.team2}</span>
                      <input type="number" placeholder="Score" value={inputScores[`${groupName}-${id}-2`] ?? (data.winner ? data.score2 : "")} onChange={(e) => setInputScores({...inputScores, [`${groupName}-${id}-2`]: e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSaveMatchScore(groupName, id, data.team1, data.team2)} className="flex-1 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">Lock</button>
                    <button onClick={() => handleResetMatch(groupName, id, data.team1, data.team2)} className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-[10px]">Reset</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Knockout Bracket Control Scorecards */}
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">🏆 Score Knockout Bracket Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Semi 1 */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <span className="text-[9px] font-mono text-zinc-500 block uppercase">Semifinal 1 (A1 vs C1)</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center gap-2">
                <span className="truncate flex-1">{getGroupWinner('Group A')}</span>
                <input type="number" placeholder="Score" value={inputScores['ko-semi1-1'] ?? (tournamentData?.knockouts?.semi1?.winner ? tournamentData.knockouts.semi1.score1 : "")} onChange={(e) => setInputScores({...inputScores, 'ko-semi1-1': e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center" />
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="truncate flex-1">{getGroupWinner('Group C')}</span>
                <input type="number" placeholder="Score" value={inputScores['ko-semi1-2'] ?? (tournamentData?.knockouts?.semi1?.winner ? tournamentData.knockouts.semi1.score2 : "")} onChange={(e) => setInputScores({...inputScores, 'ko-semi1-2': e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => handleSaveKnockoutScore('semi1', getGroupWinner('Group A'), getGroupWinner('Group C'))} className="flex-1 py-1 bg-amber-500 text-zinc-950 font-bold text-[10px] rounded">Lock</button>
              <button onClick={() => handleResetKnockout('semi1')} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] rounded">Reset</button>
            </div>
          </div>

          {/* Semi 2 */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <span className="text-[9px] font-mono text-zinc-500 block uppercase">Semifinal 2 (B1 vs D1)</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center gap-2">
                <span className="truncate flex-1">{getGroupWinner('Group B')}</span>
                <input type="number" placeholder="Score" value={inputScores['ko-semi2-1'] ?? (tournamentData?.knockouts?.semi2?.winner ? tournamentData.knockouts.semi2.score1 : "")} onChange={(e) => setInputScores({...inputScores, 'ko-semi2-1': e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center" />
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="truncate flex-1">{getGroupWinner('Group D')}</span>
                <input type="number" placeholder="Score" value={inputScores['ko-semi2-2'] ?? (tournamentData?.knockouts?.semi2?.winner ? tournamentData.knockouts.semi2.score2 : "")} onChange={(e) => setInputScores({...inputScores, 'ko-semi2-2': e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => handleSaveKnockoutScore('semi2', getGroupWinner('Group B'), getGroupWinner('Group D'))} className="flex-1 py-1 bg-amber-500 text-zinc-950 font-bold text-[10px] rounded">Lock</button>
              <button onClick={() => handleResetKnockout('semi2')} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] rounded">Reset</button>
            </div>
          </div>

          {/* Finals */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/20 space-y-3">
            <span className="text-[9px] font-mono text-amber-400 block uppercase font-bold">Championship Final</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center gap-2">
                <span className="truncate flex-1 text-zinc-400">{s1Winner || "Semi 1 Winner"}</span>
                <input disabled={!s1Winner || !s2Winner} type="number" placeholder="Score" value={inputScores['ko-final-1'] ?? (tournamentData?.knockouts?.final?.winner ? tournamentData.knockouts.final.score1 : "")} onChange={(e) => setInputScores({...inputScores, 'ko-final-1': e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center disabled:opacity-20" />
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="truncate flex-1 text-zinc-400">{s2Winner || "Semi 2 Winner"}</span>
                <input disabled={!s1Winner || !s2Winner} type="number" placeholder="Score" value={inputScores['ko-final-2'] ?? (tournamentData?.knockouts?.final?.winner ? tournamentData.knockouts.final.score2 : "")} onChange={(e) => setInputScores({...inputScores, 'ko-final-2': e.target.value})} className="w-12 p-1 bg-zinc-900 border border-zinc-700 rounded text-center disabled:opacity-20" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button disabled={!s1Winner || !s2Winner} onClick={() => handleSaveKnockoutScore('final', s1Winner, s2Winner)} className="flex-1 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded disabled:opacity-20">Lock Final</button>
              <button onClick={() => handleResetKnockout('final')} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] rounded">Reset</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
