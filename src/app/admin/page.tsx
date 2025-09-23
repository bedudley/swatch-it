"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { PackSchema } from "@/lib/schema";
import { getPackSummary } from "@/lib/packUtils";
import Logo from "@/components/Logo";
import PackLibrary from "@/components/PackLibrary";

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
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName("");
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


  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Logo
            logo="swatch-it"
            className="max-h-12"
            alt="Swatch It! logo"
          />
          <h1 className="text-4xl font-bold text-primary">Swatch It! Admin</h1>
        </div>

        {/* Class Pack Panel */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Class Pack</h2>

          {/* Current Pack Status */}
          <div className="mb-6 p-4 bg-background-muted rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2 text-text-primary">Current Pack</h3>
            {pack ? (
              <div>
                <p className="text-lg font-medium text-success">✓ {pack.title}</p>
                <p className="text-sm text-text-secondary">
                  {getPackSummary(pack)}
                </p>
              </div>
            ) : (
              <p className="text-warning">No pack loaded</p>
            )}
          </div>

          {/* Available Built-in Packs */}
          <div className="mb-6">
            <PackLibrary
              currentPack={pack}
              onPackSelect={setPack}
            />
          </div>

          {/* Custom Pack Upload */}
          <div>
            <h4 className="text-md font-semibold mb-3 text-text-primary">Upload Custom Pack</h4>
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

          {error && (
            <div className="text-error text-sm bg-error/10 p-3 rounded border border-error">
              {error}
            </div>
          )}
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