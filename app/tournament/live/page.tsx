'use client';
import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";

export default function TournamentView() {
  const [matches, setMatches] = useState({});

  useEffect(() => {
    const db = getDatabase();
    const matchesRef = ref(db, 'tournaments/pickleball_may_2026/matches');
    
    // This listener updates the UI instantly whenever Alexa changes Firebase
    onValue(matchesRef, (snapshot) => {
      setMatches(snapshot.val() || {});
    });
  }, []);

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-4xl font-bold">Tournament Bracket</h1>
      <pre>{JSON.stringify(matches, null, 2)}</pre>
    </div>
  );
}
