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
  
  // Match & Config States
  const [matchGroup, setMatchGroup] = useState('Group A');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [matchCustomId, setMatchCustomId] = useState('match1');
  const [youtubeLink, setYoutubeLink] = useState('');

  const availableGroups = ['Group A', 'Group B', 'Group C', 'Group D'];

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    onValue(tourneyRef, (snapshot) => { 
      const data = snapshot.val();
      setTournamentData(data);
      if (data?.config?.streamLink !== undefined) {
        setYoutubeLink(data.config.streamLink);
      }
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
    const standings: Record<string, number> = {};
    teamsRaw.forEach(t => standings[t] = 0);
    matchesRaw.forEach(([_, m]: any) => {
      if (m.winner === m.team1) standings[m.team1] += 3;
      if (m.winner === m.team2) standings[m.team2] += 3;
    });
    const sorted = Object.entries(standings).sort((a,b) => b[1] - a[1]);
    return sorted[0]?.[0] || `1st Place ${groupName}`;
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault(); if (!teamName.trim()) return;
    try {
      const db = getDatabase(app);
      const groupTeamsRef = ref(db, `tournaments/pickleball_may_2026/groups/${selectedGroup}/teams`);
      await push(groupTeamsRef, teamName.trim());
      setTeamName(''); showStatus(`Added "${teamName}"!`);
    } catch { showStatus('Database error.'); }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault(); if (!team1 || !team2 || !matchCustomId.trim()) return;
    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/groups/${matchGroup}/matches/${matchCustomId.trim().toLowerCase()}`), { team1, team2, winner: "" });
      showStatus(`Match created.`);
    } catch { showStatus('Error creating match.'); }
  };

  const handleSetWinner = async (groupName: string, matchId: string, winnerName: string, currentWinner: string) => {
    try {
      const db = getDatabase(app);
      const val = currentWinner === winnerName ? "" : winnerName;
      await set(ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/matches/${matchId}/winner`), val);
      showStatus(val ? 'Winner set!' : 'Match reset.');
    } catch { showStatus('Error.'); }
  };

  const handleSetKnockoutWinner = async (matchKey: string, winnerName: string) => {
    try {
      const db = getDatabase(app);
      const current = tournamentData?.knockouts?.[matchKey]?.winner;
      await set(ref(db, `tournaments/pickleball_may_2026/knockouts/${matchKey}`), {
        winner: current === winnerName ? "" : winnerName
      });
      showStatus(`Knockout bracket updated!`);
    } catch { showStatus('Error updating knockout.'); }
  };

  const handleSaveYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = getDatabase(app);
      await set(ref(db, `tournaments/pickleball_may_2026/config/streamLink`), youtubeLink.trim());
      showStatus('Live stream link updated!');
    } catch { showStatus('Error saving stream link.'); }
  };

  const showStatus = (msg: string) => { setStatusMessage(msg); setTimeout(() => setStatusMessage(''), 3000); };

  const s1Winner = tournamentData?.knockouts?.semi1?.winner || "";
  const s2Winner = tournamentData?.knockouts?.semi2?.winner || "";

  return (
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-10">
      <h1 className="text-3xl font-bold text-amber-400 text-center">Tournament Control Panel</h1>
      {statusMessage && <div className="max-w-md mx-auto text-xs text-center font-bold text-emerald-400 bg-emerald-950/40 py-2 px-4 rounded-xl border border-emerald-500/20">{statusMessage}</div>}

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Stream Link Config */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <h2 className="text-xs font-bold mb-3 uppercase tracking-wide text-zinc-300">📺 Live Stream Link</h2>
          <form onSubmit={handleSaveYoutube} className="flex gap-3">
            <input 
              type="url" 
              placeholder="https://youtube.com/live/..." 
              value={youtubeLink} 
              onChange={(e) => setYoutubeLink(e.target.value)} 
              className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white" 
            />
            <button type="submit" className="py-2 px-6 bg-red-600 hover:bg-red-700 font-bold rounded text-xs transition-colors">Save Link</button>
          </form>
          <p className="text-[10px] text-zinc-500 mt-2">Paste a URL here to display the red "Watch Live Stream" button on the public board. Leave blank and save to hide the button.</p>
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

      {/* Group Scoring Feeds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {availableGroups.map((groupName) => {
          const groupData = tournamentData?.groups?.[groupName];
          const matches = groupData?.matches ? Object.entries(groupData.matches) : [];
          return (
            <div key={groupName} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-3">
              <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1">{groupName}</h3>
              {matches.map(([id, data]: any) => (
                <div key={id} className="text-[11px] bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
                  <div className="text-[9px] text-zinc-500 font-mono">{id.toUpperCase()}</div>
                  <button onClick={() => handleSetWinner(groupName, id, data.team1, data.winner)} className={`w-full text-left p-1 rounded border text-[10px] ${data.winner === data.team1 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 border-transparent'}`}>🥇 {data.team1}</button>
                  <button onClick={() => handleSetWinner(groupName, id, data.team2, data.winner)} className={`w-full text-left p-1 rounded border text-[10px] ${data.winner === data.team2 ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 border-transparent'}`}>🥇 {data.team2}</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Knockout Admin Scorecard Controls */}
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">🏆 Score Knockout Bracket Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[9px] font-mono text-zinc-500 block uppercase">Semifinal 1 (A1 vs C1)</span>
            <button onClick={() => handleSetKnockoutWinner('semi1', getGroupWinner('Group A'))} className={`w-full text-left p-2 rounded text-xs border truncate ${s1Winner === getGroupWinner('Group A') ? 'bg-amber-950 text-amber-400 border-amber-500/40 font-bold' : 'bg-zinc-900 border-transparent text-zinc-400'}`}>
              🚀 {getGroupWinner('Group A')}
            </button>
            <button onClick={() => handleSetKnockoutWinner('semi1', getGroupWinner('Group C'))} className={`w-full text-left p-2 rounded text-xs border truncate ${s1Winner === getGroupWinner('Group C') ? 'bg-amber-950 text-amber-400 border-amber-500/40 font-bold' : 'bg-zinc-900 border-transparent text-zinc-400'}`}>
              🚀 {getGroupWinner('Group C')}
            </button>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[9px] font-mono text-zinc-500 block uppercase">Semifinal 2 (B1 vs D1)</span>
            <button onClick={() => handleSetKnockoutWinner('semi2', getGroupWinner('Group B'))} className={`w-full text-left p-2 rounded text-xs border truncate ${s2Winner === getGroupWinner('Group B') ? 'bg-amber-950 text-amber-400 border-amber-500/40 font-bold' : 'bg-zinc-900 border-transparent text-zinc-400'}`}>
              🚀 {getGroupWinner('Group B')}
            </button>
            <button onClick={() => handleSetKnockoutWinner('semi2', getGroupWinner('Group D'))} className={`w-full text-left p-2 rounded text-xs border truncate ${s2Winner === getGroupWinner('Group D') ? 'bg-amber-950 text-amber-400 border-amber-500/40 font-bold' : 'bg-zinc-900 border-transparent text-zinc-400'}`}>
              🚀 {getGroupWinner('Group D')}
            </button>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-amber-500/20 space-y-2">
            <span className="text-[9px] font-mono text-amber-400 block uppercase font-bold">Grand Championship Final</span>
            <button disabled={!s1Winner} onClick={() => handleSetKnockoutWinner('final', s1Winner)} className={`w-full text-left p-2 rounded text-xs border truncate disabled:opacity-30 ${tournamentData?.knockouts?.final?.winner === s1Winner ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 font-bold' : 'bg-zinc-900 border-transparent text-zinc-400'}`}>
              🏆 {s1Winner || "Waiting for Semi 1..."}
            </button>
            <button disabled={!s2Winner} onClick={() => handleSetKnockoutWinner('final', s2Winner)} className={`w-full text-left p-2 rounded text-xs border truncate disabled:opacity-30 ${tournamentData?.knockouts?.final?.winner === s2Winner ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 font-bold' : 'bg-zinc-900 border-transparent text-zinc-400'}`}>
              🏆 {s2Winner || "Waiting for Semi 2..."}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
