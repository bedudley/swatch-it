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
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

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

  const handleFileUpload = (file: File) => {
    // Reset previous states
    setError("");
    setUploadStatus("uploading");

    // Validate file type more strictly
    const validTypes = ["application/json", "text/json"];
    const isValidType = validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.json');

    if (!isValidType) {
      setError("Please select a valid JSON file (.json)");
      setUploadStatus("error");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File is too large. Please select a file smaller than 5MB.");
      setUploadStatus("error");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (!content || content.trim() === "") {
          throw new Error("File appears to be empty");
        }

        const parsed = JSON.parse(content);
        const validated = PackSchema.parse(parsed);

        setPack(validated);
        setJsonInput(""); // Clear textarea when file is loaded
        setError("");
        setUploadStatus("success");

        // Reset success status after 3 seconds
        setTimeout(() => {
          setUploadStatus("idle");
        }, 3000);

      } catch (err) {
        let errorMessage = "Failed to load pack file";

        if (err instanceof SyntaxError) {
          errorMessage = "Invalid JSON format - please check your file syntax";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setUploadStatus("error");
      }
    };

    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setUploadStatus("error");
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    // Reset error state when dragging over
    if (uploadStatus === "error") {
      setUploadStatus("idle");
      setError("");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const loadSamplePack = () => {
    const samplePack = {
      packId: "color-style-sampler",
      title: "Color & Style Sampler",
      logo: "default",
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
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Swatch It! Admin</h1>

        {/* Game Pack Section */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Game Pack</h2>

          {pack ? (
            <div className="mb-4">
              <p className="text-lg font-medium text-success">✓ Loaded: {pack.title}</p>
              <p className="text-sm text-text-secondary">
                {pack.board.categories.length} categories,
                {pack.board.categories.reduce((acc, cat) => acc + cat.clues.length, 0)} clues total
              </p>
            </div>
          ) : (
            <p className="text-warning mb-4">No pack loaded</p>
          )}

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={loadSamplePack}
                className="bg-primary text-white px-8 py-4 text-lg rounded-lg hover:bg-primary/90 active:bg-primary/80 font-medium min-w-[200px] transition-colors"
              >
                Load Sample Pack
              </button>
            </div>

            {/* File Upload Drop Zone */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Upload Pack File</h3>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  uploadStatus === "uploading"
                    ? "border-warning bg-warning/5 animate-pulse"
                    : uploadStatus === "success"
                    ? "border-success bg-success/5"
                    : uploadStatus === "error"
                    ? "border-error bg-error/5"
                    : isDragOver
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="space-y-4">
                  {uploadStatus === "uploading" ? (
                    <>
                      <div className="text-4xl animate-spin">⏳</div>
                      <div>
                        <p className="text-lg font-medium text-warning">
                          Uploading and validating pack...
                        </p>
                      </div>
                    </>
                  ) : uploadStatus === "success" ? (
                    <>
                      <div className="text-4xl">✅</div>
                      <div>
                        <p className="text-lg font-medium text-success">
                          Pack uploaded successfully!
                        </p>
                        <p className="text-text-secondary text-sm">
                          {pack?.title}
                        </p>
                      </div>
                    </>
                  ) : uploadStatus === "error" ? (
                    <>
                      <div className="text-4xl">❌</div>
                      <div>
                        <p className="text-lg font-medium text-error">
                          Upload failed
                        </p>
                        <p className="text-text-secondary">Try dropping another file</p>
                      </div>
                      <label
                        htmlFor="pack-file-input"
                        className="inline-block bg-error text-white px-6 py-3 rounded-lg hover:bg-error/90 cursor-pointer font-medium transition-colors"
                      >
                        Try Again
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl">📁</div>
                      <div>
                        <p className="text-lg font-medium text-text-primary">
                          Drop your JSON pack file here
                        </p>
                        <p className="text-text-secondary">or</p>
                      </div>
                      <label
                        htmlFor="pack-file-input"
                        className="inline-block bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 cursor-pointer font-medium transition-colors"
                      >
                        Choose File
                      </label>
                    </>
                  )}

                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="pack-file-input"
                    disabled={uploadStatus === "uploading"}
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <h3 className="text-lg font-semibold mb-2 text-text-primary">Or Paste JSON</h3>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste JSON pack here..."
                className="w-full h-40 p-4 text-lg border-2 border-border rounded-lg resize-none font-mono focus:border-primary focus:outline-none bg-card text-text-primary"
              />
              <button
                onClick={handleImportPack}
                className="mt-4 bg-warning text-white px-8 py-4 text-lg rounded-lg hover:bg-warning/90 active:bg-warning/80 font-medium min-w-[150px] transition-colors"
              >
                Import Pack
              </button>
            </div>

            {error && (
              <div className="text-error text-sm bg-error/10 p-3 rounded border border-error">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Teams</h2>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="flex-1 p-4 text-lg border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-card text-text-primary"
              onKeyPress={(e) => e.key === "Enter" && handleAddTeam()}
            />
            <button
              onClick={handleAddTeam}
              className="bg-success text-white px-8 py-4 text-lg rounded-lg hover:bg-success/90 active:bg-success/80 font-medium min-w-[120px] transition-colors"
            >
              Add Team
            </button>
          </div>

          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-4 p-4 border-2 border-border rounded-lg bg-background-muted">
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeamName(team.id, e.target.value)}
                  className="flex-1 p-3 text-lg border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-card text-text-primary"
                />
                <span className="font-mono text-lg font-semibold w-20 text-center bg-card p-2 rounded border border-border text-text-primary">
                  {team.score}
                </span>
                <button
                  onClick={() => removeTeam(team.id)}
                  className="text-error hover:text-error/80 active:text-error/60 px-4 py-3 text-lg font-medium min-w-[100px] transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {teams.length === 0 && (
            <p className="text-text-secondary text-center py-4">No teams added yet</p>
          )}
        </div>

        {/* Game Controls */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Game Controls</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/host"
              className={`inline-block px-8 py-4 text-lg rounded-lg text-white font-medium text-center min-w-[200px] transition-colors ${
                pack && teams.length > 0
                  ? "bg-success hover:bg-success/90 active:bg-success/80"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Start Game (Host View)
            </a>

            <a
              href="/play"
              className={`inline-block px-8 py-4 text-lg rounded-lg text-white font-medium text-center min-w-[200px] transition-colors ${
                pack && teams.length > 0
                  ? "bg-primary hover:bg-primary/90 active:bg-primary/80"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Board View (Display)
            </a>

            <button
              onClick={resetGame}
              className="px-8 py-4 text-lg rounded-lg bg-error text-white hover:bg-error/90 active:bg-error/80 font-medium min-w-[150px] transition-colors"
            >
              Reset Game
            </button>
          </div>

          {(!pack || teams.length === 0) && (
            <p className="text-warning mt-4 text-sm">
              ⚠️ Load a pack and add teams before starting the game
            </p>
          )}
        </div>
      </div>
    </div>
  );
}