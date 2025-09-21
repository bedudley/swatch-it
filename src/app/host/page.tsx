"use client";

import { useGameStore } from "@/lib/store";
import BoardGrid from "@/components/BoardGrid";
import ClueModal from "@/components/ClueModal";
import Scoreboard from "@/components/Scoreboard";
import Logo from "@/components/Logo";

export default function HostPage() {
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
    <div className="min-h-screen bg-background-muted p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {pack.logo && (
              <Logo
                logo={pack.logo}
                className="max-h-12"
                alt={`${pack.title} logo`}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-primary">{pack.title}</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <BoardGrid />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Scoreboard showControls={true} />

            {/* Game Info */}
            <div className="bg-card rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-2 text-text-primary">Game Info</h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p>Categories: {pack.board.categories.length}</p>
                <p>
                  Total Clues: {pack.board.categories.reduce((acc, cat) => acc + cat.clues.length, 0)}
                </p>
                <p>Teams: {teams.length}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-card rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-2 text-text-primary">Controls</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>• Click tiles to open clues</p>
                <p>• Use +/- buttons to adjust scores</p>
                <p>• "Undo Last" to revert actions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clue Modal */}
      <ClueModal showControls={true} />
    </div>
  );
}