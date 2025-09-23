"use client";

import { useGameStore } from "@/lib/store";

export default function PlayScoreboard() {
  const { teams } = useGameStore();

  if (teams.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-text-primary text-center">Scoreboard</h2>
        <p className="text-text-secondary text-center">No teams added yet</p>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const topScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;
  const isLeader = (team: any) => team.score > 0 && team.score === topScore;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">Scoreboard</h2>
        <div className="h-1 bg-primary rounded-full w-16 mx-auto mt-2"></div>
      </div>

      {/* Teams in Vertical Layout */}
      <div className="space-y-3">
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`relative overflow-hidden rounded-xl p-4 transition-all duration-200 ${
              isLeader(team)
                ? "bg-gradient-to-r from-warning/20 to-warning/10 border-2 border-warning shadow-lg scale-105"
                : "bg-background-muted border border-border hover:border-primary/50"
            }`}
          >
            {/* Rank Badge */}
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isLeader(team)
                    ? "bg-warning text-white"
                    : index === 1
                    ? "bg-gray-400 text-white"
                    : index === 2
                    ? "bg-amber-600 text-white"
                    : "bg-text-secondary text-white"
                }`}
              >
                {index + 1}
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    team.score > 0
                      ? "text-success"
                      : team.score < 0
                      ? "text-error"
                      : "text-text-secondary"
                  }`}
                >
                  ${team.score}
                </div>
              </div>
            </div>

            {/* Team Name with Crown */}
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg font-semibold text-text-primary truncate flex-1">
                {team.name}
              </div>
              {isLeader(team) && (
                <div className="text-warning text-lg">
                  👑
                </div>
              )}
            </div>

            {/* Score Progress Bar (visual representation) */}
            {team.score > 0 && (
              <div className="mt-3">
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isLeader(team) ? "bg-warning" : "bg-success"
                    }`}
                    style={{
                      width: `${Math.min((team.score / Math.max(...teams.map(t => t.score))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}