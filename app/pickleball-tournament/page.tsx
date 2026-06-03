'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Trophy, Activity, Medal } from "lucide-react";

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
      <p className="text-center text-zinc-400 text-sm mb-10">Live Group Standings & Fixtures Tracker</p>
      
      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading standings...</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {requiredGroups.map((groupName) => {
            const groupData = tournamentData?.groups?.[groupName];
            const teamsRaw = groupData?.teams ? Object.values(groupData.teams) as string[] : [];
            const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];

            // World Cup Standings Logic Matrix
            const standingsMap: Record<string, { name: string; p: number; w: number; l: number; pts: number }> = {};
            
            // Initialize every single team with zeroes
            teamsRaw.forEach((tName) => {
              standingsMap[tName] = { name: tName, p: 0, w: 0, l: 0, pts: 0 };
            });

            // Calculate metrics dynamically based on recorded winners
            matchesRaw.forEach(([_, mData]: any) => {
              const t1 = mData.team1;
              const t2 = mData.team2;
              const win = mData.winner;

              if (standingsMap[t1] && standingsMap[t2]) {
                if (win && win.trim() !== "") {
                  standingsMap[t1].p += 1;
                  standingsMap[t2].p += 1;
                  
                  if (win === t1) {
                    standingsMap[t1].w += 1;
                    standingsMap[t1].pts += 3; // 3 points for win
                    standingsMap[t2].l += 1;
                  } else if (win === t2) {
                    standingsMap[t2].w += 1;
                    standingsMap[t2].pts += 3;
                    standingsMap[t1].l += 1;
                  }
                }
              }
            });

            // Sort standings by points (highest first)
            const sortedStandings = Object.values(standingsMap).sort((a, b) => b.pts - a.pts);

            return (
              <div key={groupName} className="bg-zinc-900 border border-zinc-800/80 p-5 sm:p-6 rounded-2xl shadow-xl space-y-6">
                
                {/* Header Context */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-400" />
                    {groupName}
                  </h2>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-mono font-bold">
                    {teamsRaw.length} TEAMS
                  </span>
                </div>

                {/* World Cup Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-1">
                    <Medal className="h-4 w-4" /> Group Table Standings
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2 pl-2">Team</th>
                          <th className="py-2 text-center w-10">P</th>
                          <th className="py-2 text-center w-10 text-emerald-500">W</th>
                          <th className="py-2 text-center w-10 text-red-400">L</th>
                          <th className="py-2 text-right pr-2 w-14 text-amber-400">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {sortedStandings.length > 0 ? (
                          sortedStandings.map((row, idx) => (
                            <tr key={row.name} className="hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 font-medium text-zinc-200 pl-2 flex items-center gap-2">
                                <span className="font-mono text-zinc-600 font-bold w-4">{idx + 1}</span>
                                {row.name}
                              </td>
                              <td className="py-3 text-center text-zinc-400 font-mono">{row.p}</td>
                              <td className="py-3 text-center text-emerald-400 font-mono font-semibold">{row.w}</td>
                              <td className="py-3 text-center text-zinc-500 font-mono">{row.l}</td>
                              <td className="py-3 text-right pr-2 text-amber-400 font-mono font-bold">{row.pts}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-zinc-600 text-center py-4 italic text-xs">No registered teams.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Match Fixtures List */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Activity className="h-4 w-4" /> Match Fixtures
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchesRaw.length > 0 ? (
                      matchesRaw.map(([matchId, mData]: any) => {
                        const hasEnded = mData.winner && mData.winner.trim() !== "";
                        return (
                          <div key={matchId} className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl flex flex-col justify-between space-y-3">
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-zinc-800 pb-1.5">
                              <span>{matchId.toUpperCase()}</span>
                              {hasEnded ? (
                                <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">FINAL</span>
                              ) : (
                                <span className="text-amber-500 animate-pulse bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/10">PENDING</span>
                              )}
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className={`flex justify-between items-center ${hasEnded && mData.winner === mData.team1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                                <span>{mData.team1}</span>
                                {hasEnded && mData.winner === mData.team1 && <span>🏆</span>}
                              </div>
                              <div className={`flex justify-between items-center ${hasEnded && mData.winner === mData.team2 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                                <span>{mData.team2}</span>
                                {hasEnded && mData.winner === mData.team2 && <span>🏆</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-600 italic py-2 col-span-2 text-center bg-zinc-950/40 border border-zinc-800/50 rounded-xl">No group stage matches set yet.</p>
                    )}
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
