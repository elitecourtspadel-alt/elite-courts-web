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
  const [selectedGroup, setSelectedGroup] = useState('Group A'); // Dropdown selection
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Explicitly defining our 4 working groups
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
      // Path routes straight to the specific group chosen in the dropdown menu
      const groupTeamsRef = ref(db, `tournaments/pickleball_may_2026/groups/${selectedGroup}/teams`);
      const newTeamRef = push(groupTeamsRef);
      
      await set(newTeamRef, teamName.trim());
      
      setTeamName('');
      setStatusMessage(`Successfully added "${teamName}" to ${selectedGroup}!`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (error) {
      console.error(error);
      setStatusMessage('Error writing to database.');
    }
  };

  return (
    <div className="p-6 sm:p-10 text-white bg-zinc-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-amber-400 text-center tracking-tight">Tournament Control Panel</h1>
      
      {/* Add Team Form */}
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-lg font-semibold mb-4 text-zinc-100">Add New Team</h2>
        <form onSubmit={handleAddTeam} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Select Group</label>
            <select 
              value={selectedGroup} 
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {availableGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Team Name</label>
            <input 
              type="text" 
              placeholder="Enter team name..." 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg text-sm transition duration-200 shadow-md"
          >
            Save Team to Live Site
          </button>
        </form>

        {statusMessage && (
          <p className="mt-4 text-xs text-center font-medium text-emerald-400 bg-emerald-950/30 py-2 px-3 rounded-md border border-emerald-500/20">
            {statusMessage}
          </p>
        )}
      </div>

      {/* Admin Status Overview Grid - Render all 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {availableGroups.map((groupName) => {
          const groupData = tournamentData?.groups?.[groupName];
          return (
            <div key={groupName} className="bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-xl">
              <h3 className="font-bold text-sm text-zinc-400 mb-3 uppercase tracking-wider border-b border-zinc-800 pb-2">{groupName}</h3>
              <ul className="space-y-1.5">
                {groupData?.teams ? (
                  Object.entries(groupData.teams).map(([id, name]: [string, any]) => (
                    <li key={id} className="text-xs bg-zinc-900 px-3 py-2 rounded text-zinc-300 border border-zinc-800">
                      {name}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-zinc-600 italic">No matches created yet for this group.</p>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
