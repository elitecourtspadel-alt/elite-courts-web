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

  // States for Match Generation
  const [matchGroup, setMatchGroup] = useState('Group A');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [matchCustomId, setMatchCustomId] = useState('match1');

  const availableGroups = ['Group A', 'Group B', 'Group C', 'Group D'];

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    onValue(tourneyRef, (snapshot) => {
      setTournamentData(snapshot.val());
    });
  }, []);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    try {
      const db = getDatabase(app);
      const groupTeamsRef = ref(db, `tournaments/pickleball_may_2026/groups/${selectedGroup}/teams`);
      const newTeamRef = push(groupTeamsRef);
      await set(newTeamRef, teamName.trim());
      setTeamName('');
      showStatus(`Added "${teamName}" to ${selectedGroup}!`);
    } catch (error) {
      showStatus('Database write error.');
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1.trim() || !team2.trim() || !matchCustomId.trim()) return;
    try {
      const db = getDatabase(app);
      // Constructing exact JSON structure as your backend schema
      const matchPathRef = ref(db, `tournaments/pickleball_may_2026/groups/${matchGroup}/matches/${matchCustomId.trim().toLowerCase()}`);
      await set(matchPathRef, {
        team1: team1.trim(),
        team2: team2.trim(),
        winner: ""
      });
      setTeam1('');
      setTeam2('');
      showStatus(`Created fixture ${matchCustomId.toUpperCase()} in ${matchGroup}!`);
    } catch (err) {
      showStatus('Failed to create match fixture.');
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="p-6 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-10">
      <h1 className="text-3xl font-bold text-amber-400 text-center tracking-tight">Tournament Control Panel</h1>
      
      {statusMessage && (
        <div className="max-w-md mx-auto text-xs text-center font-medium text-emerald-400 bg-emerald-950/40 py-2.5 px-4 rounded-xl border border-emerald-500/20 shadow-md">
          {statusMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form 1: Team Addition */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-md font-bold mb-4 text-zinc-100 flex items-center gap-2">🔹 Add Registered Team</h2>
          <form onSubmit={handleAddTeam} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Select Group</label>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none">
                {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Team Name</label>
              <input type="text" placeholder="Enter team name..." value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg text-sm transition">Save Team</button>
          </form>
        </div>

        {/* Form 2: Match Generation matching backend json structure */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-md font-bold mb-4 text-zinc-100 flex items-center gap-2">⚔️ Generate Match Fixture</h2>
          <form onSubmit={handleCreateMatch} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Group Context</label>
                <select value={matchGroup} onChange={(e) => setMatchGroup(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none">
                  {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Match Index ID</label>
                <input type="text" placeholder="e.g. match1" value={matchCustomId} onChange={(e) => setMatchCustomId(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Team 1 Name</label>
                <input type="text" placeholder="Team A" value={team1} onChange={(e) => setTeam1(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Team 2 Name</label>
                <input type="text" placeholder="Team B" value={team2} onChange={(e) => setTeam2(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-lg text-sm transition text-zinc-950 mt-2">Publish Match</button>
          </form>
        </div>
      </div>

      {/* Roster Overview Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 max-w-7xl mx-auto">
        {availableGroups.map((groupName) => {
          const groupData = tournamentData?.groups?.[groupName];
          const teams = groupData?.teams ? Object.entries(groupData.teams) : [];
          const matches = groupData?.matches ? Object.entries(groupData.matches) : [];

          return (
            <div key={groupName} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">{groupName}</h3>
              
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Teams ({teams.length})</span>
                <ul className="space-y-1">
                  {teams.map(([id, name]: any) => (
                    <li key={id} className="text-xs bg-zinc-950 px-2 py-1 rounded text-zinc-300 border border-zinc-800 font-medium">{name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Active Matches ({matches.length})</span>
                <ul className="space-y-1">
                  {matches.map(([id, data]: any) => (
                    <li key={id} className="text-[11px] bg-zinc-950/80 px-2 py-1.5 rounded text-zinc-400 border border-zinc-800/40 flex justify-between">
                      <span>{data.team1} vs {data.team2}</span>
                      {data.winner && <span className="text-emerald-400 font-bold">✓</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
