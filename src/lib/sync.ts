import type { GameState } from './schema';

// Cross-tab state synchronization using BroadcastChannel API
export class GameSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(data: Partial<GameState>) => void> = new Set();
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;

    if (this.isSupported) {
      this.channel = new BroadcastChannel('swatch-it-game');
      this.channel.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent) {
    // Notify all listeners of the incoming state update
    this.listeners.forEach(listener => {
      try {
        listener(event.data);
      } catch (error) {
        console.warn('Error in sync listener:', error);
      }
    });
  }

  // Broadcast state changes to other tabs
  broadcast(stateUpdate: Partial<GameState>) {
    if (this.channel) {
      try {
        // Send state update directly - no extra wrapping
        this.channel.postMessage(stateUpdate);
      } catch (error) {
        console.warn('Failed to broadcast state:', error);
      }
    }
  }

  // Subscribe to state updates from other tabs
  subscribe(listener: (data: Partial<GameState>) => void) {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Check if cross-tab sync is available
  get supported() {
    return this.isSupported;
  }

  // Clean up resources
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
let syncInstance: GameSync | null = null;

export function getGameSync(): GameSync {
  if (!syncInstance) {
    syncInstance = new GameSync();
  }
  return syncInstance;
}