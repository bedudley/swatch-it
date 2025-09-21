"use client";

import { useGameStore } from "@/lib/store";

interface ScoreboardProps {
  showControls?: boolean;
}

export default function Scoreboard({ showControls = false }: ScoreboardProps) {
  const { teams, updateTeamScore, undo } = useGameStore();

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text-primary">Scoreboard</h2>
        <p className="text-text-secondary">No teams added yet</p>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="flex items-center justify-between gap-2 lg:gap-4">
      {/* Title and Undo Button */}
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <h2 className="text-lg lg:text-xl font-bold text-text-primary">Scoreboard</h2>
        {showControls && (
          <button
            onClick={undo}
            className="bg-warning text-white px-4 py-2 rounded-lg font-medium hover:bg-warning/90 active:bg-warning/80 transition-colors"
          >
            Undo Last
          </button>
        )}
      </div>

      {/* Teams in Horizontal Layout */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-center overflow-x-auto">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg flex-shrink-0 ${
              index === 0 && team.score > 0
                ? "bg-warning/10 border-2 border-warning"
                : "bg-background-muted border border-border"
            }`}
          >
            {/* Rank */}
            <span className="text-sm font-bold text-text-secondary">
              #{index + 1}
            </span>

            {/* Team Name */}
            <span className="font-medium text-sm lg:text-base text-text-primary">{team.name}</span>

            {/* Score */}
            <span
              className={`text-base lg:text-lg font-bold min-w-[50px] lg:min-w-[60px] text-right ${
                team.score > 0
                  ? "text-success"
                  : team.score < 0
                  ? "text-error"
                  : "text-text-secondary"
              }`}
            >
              ${team.score}
            </span>

            {/* Controls (only when showControls) */}
            {showControls && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => updateTeamScore(team.id, team.score - 100)}
                  className="bg-error text-white w-8 h-8 rounded text-sm font-bold hover:bg-error/90 active:bg-error/80 transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => updateTeamScore(team.id, team.score + 100)}
                  className="bg-success text-white w-8 h-8 rounded text-sm font-bold hover:bg-success/90 active:bg-success/80 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}