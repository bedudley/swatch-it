import { useEffect } from 'react';
import { getGameSync } from './sync';
import { useGameStore } from './store';

// Hook to set up sync listener in components
export function useSyncListener() {
  useEffect(() => {
    const gameSync = getGameSync();

    // Subscribe to state updates from other tabs
    const unsubscribe = gameSync.subscribe((stateUpdate) => {
      console.log('Received state update:', stateUpdate); // Debug log

      // Apply state update directly - no type checking needed
      useGameStore.getState().applySyncUpdate(stateUpdate);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
}

// Hook to check sync status
export function useSyncStatus() {
  const gameSync = getGameSync();
  return {
    supported: gameSync.supported,
    connected: gameSync.supported,
  };
}