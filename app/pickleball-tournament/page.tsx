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
  appId: "1:409782502952:web:64dbbd439a740a312c571d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default function TournamentView() {
  const [tournamentData, setTournamentData] = useState<any>(null);

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    
    const unsubscribe = onValue(tourneyRef, (snapshot) => {
      const data = snapshot.val();
      setTournamentData(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-emerald-400 text-center">Elite Courts Tournament</h1>
      
      {tournamentData && tournamentData.groups ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(tournamentData.groups).map(([groupName, teams]: [string, any]) => (
            <div key={groupName} className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-emerald-300">{groupName}</h2>
              <ul className="space-y-2">
                {/* We safely get the values from the object and map them */}
                {Object.values(teams).map((teamName: any, idx: number) => (
                  <li key={idx} className="bg-zinc-800 p-2 rounded text-sm text-white">
                    {teamName}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-zinc-500">No tournament data found.</p>
          <p className="text-xs text-zinc-600 mt-2">Check Firebase path: tournaments/pickleball_may_2026/groups</p>
        </div>
      )}
    </div>
  );
}
