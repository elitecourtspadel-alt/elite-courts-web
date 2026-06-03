'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Trophy, Activity, Medal, GitFork } from "lucide-react";

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

  // --- Strict World Cup Calculation Logic Matrix ---
  const groupWinners: Record<string, string> = { 
    'Group A': 'Winner Group A', 
    'Group B': 'Winner Group B', 
    'Group C': 'Winner Group C', 
    'Group D': 'Winner Group D' 
  };

  if (tournamentData?.groups) {
    requiredGroups.forEach((groupName) => {
      const groupData = tournamentData.groups[groupName];
      const teamsRaw = groupData?.teams ? Object.values(groupData.teams) as string[] : [];
      const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];

      // Check if there are matches, and see if ANY match is still missing a winner
      const hasMatches = matchesRaw.length > 0;
      const allMatchesFinished = hasMatches && matchesRaw.every(([_, mData]: any) => mData.winner && mData.winner.trim() !== "");

      // Only pass the real team name forward if the group matches are 100% final
      if (allMatchesFinished) {
        const standingsMap: Record<string, { name: string; pts: number }> = {};
        teamsRaw.forEach((tName) => { standingsMap[tName] = { name: tName, pts: 0 }; });

        matchesRaw.forEach(([_, mData]: any) => {
          const t1 = mData.team1; const t2 = mData.team2; const win = mData.winner;
          if (standingsMap[t1] && standingsMap[t2] && win) {
            if (win === t1) standingsMap[t1].pts += 3;
            else if (win === t2) standingsMap[t2].pts += 3;
          }
        });

        const sorted = Object.values(standingsMap).sort((a, b) => b.pts - a.pts);
        if (sorted.length > 0) {
          groupWinners[groupName] = sorted[0].name;
        }
      }
    });
  }

  // Knockout match data from DB
  const semi1 = tournamentData?.knockouts?.semi1 || { winner: "" };
  const semi2 = tournamentData?.knockouts?.semi2 || { winner: "" };
  const finalMatch = tournamentData?.knockouts?.final || { winner: "" };

  return (
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-emerald-400 text-center tracking-tight">Elite Courts Tournament</h1>
        <p className="text-center text-zinc-400 text-sm">Live Group Standings & Fixtures Tracker</p>
      </div>
      
      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading tournament board...</p>
      ) : (
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Group Stages Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {requiredGroups.map((groupName) => {
              const groupData = tournamentData?.groups?.[groupName];
              const teamsRaw = groupData?.teams ? Object.values(groupData.teams) as string[] : [];
              const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];
              const standingsMap: Record<string, { name: string; p: number; w: number; l: number; pts: number }> = {};
              
              teamsRaw.forEach((tName) => { standingsMap[tName] = { name: tName, p: 0, w: 0, l: 0, pts: 0 }; });
              matchesRaw.forEach(([_, mData]: any) => {
                const t1 = mData.team1; const t2 = mData.team2; const win = mData.winner;
                if (standingsMap[t1] && standingsMap[t2] && win && win.trim() !== "") {
                  standingsMap[t1].p += 1; standingsMap[t2].p += 1;
                  if (win === t1) { standingsMap[t1].w += 1; standingsMap[t1].pts += 3; standingsMap[t2].l += 1; }
                  else if (win === t2) { standingsMap[t2].w += 1; standingsMap[t2].pts += 3; standingsMap[t1].l += 1; }
                }
              });

              const sortedStandings = Object.values(standingsMap).sort((a, b) => b.pts - a.pts);

              return (
                <div key={groupName} className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Trophy className="h-5 w-5" />{groupName}</h2>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-mono font-bold">{teamsRaw.length} TEAMS</span>
                  </div>

                  <div className="space-y-2">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                          <th className="py-2 text-left pl-2">Team</th>
                          <th className="py-2 text-center w-10">P</th>
                          <th className="py-2 text-center w-10 text-emerald-500">W</th>
                          <th className="py-2 text-center w-10 text-red-400">L</th>
                          <th className="py-2 text-right pr-2 w-14 text-amber-400">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {sortedStandings.map((row, idx) => (
                          <tr key={row.name} className="hover:bg-zinc-800/30">
                            <td className="py-3 font-medium text-zinc-200 pl-2 flex items-center gap-2">
                              <span className="font-mono text-zinc-600 font-bold w-4">{idx + 1}</span>
                              {row.name}
                            </td>
                            <td className="py-3 text-center text-zinc-400 font-mono">{row.p}</td>
                            <td className="py-3 text-center text-emerald-400 font-mono">{row.w}</td>
                            <td className="py-3 text-center text-zinc-500 font-mono">{row.l}</td>
                            <td className="py-3 text-right pr-2 text-amber-400 font-mono font-bold">{row.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {matchesRaw.map(([matchId, mData]: any) => (
                      <div key={matchId} className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-zinc-900 pb-1">
                          <span>{matchId.toUpperCase()}</span>
                          {mData.winner ? <span className="text-emerald-400 font-bold">FINAL</span> : <span className="text-amber-500 animate-pulse">PENDING</span>}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className={mData.winner === mData.team1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{mData.team1}</div>
                          <div className={mData.winner === mData.team2 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{mData.team2}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Knockout Bracket Display */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 sm:p-8 rounded-3xl space-y-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-amber-400 text-center flex items-center justify-center gap-2 tracking-tight">
              <GitFork className="h-6 w-6 text-amber-400 rotate-180" /> Knockout Finals Stage
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto pt-4 relative">
              
              {/* Column 1: Semifinals */}
              <div className="space-y-8 lg:col-span-1">
                <div className="text-center font-bold text-[10px] tracking-widest text-zinc-500 uppercase mb-2">Semifinals</div>
                
                {/* Semi 1: A vs C */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-md">
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500 border-b border-zinc-900 pb-1">
                    <span>SEMIFINAL 1</span>
                    {semi1.winner ? <span className="text-emerald-400 font-bold">FINAL</span> : <span className="text-amber-500">LIVE</span>}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className={`flex justify-between items-center ${semi1.winner && semi1.winner === groupWinners['Group A'] ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                      <span>{groupWinners['Group A']}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">(A1)</span>
                    </div>
                    <div className={`flex justify-between items-center ${semi1.winner && semi1.winner === groupWinners['Group C'] ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                      <span>{groupWinners['Group C']}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">(C1)</span>
                    </div>
                  </div>
                </div>

                {/* Semi 2: B vs D */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-md">
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500 border-b border-zinc-900 pb-1">
                    <span>SEMIFINAL 2</span>
                    {semi2.winner ? <span className="text-emerald-400 font-bold">FINAL</span> : <span className="text-amber-500">LIVE</span>}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className={`flex justify-between items-center ${semi2.winner && semi2.winner === groupWinners['Group B'] ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                      <span>{groupWinners['Group B']}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">(B1)</span>
                    </div>
                    <div className={`flex justify-between items-center ${semi2.winner && semi2.winner === groupWinners['Group D'] ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                      <span>{groupWinners['Group D']}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">(D1)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Grand Finals Slot */}
              <div className="lg:col-span-1 flex flex-col justify-center space-y-3">
                <div className="text-center font-bold text-[10px] tracking-widest text-zinc-500 uppercase mb-2">Grand Championship</div>
                <div className="bg-zinc-900 border-2 border-amber-500/30 p-5 rounded-2xl space-y-4 bg-gradient-to-b from-zinc-900 to-amber-950/10 shadow-xl">
                  <div className="flex justify-between font-mono text-[9px] text-amber-400 font-bold border-b border-zinc-800 pb-1">
                    <span>CHAMPIONSHIP MATCH</span>
                    {finalMatch.winner && <span className="text-emerald-400">FINISHED</span>}
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className={`flex justify-between ${finalMatch.winner && finalMatch.winner === semi1.winner ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                      <span>{semi1.winner || "Winner Semifinal 1"}</span>
                    </div>
                    <div className={`flex justify-between ${finalMatch.winner && finalMatch.winner === semi2.winner ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}>
                      <span>{semi2.winner || "Winner Semifinal 2"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Absolute Winner Podium */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-3xl text-center space-y-3 shadow-lg">
                <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/30">
                  <Trophy className="h-10 w-10 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-mono font-bold text-zinc-500 tracking-wider">Tournament Champion</h3>
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mt-1">
                    {finalMatch.winner || "TBD"}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
