"use client";

import { useGameStore } from "@/lib/store";
import { useSyncListener } from "@/lib/useSyncListener";
import { usePeerSyncListener } from "@/lib/usePeerSync";
import BoardGrid from "@/components/BoardGrid";
import QuestionModal from "@/components/QuestionModal";
import PlayScoreboard from "@/components/PlayScoreboard";
import Logo from "@/components/Logo";
import ConnectionStatus from "@/components/ConnectionStatus";

export default function PlayPage() {
  const pack = useGameStore((state) => state.pack);
  const teams = useGameStore((state) => state.teams);
  const currentQuestion = useGameStore((state) => state.currentQuestion);
  const showAnswer = useGameStore((state) => state.showAnswer);

  // Set up sync listeners for both same-device and cross-device sync
  useSyncListener();
  usePeerSyncListener();

  // Debug: Log state changes
  console.log('Play page render - currentQuestion:', currentQuestion, 'showAnswer:', showAnswer);

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
    <div className="bg-background-light text-text-primary">
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* Header */}
      <div className="bg-primary py-4">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <Logo
              logo={pack.logo || "swatch-it"}
              className="max-h-12"
              alt="Swatch It! logo"
            />
            <h1 className="text-4xl font-bold text-black">
              Swatch It! - {pack.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-col lg:flex-row min-h-[80vh]">
        {/* Game Board - Left Side (Primary) */}
        <div className="flex-1 p-4 lg:pr-2">
          <BoardGrid />
        </div>

        {/* Scoreboard - Right Side (Secondary) - Full Height */}
        <div className="w-full lg:w-80 p-4 lg:pl-2 lg:border-l border-border bg-card/50 lg:bg-card/50 flex flex-col">
          <PlayScoreboard />
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal showControls={false} />
    </div>
  );
}