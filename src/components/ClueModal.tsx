"use client";

import { useGameStore } from "@/lib/store";

interface ClueModalProps {
  showControls?: boolean;
}

export default function ClueModal({ showControls = false }: ClueModalProps) {
  const {
    currentClue,
    showAnswer,
    teams,
    closeClue,
    revealAnswer,
    markCorrect,
    markIncorrect,
  } = useGameStore();

  if (!currentClue) return null;

  const { clue } = currentClue;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-6xl w-full max-h-[95vh] overflow-auto shadow-2xl">
        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-warning text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-lg">
              ${clue.value}
            </div>
          </div>

          {/* Clue Content */}
          <div className="text-center mb-12">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-primary mb-8 leading-relaxed px-4">
              {clue.prompt}
            </div>

            {showAnswer && (
              <div className="mt-12 p-8 bg-success/10 rounded-xl border-4 border-success shadow-lg">
                <div className="text-3xl sm:text-4xl font-bold text-success mb-4">
                  Answer:
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl text-text-primary font-semibold">
                  {clue.answer}
                </div>
              </div>
            )}

            {clue.notes && showControls && showAnswer && (
              <div className="mt-4 p-4 bg-info/10 rounded-lg border border-info">
                <div className="text-sm font-semibold text-info mb-1">
                  Host Notes:
                </div>
                <div className="text-sm text-text-secondary">
                  {clue.notes}
                </div>
              </div>
            )}
          </div>

          {/* Controls for host */}
          {showControls && (
            <div className="space-y-8">
              {!showAnswer ? (
                <div className="text-center">
                  <button
                    onClick={revealAnswer}
                    className="bg-success text-white px-12 py-4 rounded-xl hover:bg-success/90 active:bg-success/80 text-2xl font-bold shadow-lg transition-colors"
                  >
                    Reveal Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Team selection */}
                  <div>
                    <div className="text-2xl font-semibold mb-6 text-center">
                      Which team got it correct?
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {teams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => markCorrect(team.id)}
                          className="bg-success text-white px-8 py-4 text-xl rounded-xl hover:bg-success/90 active:bg-success/80 font-medium transition-colors shadow-lg"
                        >
                          {team.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={markIncorrect}
                      className="bg-error text-white px-10 py-4 text-xl rounded-xl hover:bg-error/90 active:bg-error/80 font-medium transition-colors shadow-lg"
                    >
                      No One Got It
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center pt-8 border-t-2 border-border">
                <button
                  onClick={closeClue}
                  className="bg-text-secondary text-white px-10 py-4 text-xl rounded-xl hover:bg-text-secondary/90 active:bg-text-secondary/80 font-medium transition-colors shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}