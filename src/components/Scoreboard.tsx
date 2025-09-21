"use client";

import { useGameStore } from "@/lib/store";

interface ScoreboardProps {
  showControls?: boolean;
}

export default function Scoreboard({ showControls = false }: ScoreboardProps) {
  const { teams, updateTeamScore, undo } = useGameStore();

  if (teams.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 text-text-primary">Scoreboard</h2>
        <p className="text-text-secondary">No teams added yet</p>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-card rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Scoreboard</h2>
        {showControls && (
          <button
            onClick={undo}
            className="bg-warning text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-warning/90 active:bg-warning/80 min-w-[120px] transition-colors"
          >
            Undo Last
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`flex items-center justify-between p-4 rounded-lg ${
              index === 0 && team.score > 0
                ? "bg-warning/10 border-2 border-warning"
                : "bg-background-muted border-2 border-border"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-text-secondary w-8">
                #{index + 1}
              </span>
              <span className="font-medium text-lg text-text-primary">{team.name}</span>
            </div>

            <div className="flex items-center gap-3">
              {showControls && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTeamScore(team.id, team.score - 100)}
                    className="bg-error text-white w-12 h-12 rounded-lg text-lg font-bold hover:bg-error/90 active:bg-error/80 transition-colors flex items-center justify-center"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateTeamScore(team.id, team.score + 100)}
                    className="bg-success text-white w-12 h-12 rounded-lg text-lg font-bold hover:bg-success/90 active:bg-success/80 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              )}

              <span
                className={`text-2xl font-bold min-w-[80px] text-right ${
                  team.score > 0
                    ? "text-success"
                    : team.score < 0
                    ? "text-error"
                    : "text-text-secondary"
                }`}
              >
                ${team.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}