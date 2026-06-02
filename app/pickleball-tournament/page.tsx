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
  // Added the explicit Singapore database URL so the SDK knows where to look:
  databaseURL: "https://elitecourtsapp-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default function TournamentView() {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const tourneyRef = ref(db, 'tournaments/pickleball_may_2026');
    
    console.log("Connecting to Firebase path: tournaments/pickleball_may_2026...");

    const unsubscribe = onValue(tourneyRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase raw snapshot received:", data);
      setTournamentData(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase database read error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-emerald-400 text-center">Elite Courts Tournament</h1>
      
      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading data from database...</p>
      ) : tournamentData && tournamentData.groups ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(tournamentData.groups).map(([groupName, teams]: [string, any]) => (
            <div key={groupName} className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-emerald-300">{groupName}</h2>
              <ul className="space-y-2">
                {teams && typeof teams === 'object' ? (
                  Object.values(teams).map((teamName: any, idx: number) => (
                    <li key={idx} className="bg-zinc-800 p-2 rounded text-sm text-white">
                      {teamName}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">No teams found in this group.</p>
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center border border-zinc-800 p-8 rounded-lg max-w-md mx-auto bg-zinc-950">
          <p className="text-zinc-400 font-medium">No active tournament data found.</p>
          <p className="text-xs text-zinc-600 mt-2 block">
            Target path: <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-500">tournaments/pickleball_may_2026/groups</code>
          </p>
          <p className="text-[10px] text-zinc-500 mt-4 italic">
            Tip: Open your browser's Developer Tools (F12) Console to inspect the incoming connection log.
          </p>
        </div>
      )}
    </div>
  );
}
