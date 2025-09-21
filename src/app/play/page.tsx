"use client";

import { useGameStore } from "@/lib/store";
import BoardGrid from "@/components/BoardGrid";
import ClueModal from "@/components/ClueModal";
import Scoreboard from "@/components/Scoreboard";

export default function PlayPage() {
  const { pack, teams } = useGameStore();

  if (!pack || teams.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swatch It!
          </h1>
          <p className="text-lg text-foreground/70 mb-8">
            Game not configured. Please use the host controls to set up the game.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-blue-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-center text-yellow-400">
            {pack.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="xl:col-span-3">
            <BoardGrid />
          </div>

          {/* Scoreboard */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <Scoreboard showControls={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Clue Modal */}
      <ClueModal showControls={false} />
    </div>
  );
}