'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// 1. Define your Firebase config (Get these from your Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyD4BPvYwRjOAGfiwoVPbG_4hJ6QEBgdc9A",
  authDomain: "elitecourtsapp.firebaseapp.com",
  projectId: "elitecourtsapp",
  storageBucket: "elitecourtsapp.firebasestorage.app",
  messagingSenderId: "409782502952",
  appId: "1:409782502952:web:64dbbd439a740a312c571d"
};

// 2. Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default function TournamentView() {
  const [matches, setMatches] = useState({});

  useEffect(() => {
    const db = getDatabase(app); // Pass the initialized app here
    const matchesRef = ref(db, 'tournaments/pickleball_may_2026/matches');
    
    onValue(matchesRef, (snapshot) => {
      console.log("Data from Firebase:", snapshot.val());
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
