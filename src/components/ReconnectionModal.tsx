"use client";

import { useRouter } from "next/navigation";

interface ReconnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconnect: () => void;
}

export default function ReconnectionModal({ isOpen, onClose, onReconnect }: ReconnectionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleReconnect = () => {
    console.log('[ReconnectionModal] Reconnect clicked');
    onReconnect();
    router.push('/join');
  };

  const handleContinueOffline = () => {
    console.log('[ReconnectionModal] Continue offline clicked');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-text-primary">
            Connection Lost
          </h2>
          <p className="text-text-secondary">
            The connection to the host device was lost. You can reconnect or continue offline.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleReconnect}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Reconnect
          </button>

          <button
            onClick={handleContinueOffline}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Continue Offline
          </button>
        </div>

        <p className="text-xs text-text-secondary text-center mt-4">
          Note: Controls won&apos;t sync while offline
        </p>
      </div>
    </div>
  );
}
