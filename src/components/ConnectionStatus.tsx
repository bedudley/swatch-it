"use client";

import { useState, useEffect } from "react";
import { usePeerStatus } from "@/lib/usePeerSync";

export default function ConnectionStatus() {
  const status = usePeerStatus();
  const [isMounted, setIsMounted] = useState(false);

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

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
        status.connected
          ? "bg-success/90 text-white"
          : "bg-error/90 text-white"
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          status.connected ? "bg-white animate-pulse" : "bg-white/50"
        }`}></div>
        <div className="text-sm font-medium">
          {status.role === 'host' ? (
            <>
              <span className="font-semibold">Host Mode</span>
              {status.connected && (
                <span className="ml-2 text-xs">
                  ({status.connectedDevices} device{status.connectedDevices !== 1 ? 's' : ''})
                </span>
              )}
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
      </div>
    </div>
  );
}
