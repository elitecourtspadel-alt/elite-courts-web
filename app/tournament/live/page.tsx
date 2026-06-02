'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Your verified Firebase configuration
const firebaseConfig = {
  apiKey: "AizasyD4bPvYwRjOAGfiwoVPbG_4hj6QEbgdc9A",
  authDomain: "elitecourtsapp.firebaseapp.com",
  projectId: "elitecourtsapp",
  storageBucket: "elitecourtsapp.appspot.com",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d"
};

// Initialize Firebase safely for Next.js SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default function TournamentView() {
  const [matches, setMatches] = useState<any>(null);

  useEffect(() => {
    const db = getDatabase(app);
    const matchesRef = ref(db, 'tournaments/pickleball_may_2026/matches');
    
    // Listen for live data updates
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      setMatches(snapshot.val());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-10 text-white bg-black min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
        Elite Courts Live Tournament
      </h1>
      <div className="bg-zinc-900 border border-emerald-500/30 rounded-lg p-6 w-full max-w-2xl font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        {matches ? (
          <pre className="text-emerald-300 whitespace-pre-wrap">{JSON.stringify(matches, null, 2)}</pre>
        ) : (
          <p className="text-zinc-500 text-center animate-pulse">Waiting for Alexa to generate matches...</p>
        )}
      </div>
    </div>
  );
}
