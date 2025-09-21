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
            <Logo
              logo={pack.logo || "default"}
              className="max-h-14"
              alt="Swatch It! logo"
            />
            <h1 className="text-5xl font-bold text-black">
              Swatch It! - {pack.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 pb-32">
        {/* Game Board - Full Width */}
        <BoardGrid />
      </div>

      {/* Scoreboard - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto p-4">
          <Scoreboard showControls={false} />
        </div>
      </div>

      {/* Clue Modal */}
      <ClueModal showControls={false} />
    </div>
  );
}