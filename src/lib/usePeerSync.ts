import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPeerSync, type ConnectionStatus, type PeerSyncMessage } from './peerSync';
import { useGameStore } from './store';

// Hook to set up peer sync listener in components
export function usePeerSyncListener() {
  const router = useRouter();
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    const peerSync = getPeerSync();

    // If we're a client and just mounted, request the latest state
    const status = peerSync.getStatus();
    if (status.role === 'client' && status.connected) {
      console.log('[usePeerSync] Component mounted as client, requesting state...');
      peerSync.requestState();
    }

    // Subscribe to messages from other peers
    const unsubscribe = peerSync.subscribe((message: PeerSyncMessage) => {
      console.log('[usePeerSync] Received message:', message);

      if (message.type === 'state_update') {
        // Apply state update from peer
        console.log('[usePeerSync] Applying state update:', {
          hasTeams: !!message.data.teams,
          hasPack: !!message.data.pack,
          openedCount: Object.keys(message.data.opened || {}).length
        });
        useGameStore.getState().applySyncUpdate(message.data);
      } else if (message.type === 'action') {
        // Handle action from peer (e.g., opening a question, marking correct)
        handlePeerAction(message.action, message.payload);
      } else if (message.type === 'navigate') {
        // Handle navigation from peer using Next.js router (client-side navigation)
        // This preserves the WebRTC connection unlike window.location.href
        console.log('[usePeerSync] Navigating to:', message.path);
        router.push(message.path);
      }
    });

    // Subscribe to connection status changes to detect disconnections
    const unsubscribeStatus = peerSync.subscribeStatus((status: ConnectionStatus) => {
      console.log('[usePeerSync] Connection status changed:', status);

      // Track if we were previously connected
      if (status.role === 'client' && status.connected) {
        setWasConnected(true);
      }

      // If we're a client and we were connected but now we're not, show reconnection modal
      if (status.role === 'client' && wasConnected && !status.connected) {
        console.log('[usePeerSync] Connection lost, showing reconnection modal');
        setShowReconnectModal(true);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [router, wasConnected]);

  return { showReconnectModal, setShowReconnectModal };
}

// Handle actions received from peers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handlePeerAction(action: string, payload?: any) {
  const store = useGameStore.getState();

  switch (action) {
    case 'openQuestion':
      store.openQuestion(payload.categoryId, payload.value);
      break;
    case 'closeQuestion':
      store.closeQuestion();
      break;
    case 'revealAnswer':
      store.revealAnswer();
      break;
    case 'markCorrect':
      store.markCorrect(payload.teamId);
      break;
    case 'markIncorrect':
      store.markIncorrect();
      break;
    case 'undo':
      store.undo();
      break;
    default:
      console.warn('[usePeerSync] Unknown action:', action);
  }
}

// Hook to monitor peer connection status
export function usePeerStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    peerId: null,
    role: 'disabled',
    connectedDevices: 0,
  });

  useEffect(() => {
    const peerSync = getPeerSync();

    // Subscribe to status updates
    const unsubscribe = peerSync.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return status;
}

// Hook to enable host mode
export function useEnableHost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);

  const enableHost = async () => {
    console.log('[useEnableHost] 🎬 enableHost() called from UI');
    setLoading(true);
    setError(null);

    try {
      console.log('[useEnableHost] Getting PeerSync instance...');
      const peerSync = getPeerSync();
      console.log('[useEnableHost] PeerSync instance obtained, calling enableHost()...');

      const id = await peerSync.enableHost();

      console.log('[useEnableHost] ✅ Host enabled successfully with ID:', id);
      setHostId(id);

      // Update store with host role
      console.log('[useEnableHost] Updating store with host role...');
      useGameStore.getState().setMultiDeviceMode('host', id);

      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable host mode';
      console.error('[useEnableHost] ❌ Error occurred:', err);
      console.error('[useEnableHost] Error message:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      console.log('[useEnableHost] Setting loading to false');
      setLoading(false);
    }
  };

  return { enableHost, loading, error, hostId };
}

// Hook to join a host
export function useJoinHost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinHost = async (hostId: string) => {
    setLoading(true);
    setError(null);

    try {
      const peerSync = getPeerSync();
      await peerSync.joinHost(hostId);

      // Update store with client role
      useGameStore.getState().setMultiDeviceMode('client', hostId);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join host';
      setError(errorMessage);
      console.error('[useJoinHost] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { joinHost, loading, error };
}

// Hook to disconnect from peer network
export function useDisconnectPeer() {
  const disconnect = () => {
    const peerSync = getPeerSync();
    peerSync.disconnect();

    // Update store to disabled mode
    useGameStore.getState().setMultiDeviceMode('disabled', null);
  };

  return { disconnect };
}
