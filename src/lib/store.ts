import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameState, Pack, MultiDeviceMode } from "./schema";
import { getGameSync } from "./sync";
import { getPeerSync } from "./peerSync";
import { getQuestion } from "./packUtils";

interface GameStore extends GameState {
  // Pack management
  setPack: (pack: Pack) => void;

  // Team management
  addTeam: (name: string) => void;
  removeTeam: (teamId: string) => void;
  updateTeamName: (teamId: string, name: string) => void;
  updateTeamScore: (teamId: string, score: number) => void;

  // Game flow
  openQuestion: (categoryId: string, value: number) => void;
  closeQuestion: () => void;
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
  isQuestionOpened: (categoryId: string, value: number) => boolean;

  // Multi-device mode
  setMultiDeviceMode: (mode: MultiDeviceMode, roomId: string | null) => void;

  // Sync actions
  applySyncUpdate: (syncData: Partial<GameState>) => void;
}

const initialState: GameState = {
  teams: [],
  boardDisabled: false,
  opened: {},
  history: [],
  pack: null,
  currentQuestion: null,
  showAnswer: false,
  multiDeviceMode: 'disabled',
  hostRoomId: null,
};

// Initialize sync
const gameSync = getGameSync();
const peerSync = getPeerSync();

// Set up callback for initial state sync when new clients connect
peerSync.setOnNewClientConnected((conn) => {
  console.log('[Store] New client connected, sending initial game state...');

  // Get the current full game state from the store
  const currentState = useGameStore.getState();

  // Extract the game state (exclude methods)
  const gameState: Partial<GameState> = {
    teams: currentState.teams,
    boardDisabled: currentState.boardDisabled,
    opened: currentState.opened,
    history: currentState.history,
    pack: currentState.pack,
    currentQuestion: currentState.currentQuestion,
    showAnswer: currentState.showAnswer,
    multiDeviceMode: currentState.multiDeviceMode,
    hostRoomId: currentState.hostRoomId,
  };

  console.log('[Store] Sending game state to new client:', {
    teamsCount: gameState.teams?.length,
    packTitle: gameState.pack?.title,
    openedQuestionsCount: Object.keys(gameState.opened || {}).length,
  });

  // Use the sendInitialStateToClient method
  peerSync.sendInitialStateToClient(conn, gameState);
});

