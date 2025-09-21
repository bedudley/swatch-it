"use client";

import { useGameStore } from "@/lib/store";

interface ScoreboardProps {
  showControls?: boolean;
}

export default function Scoreboard({ showControls = false }: ScoreboardProps) {
  const { teams, updateTeamScore, undo } = useGameStore();

  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Scoreboard</h2>
        <p className="text-gray-500">No teams added yet</p>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Scoreboard</h2>
        {showControls && (
          <button
            onClick={undo}
            className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
          >
            Undo Last
          </button>
        )}
      </div>

      <div className="space-y-2">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`flex items-center justify-between p-3 rounded ${
              index === 0 && team.score > 0
                ? "bg-yellow-100 border-2 border-yellow-400"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-600 w-6">
                #{index + 1}
              </span>
              <span className="font-medium">{team.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {showControls && (
                <div className="flex gap-1">
                  <button
                    onClick={() => updateTeamScore(team.id, team.score - 100)}
                    className="bg-red-500 text-white w-8 h-8 rounded text-sm hover:bg-red-600"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateTeamScore(team.id, team.score + 100)}
                    className="bg-green-500 text-white w-8 h-8 rounded text-sm hover:bg-green-600"
                  >
                    +
                  </button>
                </div>
              )}

              <span
                className={`text-2xl font-bold ${
                  team.score > 0
                    ? "text-green-600"
                    : team.score < 0
                    ? "text-red-600"
                    : "text-gray-600"
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