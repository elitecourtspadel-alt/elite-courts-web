{/* Roster Overview Panel with Delete Buttons */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 max-w-7xl mx-auto">
  {availableGroups.map((groupName) => {
    const groupData = tournamentData?.groups?.[groupName];
    const teams = groupData?.teams ? Object.entries(groupData.teams) : [];
    const matches = groupData?.matches ? Object.entries(groupData.matches) : [];

    // Helper function to wipe a team out of the DB
    const handleDeleteTeam = async (teamId: string) => {
      if (window.confirm("Are you sure you want to remove this team?")) {
        try {
          const { getDatabase, ref, remove } = await import("firebase/database");
          const db = getDatabase(app);
          await remove(ref(db, `tournaments/pickleball_may_2026/groups/${groupName}/teams/${teamId}`));
          showStatus(`Removed team successfully!`);
        } catch (err) {
          showStatus(`Failed to delete team.`);
        }
      }
    };

    return (
      <div key={groupName} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">{groupName}</h3>
        
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Teams ({teams.length})</span>
          <ul className="space-y-1">
            {teams.map(([id, name]: any) => (
              <li key={id} className="text-xs bg-zinc-950 px-2 py-1.5 rounded text-zinc-300 border border-zinc-800 font-medium flex justify-between items-center group">
                <span>{name}</span>
                <button 
                  onClick={() => handleDeleteTeam(id)}
                  className="text-red-500 hover:text-red-400 font-bold px-1 text-[10px] transition-opacity"
                  title="Delete Team"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Active Matches ({matches.length})</span>
          <ul className="space-y-1">
            {matches.map(([id, data]: any) => (
              <li key={id} className="text-[11px] bg-zinc-950/80 px-2 py-1.5 rounded text-zinc-400 border border-zinc-800/40 flex justify-between">
                <span>{data.team1} vs {data.team2}</span>
                {data.winner && <span className="text-emerald-400 font-bold">✓</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  })}
</div>
