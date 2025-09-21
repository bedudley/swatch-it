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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-yellow-600 text-6xl font-bold mb-4">
              ${clue.value}
            </div>
          </div>

          {/* Clue Content */}
          <div className="text-center mb-8">
            <div className="text-3xl font-semibold text-blue-900 mb-6 leading-relaxed">
              {clue.prompt}
            </div>

            {showAnswer && (
              <div className="mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="text-2xl font-bold text-green-800 mb-2">
                  Answer:
                </div>
                <div className="text-xl text-green-700">
                  {clue.answer}
                </div>
              </div>
            )}

            {clue.notes && showControls && showAnswer && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-semibold text-blue-800 mb-1">
                  Host Notes:
                </div>
                <div className="text-sm text-blue-700">
                  {clue.notes}
                </div>
              </div>
            )}
          </div>

          {/* Controls for host */}
          {showControls && (
            <div className="space-y-4">
              {!showAnswer ? (
                <div className="text-center">
                  <button
                    onClick={revealAnswer}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-medium"
                  >
                    Reveal Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Team selection */}
                  <div>
                    <div className="text-lg font-semibold mb-3 text-center">
                      Which team got it correct?
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      {teams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => markCorrect(team.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          {team.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={markIncorrect}
                      className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 mx-2"
                    >
                      No One Got It
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <button
                  onClick={closeClue}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Simple close for display mode */}
          {!showControls && (
            <div className="text-center">
              <button
                onClick={closeClue}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}