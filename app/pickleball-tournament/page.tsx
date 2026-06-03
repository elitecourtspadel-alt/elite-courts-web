'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

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

export default function TournamentView() {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Define explicitly the 4 groups we want to render permanently
  const requiredGroups = ['Group A', 'Group B', 'Group C', 'Group D'];

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    
    const unsubscribe = onValue(tourneyRef, (snapshot) => {
      setTournamentData(snapshot.val());
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 sm:p-10 text-white bg-zinc-950 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-emerald-400 text-center tracking-tight">Elite Courts Tournament</h1>
      <p className="text-center text-zinc-400 text-sm mb-8">14 Teams — 4 Groups Stages</p>
      
      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading brackets...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {requiredGroups.map((groupName) => {
            // Safe-check to extract team data if it exists for this key
            const groupData = tournamentData?.groups?.[groupName];
            const teamList = groupData?.teams ? Object.entries(groupData.teams) : [];

            return (
              <div key={groupName} className="bg-zinc-900 border border-emerald-500/20 p-5 rounded-xl shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                    <h2 className="text-lg font-bold text-emerald-300">{groupName}</h2>
                    <span className="text-xs text-zinc-500 font-mono">
                      {teamList.length} Teams
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {teamList.length > 0 ? (
                      teamList.map(([teamId, teamName]: [string, any]) => (
                        <li key={teamId} className="bg-zinc-800/60 border border-zinc-700/30 p-3 rounded-lg text-sm text-zinc-100 font-medium transition-all hover:border-emerald-500/30">
                          {teamName}
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 py-6 italic text-center">No teams registered yet.</p>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
