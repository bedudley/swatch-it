import { GameState } from "./schema";

const STORAGE_KEY = "swatch-it-game-state";

export const saveGameState = (state: Partial<GameState>) => {
  try {
    const existing = loadGameState();
    const merged = { ...existing, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.warn("Failed to save game state:", error);
  }
};

export const loadGameState = (): Partial<GameState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Failed to load game state:", error);
  }
  return {};
};

export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear game state:", error);
  }
};

export const exportGameState = (state: GameState) => {
  const exportData = {
    pack: state.pack,
    teams: state.teams,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `swatch-it-game-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};