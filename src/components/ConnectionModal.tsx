"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { usePeerStatus } from "@/lib/usePeerSync";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostId: string | null;
}

export default function ConnectionModal({ isOpen, onClose, hostId }: ConnectionModalProps) {
  const router = useRouter();
  const status = usePeerStatus();
  const [showDisplayBanner, setShowDisplayBanner] = useState(false);

  const joinUrl = hostId ? `${window.location.origin}/join?room=${hostId}` : "";

  // Auto-close modal and navigate when a device connects
  useEffect(() => {
    if (status.connectedDevices > 0) {
      console.log('[ConnectionModal] Device connected, navigating to /play');
      // Close modal
      onClose();
      // Navigate to /play (display view)
      router.push('/play');
    }
  }, [status.connectedDevices, onClose, router]);

  const handleSkip = () => {
    console.log('[ConnectionModal] Skip clicked - using laptop only mode');

    // Try to auto-open /play in new window
    const displayWindow = window.open('/play', '_blank', 'width=1920,height=1080');

    // Check if popup was blocked
    if (!displayWindow || displayWindow.closed || typeof displayWindow.closed === 'undefined') {
      console.log('[ConnectionModal] Popup blocked, showing banner');
      setShowDisplayBanner(true);
    }

    // Close modal
    onClose();

    // Navigate to /host (control view)
    router.push('/host');
  };

  const handleOpenDisplay = () => {
    window.open('/play', '_blank', 'width=1920,height=1080');
    setShowDisplayBanner(false);
  };

  if (!isOpen) {
    // Show banner if popup was blocked
    if (showDisplayBanner) {
      return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4">
          <span>Display view ready for projector/TV</span>
          <button
            onClick={handleOpenDisplay}
            className="px-4 py-2 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Open Display View
          </button>
          <button
            onClick={() => setShowDisplayBanner(false)}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-text-primary text-center">
          Connect Your Phone
        </h2>

        <p className="text-text-secondary mb-6 text-center">
          Scan the QR code with your phone to control the game
        </p>

        {hostId && (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg flex justify-center">
              <QRCode value={joinUrl} size={200} />
            </div>

            {/* Room Code */}
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">Or enter room code:</p>
              <div className="bg-background px-4 py-3 rounded-lg">
                <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                  {hostId.slice(0, 6).toUpperCase()}
                </code>
              </div>
            </div>

            {/* Connection Status */}
            {status.connectedDevices > 0 && (
              <div className="text-center text-success font-medium">
                Device connected! Launching game...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSkip}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Skip - Use Laptop Only
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-transparent text-text-secondary rounded-lg font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!hostId && (
          <div className="text-center text-error">
            Failed to create room. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
