import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameState, Team, Pack, Clue } from "./schema";

interface GameStore extends GameState {
  // Pack management
  setPack: (pack: Pack) => void;

  // Team management
  addTeam: (name: string) => void;
  removeTeam: (teamId: string) => void;
  updateTeamName: (teamId: string, name: string) => void;
  updateTeamScore: (teamId: string, score: number) => void;

  // Game flow
  openClue: (categoryId: string, value: number) => void;
  closeClue: () => void;
  revealAnswer: () => void;
  markCorrect: (teamId: string) => void;
  markIncorrect: () => void;

  // Board management
  setBoardDisabled: (disabled: boolean) => void;

  // History and undo
  undo: () => void;
  clearHistory: () => void;

  // Game state
  resetGame: () => void;
  isClueOpened: (categoryId: string, value: number) => boolean;
}

const initialState: GameState = {
  teams: [],
  boardDisabled: false,
  opened: {},
  history: [],
  pack: null,
  currentClue: null,
  showAnswer: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
    ...initialState,

    setPack: (pack: Pack) => {
      set((state) => ({
        pack,
        opened: {},
        history: [],
        currentClue: null,
        showAnswer: false,
      }));
    },

    addTeam: (name: string) => {
      const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      set((state) => ({
        teams: [...state.teams, { id, name, score: 0 }],
      }));
    },

    removeTeam: (teamId: string) => {
      set((state) => ({
        teams: state.teams.filter((team) => team.id !== teamId),
      }));
    },

    updateTeamName: (teamId: string, name: string) => {
      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, name } : team
        ),
      }));
    },

    updateTeamScore: (teamId: string, score: number) => {
      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, score } : team
        ),
      }));
    },

    openClue: (categoryId: string, value: number) => {
      const state = get();
      if (!state.pack) return;

      const category = state.pack.board.categories.find((cat) => cat.id === categoryId);
      if (!category) return;

      const clue = category.clues.find((c) => c.value === value);
      if (!clue) return;

      const key = `${categoryId}:${value}`;

      set({
        currentClue: { categoryId, value, clue },
        showAnswer: false,
        opened: { ...state.opened, [key]: true },
        boardDisabled: true,
      });

      // Add to history
      const action = {
        key,
        timestamp: Date.now(),
      };

      set((state) => ({
        history: [...state.history, action],
      }));
    },

    closeClue: () => {
      set({
        currentClue: null,
        showAnswer: false,
        boardDisabled: false,
      });
    },

    revealAnswer: () => {
      set({ showAnswer: true });
    },

    markCorrect: (teamId: string) => {
      const state = get();
      if (!state.currentClue) return;

      const points = state.currentClue.value;

      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId
            ? { ...team, score: team.score + points }
            : team
        ),
      }));

      // Add scoring action to history
      const action = {
        key: `${state.currentClue!.categoryId}:${state.currentClue!.value}`,
        teamId,
        delta: points,
        timestamp: Date.now(),
      };

      set((state) => ({
        history: [...state.history, action],
      }));

      get().closeClue();
    },

    markIncorrect: () => {
      get().closeClue();
    },

    setBoardDisabled: (disabled: boolean) => {
      set({ boardDisabled: disabled });
    },

    undo: () => {
      const state = get();
      if (state.history.length === 0) return;

      const lastAction = state.history[state.history.length - 1];

      // Undo the action
      if (lastAction.teamId && lastAction.delta) {
        // Undo scoring
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === lastAction.teamId
              ? { ...team, score: team.score - lastAction.delta! }
              : team
          ),
        }));
      }

      // Remove from opened if this was the action that opened it
      const actionsForThisClue = state.history.filter(
        (action) => action.key === lastAction.key
      );

      if (actionsForThisClue.length === 1) {
        // This was the only action for this clue, so close it
        set((state) => {
          const newOpened = { ...state.opened };
          delete newOpened[lastAction.key];
          return { opened: newOpened };
        });
      }

      // Remove from history
      set((state) => ({
        history: state.history.slice(0, -1),
      }));
    },

    clearHistory: () => {
      set({ history: [] });
    },

    resetGame: () => {
      set({
        ...initialState,
        pack: get().pack, // Keep the current pack
        teams: get().teams, // Keep the teams
      });
    },

    isClueOpened: (categoryId: string, value: number) => {
      const key = `${categoryId}:${value}`;
      return !!get().opened[key];
    },
  }),
  {
    name: 'swatch-it-storage',
    partialize: (state) => ({
      teams: state.teams,
      pack: state.pack,
      opened: state.opened,
    }),
  }
));