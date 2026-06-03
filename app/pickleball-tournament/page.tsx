'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Trophy, Users, Sword } from "lucide-react";

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
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-emerald-400 text-center tracking-tight">Elite Courts Tournament</h1>
      <p className="text-center text-zinc-400 text-sm mb-8">14 Teams — Group Stages & Live Match Schedule</p>
      
      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading brackets...</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {requiredGroups.map((groupName) => {
            const groupData = tournamentData?.groups?.[groupName];
            const teamList = groupData?.teams ? Object.entries(groupData.teams) : [];
            const matchList = groupData?.matches ? Object.entries(groupData.matches) : [];

            return (
              <div key={groupName} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-400" />
                    {groupName}
                  </h2>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-mono">
                    {teamList.length} Teams Registered
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left sub-column: Team Roster */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Standings / Roster
                    </h3>
                    <ul className="space-y-2">
                      {teamList.length > 0 ? (
                        teamList.map(([teamId, teamName]: [string, any]) => (
                          <li key={teamId} className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm font-medium text-zinc-200">
                            {teamName}
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-600 italic py-2">No teams added yet.</p>
                      )}
                    </ul>
                  </div>

                  {/* Right sub-column: Matches Feed matching tournament.json structure */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Sword className="h-3.5 w-3.5" /> Match Fixtures
                    </h3>
                    <div className="space-y-2">
                      {matchList.length > 0 ? (
                        matchList.map(([matchId, mData]: [string, any]) => {
                          const isFinished = mData.winner && mData.winner.trim() !== "";
                          return (
                            <div key={matchId} className="bg-zinc-950 border border-zinc-800/60 p-3 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono border-b border-zinc-800 pb-1.5">
                                <span>{matchId.toUpperCase()}</span>
                                {isFinished ? (
                                  <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">FINISHED</span>
                                ) : (
                                  <span className="text-amber-400 animate-pulse bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/10">LIVE</span>
                                )}
                              </div>
                              <div className="text-xs space-y-1">
                                <div className={`flex justify-between items-center px-1 ${mData.winner === mData.team1 ? 'text-emerald-400 font-semibold' : 'text-zinc-300'}`}>
                                  <span>{mData.team1}</span>
                                  {mData.winner === mData.team1 && <span className="text-[10px]">🏆</span>}
                                </div>
                                <div className="text-[10px] text-zinc-600 text-center font-bold my-0.5">VS</div>
                                <div className={`flex justify-between items-center px-1 ${mData.winner === mData.team2 ? 'text-emerald-400 font-semibold' : 'text-zinc-300'}`}>
                                  <span>{mData.team2}</span>
                                  {mData.winner === mData.team2 && <span className="text-[10px]">🏆</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-zinc-600 italic py-2">No fixtures generated yet.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
