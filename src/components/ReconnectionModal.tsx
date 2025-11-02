"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getPeerSync } from "@/lib/peerSync";
import { useGameStore } from "@/lib/store";

interface ReconnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconnect: () => void;
}

export default function ReconnectionModal({ isOpen, onClose }: ReconnectionModalProps) {
  const router = useRouter();
  const hostRoomId = useGameStore((state) => state.hostRoomId);
  const [reconnectState, setReconnectState] = useState({
    isReconnecting: false,
    attempt: 0,
    maxAttempts: 5
  });

  // Poll reconnection state
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const peerSync = getPeerSync();
      const state = peerSync.getReconnectionState();
      setReconnectState(state);
    }, 100); // Poll every 100ms for smooth UI updates

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTryAgain = async () => {
    console.log('[ReconnectionModal] Try again clicked - attempting manual reconnect');
    const peerSync = getPeerSync();

    if (!hostRoomId) {
      console.error('[ReconnectionModal] No hostRoomId available');
      return;
    }

    // Reset reconnection attempts and try again
    peerSync.cancelReconnection();

    try {
      await peerSync.joinHost(hostRoomId);
      console.log('[ReconnectionModal] Manual reconnect successful');
      useGameStore.setState({ lastConnectedAt: Date.now() });
      onClose();
    } catch (error) {
      console.error('[ReconnectionModal] Manual reconnect failed:', error);
      // Will show failed state again
    }
  };

  const handleJoinNewGame = () => {
    console.log('[ReconnectionModal] Join new game clicked');
    const peerSync = getPeerSync();
    peerSync.cancelReconnection();
    // Clear client session data
    useGameStore.getState().setMultiDeviceMode('disabled', null);
    // Redirect to join page without room param for fresh join
    router.push('/join');
  };

  const handleContinueOffline = () => {
    console.log('[ReconnectionModal] Continue offline clicked');
    const peerSync = getPeerSync();
    peerSync.cancelReconnection();
    onClose();
  };

  // Show different UI based on reconnection state
  const isAttempting = reconnectState.isReconnecting;
  const failedAllAttempts = reconnectState.attempt >= reconnectState.maxAttempts && !isAttempting;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          {isAttempting ? (
            // Reconnecting state
            <>
              <div className="text-5xl mb-4 animate-pulse">🔄</div>
              <h2 className="text-2xl font-bold mb-2 text-text-primary">
                Reconnecting...
              </h2>
              <p className="text-text-secondary mb-2">
                Attempting to restore connection to display
              </p>
              <p className="text-sm text-primary font-medium">
                Attempt {reconnectState.attempt} of {reconnectState.maxAttempts}
              </p>
            </>
          ) : failedAllAttempts ? (
            // Failed state
            <>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-2xl font-bold mb-2 text-error">
                Connection Failed
              </h2>
              <p className="text-text-secondary mb-4">
                Unable to reconnect after {reconnectState.maxAttempts} attempts.
              </p>

              {/* QR Code for easy rejoin */}
              {hostRoomId && (
                <div className="bg-background-muted rounded-lg p-4 mb-4">
                  <div className="flex justify-center mb-3">
                    <QRCodeSVG
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?room=${hostRoomId}`}
                      size={150}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-text-secondary mb-1">Room Code:</div>
                    <code className="text-sm font-mono font-bold text-primary">{hostRoomId}</code>
                  </div>
                  <p className="text-xs text-text-secondary mt-2 text-center">
                    Scan to rejoin or enter room code manually
                  </p>
                </div>
              )}
            </>
          ) : (
            // Initial disconnected state (before auto-reconnect starts)
            <>
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2 text-text-primary">
                Connection Lost
              </h2>
              <p className="text-text-secondary">
                The connection to the display was lost. Attempting to reconnect...
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          {failedAllAttempts ? (
            // Show reconnect options after failure
            <>
              <button
                onClick={handleTryAgain}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={handleJoinNewGame}
                className="w-full px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Join New Game
              </button>

              <button
                onClick={handleContinueOffline}
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Continue Offline
              </button>
            </>
          ) : isAttempting ? (
            // Show cancel button during reconnection
            <button
              onClick={handleContinueOffline}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel Auto-Reconnect
            </button>
          ) : (
            // Initial state - show loading indicator
            <div className="w-full px-6 py-3 bg-primary/20 text-primary rounded-lg font-medium text-center">
              Starting auto-reconnect...
            </div>
          )}
        </div>

        {!failedAllAttempts && (
          <p className="text-xs text-text-secondary text-center mt-4">
            Auto-reconnecting with exponential backoff
          </p>
        )}
      </div>
    </div>
  );
}
