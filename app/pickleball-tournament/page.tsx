'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Trophy, GitFork, Youtube, Sparkles } from "lucide-react";

// 📸 ADD YOUR IMAGE LINKS HERE (Drop in your public folder or use external links)
const WINNER_IMAGE_URL = "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200"; 
const CEREMONY_IMAGE_URL = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200";

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

  // Initialize group winners with fallback placeholders
  const groupWinners: Record<string, string> = { 
    'Group A': 'Winner Group A', 
    'Group B': 'Winner Group B', 
    'Group C': 'Winner Group C', 
    'Group D': 'Winner Group D' 
  };

  if (tournamentData?.groups) {
    requiredGroups.forEach((groupName) => {
      const groupData = tournamentData.groups[groupName];
      const teamsRaw = groupData?.teams ? (Object.values(groupData.teams) as string[]) : [];
      const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];

      const standingsMap: Record<string, { name: string; pts: number; diff: number }> = {};
      teamsRaw.forEach((tName) => { standingsMap[tName] = { name: tName, pts: 0, diff: 0 }; });

      matchesRaw.forEach((match: any) => {
        const mData = match[1];
        const t1 = mData.team1; const t2 = mData.team2; const win = mData.winner;
        const s1 = Number(mData.score1 || 0); const s2 = Number(mData.score2 || 0);
        
        if (standingsMap[t1] && standingsMap[t2] && win && win.trim() !== "") {
          standingsMap[t1].diff += (s1 - s2);
          standingsMap[t2].diff += (s2 - s1);
          if (win === t1) standingsMap[t1].pts += 3;
          else if (win === t2) standingsMap[t2].pts += 3;
        }
      });

      const sorted = Object.values(standingsMap).sort((a, b) => b.pts - a.pts || b.diff - a.diff);
      if (sorted.length > 0) {
        groupWinners[groupName] = sorted[0].name;
      }
    });
  }

  // Raw data extraction
  const semi1 = tournamentData?.knockouts?.semi1 || { winner: "", score1: "", score2: "" };
  const semi2 = tournamentData?.knockouts?.semi2 || { winner: "", score1: "", score2: "" };
  const finalMatch = tournamentData?.knockouts?.final || { winner: "", score1: "", score2: "" };
  const streamLink = tournamentData?.config?.streamLink || "";

  // Dynamic & Robust Knockout Winner Resolution
  const semi1Team1 = semi1.team1 || groupWinners['Group A'];
  const semi1Team2 = semi1.team2 || groupWinners['Group C'];
  let semi1Winner = semi1.winner || "";
  if (semi1.score1 !== undefined && semi1.score2 !== undefined && semi1.score1 !== "" && semi1.score2 !== "") {
    semi1Winner = Number(semi1.score1) > Number(semi1.score2) ? semi1Team1 : semi1Team2;
  }

  const semi2Team1 = semi2.team1 || groupWinners['Group B'];
  const semi2Team2 = semi2.team2 || groupWinners['Group D'];
  let semi2Winner = semi2.winner || "";
  if (semi2.score1 !== undefined && semi2.score2 !== undefined && semi2.score1 !== "" && semi2.score2 !== "") {
    semi2Winner = Number(semi2.score1) > Number(semi2.score2) ? semi2Team1 : semi2Team2;
  }

  const finalTeam1 = finalMatch.team1 || semi1Winner || "Winner Semifinal 1";
  const finalTeam2 = finalMatch.team2 || semi2Winner || "Winner Semifinal 2";
  let finalWinner = finalMatch.winner || "";
  if (finalMatch.score1 !== undefined && finalMatch.score2 !== undefined && finalMatch.score1 !== "" && finalMatch.score2 !== "") {
    finalWinner = Number(finalMatch.score1) > Number(finalMatch.score2) ? finalTeam1 : finalTeam2;
  }

  const isSemi1Ready = groupWinners['Group A'] !== 'Winner Group A' && groupWinners['Group C'] !== 'Winner Group C';
  const isSemi2Ready = groupWinners['Group B'] !== 'Winner Group B' && groupWinners['Group D'] !== 'Winner Group D';

  return (
    <div className="p-4 sm:p-10 text-white bg-zinc-950 min-h-screen space-y-10">
      
      {/* 📣 Header Board */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-emerald-400 text-center tracking-tight flex items-center justify-center gap-2">
            Elite Courts Tournament
          </h1>
          <p className="text-center text-zinc-400 text-sm">Official Wrap-up & Final Standings</p>
        </div>
        
        {streamLink && (
          <a href={streamLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-5 py-2 rounded-full text-xs transition-all border border-zinc-800">
            <Youtube className="w-4 h-4 text-red-500" /> Watch Event Playbacks
          </a>
        )}
      </div>
      
      {loading ? (
        <p className="text-zinc-500 text-center animate-pulse">Loading tournament archives...</p>
      ) : (
        <div className="max-w-7xl mx-auto space-y-12">

          {/* 🏆 HERO SECTION: Champions Wall & Ceremony Pictures */}
          {finalWinner && (
            <div className="bg-gradient-to-b from-amber-950/20 to-zinc-900/40 border border-amber-500/20 p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-2xl backdrop-blur-sm animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400" /> Champions Spotlight <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-tight">
                  {finalWinner}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">Grand Finale Winners</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-5xl mx-auto">
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] shadow-lg relative group">
                    <img 
                      src={WINNER_IMAGE_URL} 
                      alt="Winning Team" 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <span className="text-xs font-mono tracking-wider font-bold text-amber-400 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 inline-block">The Champions</span>
                </div>

                <div className="space-y-2">
                  <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] shadow-lg relative group">
                    <img 
                      src={CEREMONY_IMAGE_URL} 
                      alt="Closing Ceremony" 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <span className="text-xs font-mono tracking-wider font-bold text-zinc-400 bg-zinc-800/40 px-3 py-1 rounded-full border border-zinc-800 inline-block">Closing Ceremony</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 📊 Group Brackets Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {requiredGroups.map((groupName) => {
              const groupData = tournamentData?.groups?.[groupName];
              const teamsRaw = groupData?.teams ? (Object.values(groupData.teams) as string[]) : [];
              const matchesRaw = groupData?.matches ? Object.entries(groupData.matches) : [];
              const standingsMap: Record<string, { name: string; p: number; w: number; l: number; diff: number; pts: number }> = {};
              
              teamsRaw.forEach((tName) => { standingsMap[tName] = { name: tName, p: 0, w: 0, l: 0, diff: 0, pts: 0 }; });
              matchesRaw.forEach((match: any) => {
                const mData = match[1];
                const t1 = mData.team1; const t2 = mData.team2; const win = mData.winner;
                const s1 = Number(mData.score1 || 0); const s2 = Number(mData.score2 || 0);

                if (standingsMap[t1] && standingsMap[t2] && win && win.trim() !== "") {
                  standingsMap[t1].p += 1; standingsMap[t2].p += 1;
                  standingsMap[t1].diff += (s1 - s2);
                  standingsMap[t2].diff += (s2 - s1);
                  if (win === t1) { standingsMap[t1].w += 1; standingsMap[t1].pts += 3; standingsMap[t2].l += 1; }
                  else if (win === t2) { standingsMap[t2].w += 1; standingsMap[t2].pts += 3; standingsMap[t1].l += 1; }
                }
              });

              const sortedStandings = Object.values(standingsMap).sort((a, b) => b.pts - a.pts || b.diff - a.diff);

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
                          <th className="py-2 text-center w-12 text-teal-400">Diff</th>
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
                            <td className={`py-3 text-center font-mono font-medium ${row.diff > 0 ? 'text-teal-400' : row.diff < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                              {row.diff > 0 ? `+${row.diff}` : row.diff}
                            </td>
                            <td className="py-3 text-right pr-2 text-amber-400 font-mono font-bold">{row.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {matchesRaw.map((match: any) => {
                      const matchId = match[0];
                      const mData = match[1];
                      return (
                        <div key={matchId} className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl flex flex-col justify-between space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-b border-zinc-900 pb-1">
                            <span>{matchId.toUpperCase()}</span>
                            {mData.winner ? <span className="text-emerald-400 font-bold">FINAL</span> : <span className="text-amber-500 animate-pulse">PENDING</span>}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className={mData.winner === mData.team1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{mData.team1}</span>
                              {mData.winner && <span className="font-mono text-zinc-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{mData.score1}</span>}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={mData.winner === mData.team2 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{mData.team2}</span>
                              {mData.winner && <span className="font-mono text-zinc-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{mData.score2}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🏁 Knockout Tree Stage */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 sm:p-8 rounded-3xl space-y-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-amber-400 text-center flex items-center justify-center gap-2 tracking-tight">
              <GitFork className="h-6 w-6 text-amber-400 rotate-180" /> Knockout Finals Stage
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto pt-4 relative">
              
              {/* Semifinals Column */}
              <div className="space-y-8 lg:col-span-1">
                <div className="text-center font-bold text-[10px] tracking-widest text-zinc-500 uppercase mb-2">Semifinals</div>
                
                {/* Semifinal 1 Box */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-md">
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500 border-b border-zinc-900 pb-1">
                    <span>SEMIFINAL 1</span>
                    {semi1Winner ? <span className="text-emerald-400 font-bold">FINAL</span> : isSemi1Ready ? <span className="text-red-500 font-bold animate-pulse">LIVE 🔴</span> : <span className="text-amber-500/50">PENDING</span>}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={semi1Winner === semi1Team1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{semi1Team1}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {semi1.score1 !== undefined && <span className="bg-zinc-900 text-zinc-400 px-1 rounded text-[10px]">{semi1.score1}</span>}
                        <span className="text-[10px] text-zinc-600">(A1)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={semi1Winner === semi1Team2 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{semi1Team2}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {semi1.score2 !== undefined && <span className="bg-zinc-900 text-zinc-400 px-1 rounded text-[10px]">{semi1.score2}</span>}
                        <span className="text-[10px] text-zinc-600">(C1)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Semifinal 2 Box */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-md">
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500 border-b border-zinc-900 pb-1">
                    <span>SEMIFINAL 2</span>
                    {semi2Winner ? <span className="text-emerald-400 font-bold">FINAL</span> : isSemi2Ready ? <span className="text-red-500 font-bold animate-pulse">LIVE 🔴</span> : <span className="text-amber-500/50">PENDING</span>}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={semi2Winner === semi2Team1 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{semi2Team1}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {semi2.score1 !== undefined && <span className="bg-zinc-900 text-zinc-400 px-1 rounded text-[10px]">{semi2.score1}</span>}
                        <span className="text-[10px] text-zinc-600">(B1)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={semi2Winner === semi2Team2 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{semi2Team2}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        {semi2.score2 !== undefined && <span className="bg-zinc-900 text-zinc-400 px-1 rounded text-[10px]">{semi2.score2}</span>}
                        <span className="text-[10px] text-zinc-600">(D1)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Championship Column */}
              <div className="lg:col-span-1 flex flex-col justify-center space-y-3">
                <div className="text-center font-bold text-[10px] tracking-widest text-zinc-500 uppercase mb-2">Grand Championship</div>
                <div className="bg-zinc-900 border-2 border-amber-500/30 p-5 rounded-2xl space-y-4 bg-gradient-to-b from-zinc-900 to-amber-950/10 shadow-xl">
                  <div className="flex justify-between font-mono text-[9px] text-amber-400 font-bold border-b border-zinc-800 pb-1">
                    <span>CHAMPIONSHIP MATCH</span>
                    {finalWinner ? <span className="text-emerald-400">FINAL</span> : (semi1Winner && semi2Winner) ? <span className="text-red-500 animate-pulse">LIVE 🔴</span> : <span className="text-amber-500/50 font-normal">PENDING</span>}
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={finalWinner && finalWinner === semi1Winner ? 'text-amber-400 font-bold' : 'text-zinc-400'}>{semi1Winner || "Winner Semifinal 1"}</span>
                      {finalWinner && <span className="font-mono text-zinc-400 text-xs font-bold bg-zinc-950 px-1.5 py-0.5 rounded">{finalMatch.score1}</span>}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={finalWinner && finalWinner === semi2Winner ? 'text-amber-400 font-bold' : 'text-zinc-400'}>{semi2Winner || "Winner Semifinal 2"}</span>
                      {finalWinner && <span className="font-mono text-zinc-400 text-xs font-bold bg-zinc-950 px-1.5 py-0.5 rounded">{finalMatch.score2}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Champion Badge Showcase */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-3xl text-center space-y-3 shadow-lg">
                <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/30">
                  <Trophy className="h-10 w-10 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-mono font-bold text-zinc-500 tracking-wider">Tournament Champion</h3>
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mt-1">
                    {finalWinner || "TBD"}
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
