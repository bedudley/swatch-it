"use client";

import { useGameStore } from "@/lib/store";
import BoardGrid from "@/components/BoardGrid";
import QuestionModal from "@/components/QuestionModal";
import HostScoreboard from "@/components/HostScoreboard";
import Logo from "@/components/Logo";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useSyncListener } from "@/lib/useSyncListener";
import { usePeerSyncListener } from "@/lib/usePeerSync";

export default function HostPage() {
  // Set up sync listeners for both same-device and cross-device sync
  useSyncListener();
  usePeerSyncListener();

  const { pack, teams } = useGameStore();

  if (!pack || teams.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Host View
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Please configure the game in the admin panel first.
          </p>
          <a
            href="/admin"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Go to Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-muted p-4">
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Logo
              logo={pack.logo || "swatch-it"}
              className="max-h-12"
              alt={`${pack.title} logo`}
            />
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Swatch It! - {pack.title}
              </h1>
              <p className="text-text-secondary">Host View</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a
              href="/play"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Display View
            </a>
            <a
              href="/admin"
              className="bg-text-secondary text-white px-4 py-2 rounded hover:bg-text-secondary/90"
            >
              Back to Admin
            </a>
          </div>
        </div>

        {/* Game Board - Full Width */}
        <div className="pb-40">
          <BoardGrid />
        </div>
      </div>

      {/* Scoreboard - Fixed above Footer */}
      <div className="fixed bottom-12 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto p-4">
          <HostScoreboard showControls={true} />
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal showControls={true} />
    </div>
  );
}