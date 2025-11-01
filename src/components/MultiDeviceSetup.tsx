"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useEnableHost, usePeerStatus, useDisconnectPeer } from "@/lib/usePeerSync";

export default function MultiDeviceSetup() {
  const { enableHost, loading, error } = useEnableHost();
  const { disconnect } = useDisconnectPeer();
  const status = usePeerStatus();

  const [joinUrl, setJoinUrl] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Generate join URL when we have a peer ID
    if (isMounted && status.connected && status.peerId && status.role === 'host') {
      const url = `${window.location.origin}/join?room=${status.peerId}`;
      setJoinUrl(url);
      setShowQR(true);
    } else if (isMounted) {
      setJoinUrl("");
      setShowQR(false);
    }
  }, [isMounted, status.connected, status.peerId, status.role]);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Multi-Device Mode</h2>
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const handleEnableMultiDevice = async () => {
    console.log('[MultiDeviceSetup] 🔘 Enable button clicked');
    try {
      console.log('[MultiDeviceSetup] Calling enableHost()...');
      await enableHost();
      console.log('[MultiDeviceSetup] ✅ enableHost() completed successfully');
    } catch (err) {
      console.error("[MultiDeviceSetup] ❌ Failed to enable multi-device mode:", err);
    }
  };

  const handleDisableMultiDevice = () => {
    disconnect();
  };

  const copyToClipboard = () => {
    if (joinUrl) {
      navigator.clipboard.writeText(joinUrl);
    }
  };

  const copyRoomCode = () => {
    if (status.peerId) {
      navigator.clipboard.writeText(status.peerId);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-text-primary">Multi-Device Mode</h2>

      <p className="text-text-secondary mb-6">
        Enable multi-device mode to control the game from your phone or tablet while displaying the board on a TV or projector.
      </p>

      {status.role === 'disabled' ? (
        <div>
          <button
            onClick={handleEnableMultiDevice}
            disabled={loading}
            className={`px-8 py-4 text-lg rounded-lg text-white font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 active:bg-primary/80"
            }`}
          >
            {loading ? "Enabling..." : "Enable Multi-Device Mode"}
          </button>

          {error && (
            <div className="mt-4 text-error text-sm bg-error/10 p-3 rounded border border-error">
              {error}
            </div>
          )}
        </div>
      ) : status.role === 'host' ? (
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="p-4 bg-success/10 border border-success rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <p className="text-lg font-semibold text-success">
                Multi-Device Mode Active
              </p>
            </div>
            <p className="text-text-secondary text-sm">
              Connected devices: {status.connectedDevices}
            </p>
          </div>

          {/* QR Code and Join URL */}
          {showQR && joinUrl && (
            <div className="space-y-4">
              <div className="flex flex-col items-center p-6 bg-background-muted rounded-lg border border-border">
                <p className="text-lg font-semibold mb-4 text-text-primary">
                  Scan to Join
                </p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCodeSVG value={joinUrl} size={200} level="M" />
                </div>
                <p className="text-sm text-text-secondary mt-4 text-center max-w-xs">
                  Scan this QR code with your phone or tablet to join as a controller
                </p>
              </div>

              {/* Manual Join Options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Join URL (click to copy)
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="w-full p-3 text-left bg-background-muted border border-border rounded-lg hover:bg-background-light transition-colors font-mono text-sm break-all"
                  >
                    {joinUrl}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Room Code (click to copy)
                  </label>
                  <button
                    onClick={copyRoomCode}
                    className="w-full p-3 text-left bg-background-muted border border-border rounded-lg hover:bg-background-light transition-colors font-mono text-sm break-all"
                  >
                    {status.peerId}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleDisableMultiDevice}
            className="px-8 py-3 text-base rounded-lg bg-error text-white hover:bg-error/90 active:bg-error/80 font-medium transition-colors"
          >
            Disable Multi-Device Mode
          </button>

          {/* Instructions */}
          <div className="p-4 bg-background-muted rounded-lg border border-border">
            <p className="text-sm font-semibold text-text-primary mb-2">Next steps:</p>
            <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
              <li>You can now navigate away from this page - the connection will persist</li>
              <li>Scan the QR code with your phone/tablet to join as a controller</li>
              <li>Once connected, use &ldquo;Start Game&rdquo; below to begin</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-warning/10 border border-warning rounded-lg">
          <p className="text-warning font-medium">
            This device is connected as a client. Multi-device setup is only available on the host device.
          </p>
        </div>
      )}
    </div>
  );
}
