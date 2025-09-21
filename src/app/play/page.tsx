"use client";

import { useGameStore } from "@/lib/store";
import { useSyncListener } from "@/lib/useSyncListener";
import BoardGrid from "@/components/BoardGrid";
import ClueModal from "@/components/ClueModal";
import Scoreboard from "@/components/Scoreboard";
import Logo from "@/components/Logo";

export default function PlayPage() {
  const pack = useGameStore((state) => state.pack);
  const teams = useGameStore((state) => state.teams);
  const currentClue = useGameStore((state) => state.currentClue);
  const showAnswer = useGameStore((state) => state.showAnswer);

  // Set up sync listener to receive updates from host
  useSyncListener();

  // Debug: Log state changes
  console.log('Play page render - currentClue:', currentClue, 'showAnswer:', showAnswer);

  if (!pack || teams.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swatch It!
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Game not configured. Please use the host controls to set up the game.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-text-primary">
      {/* Header */}
      <div className="bg-primary py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            {pack.logo && (
              <Logo
                logo={pack.logo}
                className="max-h-14"
                alt={`${pack.title} logo`}
              />
            )}
            <h1 className="text-5xl font-bold text-white">
              {pack.title}
            </h1>
          </div>
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