// Helper to broadcast state changes (both BroadcastChannel and PeerJS)
const broadcastState = (partialState: Partial<GameState>) => {
  console.log('Broadcasting state:', partialState); // Debug log

  // Broadcast via BroadcastChannel (same-device tabs)
  gameSync.broadcast(partialState);

  // Broadcast via PeerJS (cross-device)
  if (peerSync.isActive) {
    peerSync.broadcastState(partialState);
  }
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
    ...initialState,

    setPack: (pack: Pack) => {
      const newState = {
        pack,
        opened: {},
        history: [],
        currentQuestion: null,
        showAnswer: false,
      };
      set(newState);
      broadcastState(newState);
    },

    addTeam: (name: string) => {
      const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTeam = { id, name, score: 0 };
      const state = get();
      const updatedTeams = [...state.teams, newTeam];

      set({ teams: updatedTeams });

      // Broadcast team addition
      broadcastState({ teams: updatedTeams });
    },

    removeTeam: (teamId: string) => {
      const state = get();
      const updatedTeams = state.teams.filter((team) => team.id !== teamId);

      set({ teams: updatedTeams });

      // Broadcast team removal
      broadcastState({ teams: updatedTeams });
    },

    updateTeamName: (teamId: string, name: string) => {
      const state = get();
      const updatedTeams = state.teams.map((team) =>
        team.id === teamId ? { ...team, name } : team
      );

      set({ teams: updatedTeams });

      // Broadcast team name update
      broadcastState({ teams: updatedTeams });
    },

    updateTeamScore: (teamId: string, score: number) => {
      const state = get();
      const updatedTeams = state.teams.map((team) =>
        team.id === teamId ? { ...team, score } : team
      );

      set({ teams: updatedTeams });

      // Broadcast team score update
      broadcastState({ teams: updatedTeams });
    },

    openQuestion: (categoryId: string, value: number) => {
      const state = get();
      if (!state.pack) return;

      const question = getQuestion(state.pack, categoryId, value);
      if (!question) return;

      const key = `${categoryId}:${value}`;

      const newState = {
        currentQuestion: { categoryId, value, question },
        showAnswer: false,
        opened: { ...state.opened, [key]: true },
        boardDisabled: true,
      };

      set(newState);
      broadcastState(newState);

      // Add to history
      const action = {
        key,
        timestamp: Date.now(),
      };

      set((state) => ({
        history: [...state.history, action],
      }));
    },

    closeQuestion: () => {
      const state = get();

      // If there's a current question, check if it was scored
      let updatedOpened = state.opened;
      if (state.currentQuestion) {
        const key = `${state.currentQuestion.categoryId}:${state.currentQuestion.value}`;

        // Check if this question was scored (has a scoring action in history)
        const wasScored = state.history.some(
          action => action.key === key && action.teamId && action.delta
        );

        // If not scored, remove from opened so it can be clicked again
        if (!wasScored) {
          updatedOpened = { ...state.opened };
          delete updatedOpened[key];
        }
      }

      const newState = {
        currentQuestion: null,
        showAnswer: false,
        boardDisabled: false,
        opened: updatedOpened,
      };
      set(newState);
      broadcastState(newState);
    },

    revealAnswer: () => {
      const newState = { showAnswer: true };
      set(newState);
      broadcastState(newState);
    },

    markCorrect: (teamId: string) => {
      const state = get();
      if (!state.currentQuestion) return;

      const points = state.currentQuestion.value;

      const updatedTeams = state.teams.map((team) =>
        team.id === teamId
          ? { ...team, score: team.score + points }
          : team
      );

      set({ teams: updatedTeams });

      // Broadcast team score update
      broadcastState({ teams: updatedTeams });

      // Add scoring action to history
      const action = {
        key: `${state.currentQuestion!.categoryId}:${state.currentQuestion!.value}`,
        teamId,
        delta: points,
        timestamp: Date.now(),
      };

      set((state) => ({
        history: [...state.history, action],
      }));

      get().closeQuestion();
    },

    markIncorrect: () => {
      get().closeQuestion();
    },

    setBoardDisabled: (disabled: boolean) => {
      set({ boardDisabled: disabled });
    },

    undo: () => {
      const state = get();
      if (state.history.length === 0) return;

      const lastAction = state.history[state.history.length - 1];
      let updatedTeams = state.teams;
      let updatedOpened = state.opened;

      // Undo the action
      if (lastAction.teamId && lastAction.delta) {
        // Undo scoring
        updatedTeams = state.teams.map((team) =>
          team.id === lastAction.teamId
            ? { ...team, score: team.score - lastAction.delta! }
            : team
        );
      }

      // Remove from opened if this was the action that opened it
      const actionsForThisClue = state.history.filter(
        (action) => action.key === lastAction.key
      );

      if (actionsForThisClue.length === 1) {
        // This was the only action for this clue, so close it
        updatedOpened = { ...state.opened };
        delete updatedOpened[lastAction.key];
      }

      // Update state
      set({
        teams: updatedTeams,
        opened: updatedOpened,
        history: state.history.slice(0, -1),
      });

      // Broadcast undo changes
      broadcastState({
        teams: updatedTeams,
        opened: updatedOpened,
      });
    },

    clearHistory: () => {
      set({ history: [] });
    },

    resetGame: () => {
      const state = get();
      const resetTeams = state.teams.map(team => ({
        ...team,
        score: 0 // Reset all scores to 0
      }));

      const newState = {
        ...initialState,
        pack: state.pack, // Keep the current pack
        teams: resetTeams, // Keep teams but reset scores
      };

      set(newState);
      broadcastState(newState);
    },

    isQuestionOpened: (categoryId: string, value: number) => {
      const key = `${categoryId}:${value}`;
      return !!get().opened[key];
    },

    setMultiDeviceMode: (mode: MultiDeviceMode, roomId: string | null) => {
      const newState = {
        multiDeviceMode: mode,
        hostRoomId: roomId,
      };
      set(newState);

      // Don't broadcast this state change (it's peer-specific)
      // Each device manages its own connection state
    },

    applySyncUpdate: (syncData: Partial<GameState>) => {
      console.log('Applying sync update:', syncData); // Debug log
      set((state) => ({
        ...state,
        ...syncData,
      }));
    },
  }),
  {
    name: 'swatch-it-storage',
    partialize: (state) => {
      // Don't persist anything when in client mode - host will send state
      if (state.multiDeviceMode === 'client') {
        return {};
      }
      // Normal persistence for host and disabled modes
      return {
        teams: state.teams,
        pack: state.pack,
        opened: state.opened,
      };
    },
    // Custom storage that skips loading when joining as client
    storage: {
      getItem: (name) => {
        // Check if we're joining as a client (coming from /join with room param)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const isJoiningAsClient = urlParams.get('room') !== null;

          if (isJoiningAsClient) {
            console.log('[Store] Client mode detected - skipping localStorage load');
            return null; // Return null to use initial state instead
          }
        }

        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
      },
      setItem: (name, value) => {
        localStorage.setItem(name, JSON.stringify(value));
      },
      removeItem: (name) => {
        localStorage.removeItem(name);
      },
    },
  }
));

// Note: Sync listener is set up in useSyncListener hook