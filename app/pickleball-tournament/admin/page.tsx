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

  // Match Form States
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

  // Sync team dropdown inputs when group context swaps
  useEffect(() => {
    const currentGroupTeams = tournamentData?.groups?.[matchGroup]?.teams 
      ? Object.values(tournamentData.groups[matchGroup].teams) as string[] 
      : [];
    setTeam1(currentGroupTeams[0] || '');
    setTeam2(currentGroupTeams[1] || '');
  }, [matchGroup, tournamentData]);

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
      showStatus('Database error writing team.');
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1 || !team2 || !matchCustomId.trim()) return;
    if (team1 === team2) {
      showStatus("Error: A team cannot play against itself.");
      return;
    }
    try {
      const db = getDatabase(app);
      const matchPathRef = ref(db, `tournaments/pickleball_may_2026/groups/${matchGroup}/matches/${matchCustomId.trim().toLowerCase()}`);
      await set(matchPathRef, {
        team1,
        team2,
        winner: ""
      });
      showStatus(`Published ${matchCustomId.toUpperCase()} structure successfully.`);
    } catch (err) {
      showStatus('Failed to generate match structure.');
    }
  };

  // Upgraded handler: Toggles winner selection or clears it completely
  const handleSetWinner = async (groupName: string, matchId: string, winnerName: string, currentWinner: string) => {
    try {
      const db = getDatabase(app);
      const winnerRef = ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/matches/${matchId}/winner`);
      
      // If clicking the team that already won, unselect them (reset match)
      if (currentWinner === winnerName) {
        await set(winnerRef, "");
        showStatus(`Match reset to Pending!`);
      } else {
        await set(winnerRef, winnerName);
        showStatus(`Winner updated to ${winnerName}!`);
      }
    } catch (err) {
      showStatus('Error updating winner.');
    }
  };

  const handleClearMatch = async (groupName: string, matchId: string) => {
    try {
      const db = getDatabase(app);
      const winnerRef = ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/matches/${matchId}/winner`);
      await set(winnerRef, "");
      showStatus(`Match ${matchId.toUpperCase()} completely reset.`);
    } catch (err) {
      showStatus('Error clearing match.');
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-10">
      <h1 className="text-3xl font-bold text-amber-400 text-center tracking-tight">Tournament Control Panel</h1>
      
      {statusMessage && (
        <div className="max-w-md mx-auto text-xs text-center font-bold text-emerald-400 bg-emerald-950/40 py-2.5 px-4 rounded-xl border border-emerald-500/20 shadow-md">
          {statusMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form 1: Team Registration */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm font-bold mb-4 text-zinc-100 uppercase tracking-wide">🔹 Add Registered Team</h2>
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

        {/* Form 2: Match Generation */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-sm font-bold mb-4 text-zinc-100 uppercase tracking-wide">⚔️ Set Group Fixture</h2>
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
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Team 1</label>
                <select value={team1} onChange={(e) => setTeam1(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none">
                  <option value="">-- Choose Team --</option>
                  {tournamentData?.groups?.[matchGroup]?.teams && Object.values(tournamentData.groups[matchGroup].teams).map((name: any) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Team 2</label>
                <select value={team2} onChange={(e) => setTeam2(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none">
                  <option value="">-- Choose Team --</option>
                  {tournamentData?.groups?.[matchGroup]?.teams && Object.values(tournamentData.groups[matchGroup].teams).map((name: any) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-lg text-sm transition text-zinc-950 mt-2">Publish Match</button>
          </form>
        </div>
      </div>

      {/* Control Display Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {availableGroups.map((groupName) => {
          const groupData = tournamentData?.groups?.[groupName];
          const teams = groupData?.teams ? Object.values(groupData.teams) : [];
          const matches = groupData?.matches ? Object.entries(groupData.matches) : [];

          return (
            <div key={groupName} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">{groupName}</h3>
              
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Registered Rosters</span>
                <div className="flex flex-wrap gap-1">
                  {teams.map((name: any) => (
                    <span key={name} className="text-[11px] bg-zinc-950 px-2 py-1 rounded text-zinc-300 border border-zinc-800 font-medium">{name}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-600 block">Record Results</span>
                {matches.map(([id, data]: any) => (
                  <div key={id} className="text-xs bg-zinc-950 p-2.5 rounded-xl text-zinc-400 border border-zinc-800/60 space-y-2">
                    <div className="flex justify-between font-mono text-[10px] text-zinc-500 border-b border-zinc-900 pb-1 items-center">
                      <span>{id.toUpperCase()}</span>
                      {data.winner ? (
                        <button 
                          onClick={() => handleClearMatch(groupName, id)}
                          className="text-[9px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/20 transition"
                        >
                          RESET 🔄
                        </button>
                      ) : (
                        <span className="text-zinc-600">OPEN</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleSetWinner(groupName, id, data.team1, data.winner)}
                        className={`text-left p-1 rounded text-[11px] border transition ${data.winner === data.team1 ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 font-bold' : 'bg-zinc-900 border-transparent text-zinc-300 hover:border-zinc-700'}`}
                      >
                        🥇 {data.team1}
                      </button>
                      <button 
                        onClick={() => handleSetWinner(groupName, id, data.team2, data.winner)}
                        className={`text-left p-1 rounded text-[11px] border transition ${data.winner === data.team2 ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 font-bold' : 'bg-zinc-900 border-transparent text-zinc-300 hover:border-zinc-700'}`}
                      >
                        🥇 {data.team2}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
