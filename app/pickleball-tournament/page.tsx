'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, update, push } from "firebase/database";

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
const db = getDatabase(app);

export default function TournamentAdmin() {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Group A');

  useEffect(() => {
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    const unsubscribe = onValue(tourneyRef, (snapshot) => {
      setTournamentData(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  // Function to easily add a team from a web form
  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const groupTeamsRef = ref(db, `tournaments/pickleball_may_2026/groups/${selectedGroup}/teams`);
    push(groupTeamsRef, newTeamName.trim());
    setNewTeamName('');
  };

  // Function to set a match winner with one click
  const handleSetWinner = (groupName: string, matchId: string, winnerName: string) => {
    const matchRef = ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/matches/${matchId}`);
    update(matchRef, { winner: winnerName });
  };

  return (
    <div className="p-10 text-white bg-zinc-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-amber-400 text-center">Tournament Control Panel</h1>

      {/* Quick Add Team Form */}
      <form onSubmit={handleAddTeam} className="max-w-md mx-auto bg-zinc-900 p-6 rounded-lg border border-zinc-800 mb-10">
        <h2 className="text-lg font-bold mb-4 text-zinc-200">Add New Team</h2>
        <div className="flex flex-col gap-4">
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 p-2 rounded text-white"
          >
            <option value="Group A">Group A</option>
            <option value="Group B">Group B</option>
          </select>
          <input 
            type="text" 
            placeholder="Team Name..." 
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 p-2 rounded text-white"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 font-bold p-2 rounded transition">
            Save Team to Live Site
          </button>
        </div>
      </form>

      {/* Live Match Scorer */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {tournamentData?.groups && Object.entries(tournamentData.groups).map(([groupName, groupData]: [string, any]) => (
          <div key={groupName} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-xl font-bold text-emerald-400 mb-4">{groupName} Matches</h3>
            
            {groupData.matches ? (
              Object.entries(groupData.matches).map(([matchId, match]: [string, any]) => (
                <div key={matchId} className="bg-zinc-800 p-4 rounded-md mb-3 border border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => handleSetWinner(groupName, matchId, match.team1)}
                      className={`px-3 py-1.5 rounded font-medium text-sm transition ${match.winner === match.team1 ? 'bg-emerald-600 text-white font-bold' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                    >
                      🏆 {match.team1} Won
                    </button>
                    <span className="text-xs text-zinc-500 font-bold">VS</span>
                    <button 
                      onClick={() => handleSetWinner(groupName, matchId, match.team2)}
                      className={`px-3 py-1.5 rounded font-medium text-sm transition ${match.winner === match.team2 ? 'bg-emerald-600 text-white font-bold' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                    >
                      🏆 {match.team2} Won
                    </button>
                  </div>
                  {match.winner && (
                    <p className="text-center text-xs text-emerald-400 mt-2 font-semibold">
                      Current Winner: {match.winner}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic">No matches created yet for this group.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
