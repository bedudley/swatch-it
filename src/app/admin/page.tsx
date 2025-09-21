"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { PackSchema } from "@/lib/schema";

export default function AdminPage() {
  const {
    teams,
    pack,
    setPack,
    addTeam,
    removeTeam,
    updateTeamName,
    resetGame,
  } = useGameStore();

  const [newTeamName, setNewTeamName] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName("");
    }
  };

  const handleImportPack = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const validated = PackSchema.parse(parsed);
      setPack(validated);
      setJsonInput("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  const loadSamplePack = () => {
    const samplePack = {
      packId: "color-style-sampler",
      title: "Swatch It! — Color & Style Sampler",
      theme: { primary: "#0ea5e9", accent: "#f59e0b" },
      board: {
        columns: 5,
        rows: 5,
        categories: [
          {
            id: "ct1",
            name: "Color Theory",
            clues: [
              { value: 100, prompt: "Primary colors in subtractive (CMY) mixing?", answer: "Cyan, Magenta, Yellow", type: "text" },
              { value: 200, prompt: "Warm vs cool: is red warm or cool?", answer: "Warm", type: "text" },
              { value: 300, prompt: "Opposite of green on standard color wheel?", answer: "Red", type: "text" },
              { value: 400, prompt: "Term for colors next to each other on the wheel?", answer: "Analogous", type: "text" },
              { value: 500, prompt: "Name a triadic set including blue.", answer: "Red, Yellow, Blue (one example)", type: "text" }
            ]
          },
          {
            id: "st1",
            name: "Style Basics",
            clues: [
              { value: 100, prompt: "Neutral color often used as a base in wardrobes?", answer: "Black (or navy/gray/tan acceptable)", type: "text" },
              { value: 200, prompt: "Term for an outfit's main attention‑drawing element?", answer: "Statement piece", type: "text" },
              { value: 300, prompt: "The rule of three applies to what in styling?", answer: "Color or layers/accessories", type: "text" },
              { value: 400, prompt: "What undertone pairs best with cool complexions?", answer: "Cool undertones (blue/pink)", type: "text" },
              { value: 500, prompt: "Name a capsule wardrobe benefit.", answer: "Mix‑and‑match simplicity (or reduced decision fatigue)", type: "text" }
            ]
          }
        ]
      }
    };

    setPack(samplePack);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Swatch It! Admin</h1>

        {/* Game Pack Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Game Pack</h2>

          {pack ? (
            <div className="mb-4">
              <p className="text-lg font-medium text-green-600">✓ Loaded: {pack.title}</p>
              <p className="text-sm text-gray-600">
                {pack.board.categories.length} categories,
                {pack.board.categories.reduce((acc, cat) => acc + cat.clues.length, 0)} clues total
              </p>
            </div>
          ) : (
            <p className="text-yellow-600 mb-4">No pack loaded</p>
          )}

          <div className="space-y-4">
            <button
              onClick={loadSamplePack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium mr-4"
            >
              Load Sample Pack
            </button>

            <div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste JSON pack here..."
                className="w-full h-32 p-3 border rounded resize-none font-mono text-sm"
              />
              <button
                onClick={handleImportPack}
                className="mt-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
              >
                Import Pack
              </button>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Teams</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === "Enter" && handleAddTeam()}
            />
            <button
              onClick={handleAddTeam}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Add Team
            </button>
          </div>

          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeamName(team.id, e.target.value)}
                  className="flex-1 p-1 border rounded"
                />
                <span className="font-mono text-sm w-16 text-center">
                  {team.score}
                </span>
                <button
                  onClick={() => removeTeam(team.id)}
                  className="text-red-600 hover:text-red-800 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {teams.length === 0 && (
            <p className="text-gray-500 text-center py-4">No teams added yet</p>
          )}
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Game Controls</h2>

          <div className="space-x-4">
            <a
              href="/host"
              className={`inline-block px-6 py-3 rounded text-white font-medium ${
                pack && teams.length > 0
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Start Game (Host View)
            </a>

            <a
              href="/play"
              className={`inline-block px-6 py-3 rounded text-white font-medium ${
                pack && teams.length > 0
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Board View (Display)
            </a>

            <button
              onClick={resetGame}
              className="px-6 py-3 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Reset Game
            </button>
          </div>

          {(!pack || teams.length === 0) && (
            <p className="text-yellow-600 mt-4 text-sm">
              ⚠️ Load a pack and add teams before starting the game
            </p>
          )}
        </div>
      </div>
    </div>
  );
}