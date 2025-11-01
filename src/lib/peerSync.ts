import Peer, { DataConnection } from 'peerjs';
import type { GameState } from './schema';

export type PeerRole = 'disabled' | 'host' | 'client';
export type PeerSyncMessage = {
  type: 'state_update';
  data: Partial<GameState>;
} | {
  type: 'action';
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
} | {
  type: 'navigate';
  path: string;
} | {
  type: 'request_state';
};

export type ConnectionStatus = {
  connected: boolean;
  peerId: string | null;
  role: PeerRole;
  connectedDevices: number;
};

// Cross-device state synchronization using PeerJS (WebRTC)
export class PeerGameSync {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private role: PeerRole = 'disabled';
  private listeners: Set<(message: PeerSyncMessage) => void> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private hostConnection: DataConnection | null = null;
  private onNewClientConnected: ((conn: DataConnection) => void) | null = null;

  constructor() {
    // Will initialize when enableHost() or joinHost() is called
  }

  // Set callback for when a new client connects (host only)
  setOnNewClientConnected(callback: (conn: DataConnection) => void) {
    this.onNewClientConnected = callback;
  }

  // Initialize as host (creates a new peer ID and waits for connections)
  async enableHost(): Promise<string> {
    console.log('[PeerSync] 🚀 enableHost() called');

    if (this.peer) {
      console.error('[PeerSync] ❌ Peer already initialized');
      throw new Error('Peer already initialized');
    }

    return new Promise((resolve, reject) => {
      // Set a timeout to catch if PeerJS server is unresponsive
      const timeout = setTimeout(() => {
        console.error('[PeerSync] ⏱️ Timeout: PeerJS did not connect within 15 seconds');
        console.error('[PeerSync] This usually means the PeerJS cloud server is down or unreachable');
        if (this.peer) {
          this.peer.destroy();
          this.peer = null;
        }
        reject(new Error('Connection to PeerJS server timed out. The PeerJS cloud server may be down.'));
      }, 15000);

      try {
        console.log('[PeerSync] 📡 Creating new Peer instance...');
        console.log('[PeerSync] Peer constructor available:', typeof Peer);

        // Create a new peer with STUN server configuration for better NAT traversal
        // Try with explicit host/port (using peerjs.com cloud server)
        this.peer = new Peer({
          host: '0.peerjs.com',
          port: 443,
          path: '/',
          secure: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ]
          },
          debug: 3, // Enable maximum debug logging
        });

        console.log('[PeerSync] ✅ Peer instance created:', this.peer);
        console.log('[PeerSync] Attempting to connect to PeerJS cloud server at 0.peerjs.com:443...');
        this.role = 'host';

        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          console.log('[PeerSync] ✅ Host enabled with ID:', id);
          console.log('[PeerSync] Ready to accept client connections');
          this.notifyStatusChange();
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          console.log('[PeerSync] New client connected:', conn.peer);
          this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (error) => {
          clearTimeout(timeout);
          console.error('[PeerSync] ❌ Peer error:', error);
          console.error('[PeerSync] Error type:', error.type);
          console.error('[PeerSync] Full error:', JSON.stringify(error, null, 2));
          reject(error);
        });

        this.peer.on('disconnected', () => {
          console.warn('[PeerSync] ⚠️ Peer disconnected');
          this.notifyStatusChange();
        });

        console.log('[PeerSync] Event listeners registered, waiting for "open" event...');
      } catch (error) {
        clearTimeout(timeout);
        console.error('[PeerSync] ❌ Exception in enableHost:', error);
        reject(error);
      }
    });
  }

  // Join an existing host as a client
  async joinHost(hostId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set a timeout to catch if PeerJS server is unresponsive
      const timeout = setTimeout(() => {
        console.error('[PeerSync] ⏱️ Timeout: PeerJS did not connect within 15 seconds');
        if (this.peer) {
          this.peer.destroy();
          this.peer = null;
        }
        reject(new Error('Connection to PeerJS server timed out.'));
      }, 15000);

      try {
        // Create a new peer with STUN server configuration for better NAT traversal
        this.peer = new Peer({
          host: '0.peerjs.com',
          port: 443,
          path: '/',
          secure: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ]
          },
          debug: 3, // Enable maximum debug logging
        });
        this.role = 'client';

        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          console.log('[PeerSync] ✅ Client initialized with ID:', id);
          console.log('[PeerSync] 🔄 Attempting to connect to host:', hostId);

          // Connect to the host
          const conn = this.peer!.connect(hostId, {
            reliable: true, // Use reliable data channel
          });

          this.hostConnection = conn;

          conn.on('open', () => {
            console.log('[PeerSync] ✅ Successfully connected to host!');
            console.log('[PeerSync] Connection is open and ready for data transfer');
            this.notifyStatusChange();
            resolve();
          });

          conn.on('data', (data) => {
            const message = data as PeerSyncMessage;
            console.log('[PeerSync] 📥 Received from host:', message.type);
            this.handleMessage(message);
          });

          conn.on('close', () => {
            console.warn('[PeerSync] ⚠️ Connection to host closed');
            this.hostConnection = null;
            this.notifyStatusChange();
          });

          conn.on('error', (error) => {
            console.error('[PeerSync] ❌ Connection error:', error);
            reject(error);
          });
        });

        this.peer.on('error', (error) => {
          clearTimeout(timeout);
          console.error('[PeerSync] ❌ Peer error:', error);
          console.error('[PeerSync] Error type:', error.type);
          reject(error);
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // Handle incoming connections (host only)
  private handleIncomingConnection(conn: DataConnection) {
    if (this.role !== 'host') return;

    conn.on('open', () => {
      console.log('[PeerSync] ✅ Client connection opened:', conn.peer);
      console.log('[PeerSync] Total connected devices:', this.connections.size + 1);
      this.connections.set(conn.peer, conn);
      this.notifyStatusChange();

      // Request initial state sync callback
      if (this.onNewClientConnected) {
        console.log('[PeerSync] Requesting initial state for new client...');
        this.onNewClientConnected(conn);
      }
    });

    conn.on('data', (data) => {
      // Receive messages from clients and relay to other clients
      const message = data as PeerSyncMessage;
      console.log('[PeerSync] 📥 Received from client:', message.type, 'from:', conn.peer);

      // Handle state request from client
      if (message.type === 'request_state') {
        console.log('[PeerSync] Client requested state, sending full state...');
        if (this.onNewClientConnected) {
          this.onNewClientConnected(conn);
        }
        return; // Don't relay state requests
      }

      // Notify listeners (which will update local state on the host)
      this.handleMessage(message);

      // Relay ALL message types to other clients (not just actions)
      // This ensures that state updates, actions, and navigation all sync
      console.log('[PeerSync] 📤 Relaying to', this.connections.size - 1, 'other clients');
      this.broadcast(message, conn.peer);
    });

    conn.on('close', () => {
      console.log('[PeerSync] ⚠️ Client disconnected:', conn.peer);
      this.connections.delete(conn.peer);
      this.notifyStatusChange();
    });

    conn.on('error', (error) => {
      console.error('[PeerSync] ❌ Connection error with client:', error);
      this.connections.delete(conn.peer);
      this.notifyStatusChange();
    });
  }

  // Send initial state to a newly connected client (host only)
  // NOTE: This will be called from the store after connection is established
  sendInitialStateToClient(conn: DataConnection, gameState: Partial<GameState>) {
    console.log('[PeerSync] 📤 Sending full game state to client:', conn.peer);
    const message: PeerSyncMessage = {
      type: 'state_update',
      data: gameState,
    };

    try {
      conn.send(message);
      console.log('[PeerSync] ✅ Initial state sent successfully');
    } catch (error) {
      console.error('[PeerSync] ❌ Failed to send initial state:', error);
    }
  }

  // Handle incoming messages
  private handleMessage(message: PeerSyncMessage) {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.warn('[PeerSync] Error in message listener:', error);
      }
    });
  }

  // Broadcast state update to all connected peers
  broadcastState(stateUpdate: Partial<GameState>) {
    const message: PeerSyncMessage = {
      type: 'state_update',
      data: stateUpdate,
    };

    if (this.role === 'host') {
      // Host broadcasts to all clients
      console.log('[PeerSync] 📤 Broadcasting state to', this.connections.size, 'clients');
      this.broadcast(message);
    } else if (this.role === 'client' && this.hostConnection?.open) {
      // Client sends to host (host will relay to others)
      console.log('[PeerSync] 📤 Sending state to host for relay');
      this.hostConnection.send(message);
    }
  }

  // Send action from client to host (or broadcast from host)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendAction(action: string, payload?: any) {
    const message: PeerSyncMessage = {
      type: 'action',
      action,
      payload,
    };

    if (this.role === 'host') {
      // Host broadcasts to all clients
      this.broadcast(message);
    } else if (this.role === 'client' && this.hostConnection?.open) {
      // Client sends to host
      this.hostConnection.send(message);
    }
  }

  // Send navigation command to all peers
  sendNavigation(path: string) {
    const message: PeerSyncMessage = {
      type: 'navigate',
      path,
    };

    if (this.role === 'host') {
      // Host broadcasts to all clients
      console.log('[PeerSync] 📤 Broadcasting navigation to', path, 'for', this.connections.size, 'clients');
      this.broadcast(message);
    } else if (this.role === 'client' && this.hostConnection?.open) {
      // Client sends to host (host will relay to others)
      console.log('[PeerSync] 📤 Sending navigation to', path, 'to host for relay');
      this.hostConnection.send(message);
    }
  }

  // Request full state from host (client only)
  requestState() {
    if (this.role === 'client' && this.hostConnection?.open) {
      console.log('[PeerSync] 📤 Requesting state from host');
      const message: PeerSyncMessage = {
        type: 'request_state',
      };
      this.hostConnection.send(message);
    }
  }

  // Broadcast a message to all connected peers (except the excluded one)
  private broadcast(message: PeerSyncMessage, excludePeerId?: string) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        try {
          conn.send(message);
        } catch (error) {
          console.warn('[PeerSync] Failed to send to peer:', peerId, error);
        }
      }
    });
  }

  // Subscribe to messages
  subscribe(listener: (message: PeerSyncMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Subscribe to connection status changes
  subscribeStatus(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.add(listener);
    // Send initial status
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  // Notify status listeners
  private notifyStatusChange() {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.warn('[PeerSync] Error in status listener:', error);
      }
    });
  }

  // Get current connection status
  getStatus(): ConnectionStatus {
    return {
      connected: this.role === 'host'
        ? this.peer?.open ?? false
        : this.hostConnection?.open ?? false,
      peerId: this.peer?.id ?? null,
      role: this.role,
      connectedDevices: this.connections.size,
    };
  }

  // Get the host room ID (peer ID)
  getHostId(): string | null {
    return this.role === 'host' ? this.peer?.id ?? null : null;
  }

  // Disconnect and clean up
  disconnect() {
    console.log('[PeerSync] Disconnecting...');

    // Close all client connections
    this.connections.forEach((conn) => {
      conn.close();
    });
    this.connections.clear();

    // Close host connection
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }

    // Destroy peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.role = 'disabled';
    this.listeners.clear();
    this.statusListeners.clear();

    console.log('[PeerSync] Disconnected');
  }

  // Check if peer sync is active
  get isActive() {
    return this.role !== 'disabled' && this.peer !== null;
  }
}

// Singleton instance
let peerSyncInstance: PeerGameSync | null = null;

export function getPeerSync(): PeerGameSync {
  if (!peerSyncInstance) {
    peerSyncInstance = new PeerGameSync();
  }
  return peerSyncInstance;
}
