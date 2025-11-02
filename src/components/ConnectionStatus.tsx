"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { usePeerStatus } from "@/lib/usePeerSync";

export default function ConnectionStatus() {
  const status = usePeerStatus();
  const [isMounted, setIsMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Don't show anything if multi-device mode is disabled
  if (status.role === 'disabled') {
    return null;
  }

  const handleCopyRoomCode = () => {
    if (status.peerId) {
      navigator.clipboard.writeText(status.peerId);
      // You could add a toast notification here if desired
    }
  };

  return (
    <>
      {/* Status Badge - Clickable */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowDetails(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all hover:scale-105 ${
            status.connected
              ? "bg-success/90 hover:bg-success text-white"
              : "bg-error/90 hover:bg-error text-white"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            status.connected ? "bg-white animate-pulse" : "bg-white/50"
          }`}></div>
          <div className="text-sm font-medium">
            {status.role === 'host' ? (
              <>
                <span className="font-semibold">Host Mode</span>
                <span className="ml-2 text-xs">
                  ({status.connectedDevices} device{status.connectedDevices !== 1 ? 's' : ''})
                </span>
              </>
            ) : status.role === 'client' ? (
              <>
                <span className="font-semibold">
                  {status.connected ? "Connected" : "Disconnected"}
                </span>
                {!status.connected && (
                  <span className="ml-2 text-xs">(Reconnecting...)</span>
                )}
              </>
            ) : null}
          </div>
        </button>
      </div>

      {/* Connection Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-card rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-text-primary">
                Connection Details
              </h2>
              <p className="text-text-secondary text-sm">
                {status.role === 'host'
                  ? 'Share this room code with other devices to connect'
                  : 'Your connection information'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Role */}
              <div className="bg-background-muted rounded-lg p-4">
                <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                  Mode
                </div>
                <div className="text-lg font-bold text-text-primary">
                  {status.role === 'host' ? 'Host' : 'Client'}
                </div>
              </div>

              {/* Room Code */}
              {status.peerId && (
                <div className="bg-background-muted rounded-lg p-4">
                  <div className="text-xs text-text-secondary uppercase tracking-wide mb-2 text-center">
                    Room Code
                  </div>

                  {/* QR Code - Only show for host mode */}
                  {status.role === 'host' && (
                    <div className="flex justify-center mb-4">
                      <QRCodeSVG
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join?room=${status.peerId}`}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                  )}

                  {/* Room Code Text */}
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-lg font-mono font-bold text-primary break-all text-center">
                      {status.peerId}
                    </code>
                    <button
                      onClick={handleCopyRoomCode}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors"
                      title="Copy room code"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Connection Status */}
              <div className="bg-background-muted rounded-lg p-4">
                <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                  Status
                </div>
                <div className={`text-lg font-bold ${
                  status.connected ? 'text-success' : 'text-error'
                }`}>
                  {status.connected ? 'Connected' : 'Disconnected'}
                </div>
              </div>

              {/* Connected Devices (Host Only) */}
              {status.role === 'host' && (
                <div className="bg-background-muted rounded-lg p-4">
                  <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                    Connected Devices
                  </div>
                  <div className="text-lg font-bold text-text-primary">
                    {status.connectedDevices}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-6 px-6 py-3 bg-text-secondary text-white rounded-lg font-medium hover:bg-text-secondary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
