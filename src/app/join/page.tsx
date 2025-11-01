"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJoinHost } from "@/lib/usePeerSync";
import Logo from "@/components/Logo";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinHost, loading, error } = useJoinHost();

  const [roomId, setRoomId] = useState<string>("");
  const [manualEntry, setManualEntry] = useState(false);
  const [joinStatus, setJoinStatus] = useState<"idle" | "joining" | "success" | "error">("idle");

  const handleJoin = async (id: string) => {
    if (!id.trim()) {
      setJoinStatus("error");
      return;
    }

    setJoinStatus("joining");

    try {
      await joinHost(id);
      setJoinStatus("success");

      // Wait a moment to show success message, then redirect to host view
      setTimeout(() => {
        router.push("/host");
      }, 1500);
    } catch (err) {
      console.error("Failed to join:", err);
      setJoinStatus("error");
    }
  };

  useEffect(() => {
    // Check if room ID is in URL params
    const roomFromUrl = searchParams.get("room");
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      // Auto-join if we have a room ID from QR code
      handleJoin(roomFromUrl);
    } else {
      // Show manual entry form
      setManualEntry(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleManualJoin = () => {
    handleJoin(roomId);
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <Logo logo="swatch-it" className="max-h-16 mb-4" alt="Swatch It! logo" />
            <h1 className="text-3xl font-bold text-primary text-center">Join Game</h1>
          </div>

          {/* Status Messages */}
          {joinStatus === "joining" && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-lg text-center">
              <div className="text-4xl mb-3 animate-spin">⏳</div>
              <p className="text-lg font-medium text-primary">Connecting to host...</p>
            </div>
          )}

          {joinStatus === "success" && (
            <div className="mb-6 p-4 bg-success/10 border border-success rounded-lg text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-lg font-medium text-success">Connected successfully!</p>
              <p className="text-sm text-text-secondary mt-2">Redirecting to game...</p>
            </div>
          )}

          {joinStatus === "error" && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg text-center">
              <div className="text-4xl mb-3">❌</div>
              <p className="text-lg font-medium text-error">Connection failed</p>
              <p className="text-sm text-text-secondary mt-2">
                {error || "Could not connect to the host. Please check the room code and try again."}
              </p>
            </div>
          )}

          {/* Manual Entry Form */}
          {(manualEntry || joinStatus === "error") && joinStatus !== "success" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="room-code" className="block text-sm font-medium text-text-secondary mb-2">
                  Room Code
                </label>
                <input
                  id="room-code"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room code..."
                  className="w-full p-4 text-lg border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-card text-text-primary font-mono"
                  disabled={loading || joinStatus === "joining"}
                  onKeyPress={(e) => e.key === "Enter" && handleManualJoin()}
                />
              </div>

              <button
                onClick={handleManualJoin}
                disabled={loading || joinStatus === "joining" || !roomId.trim()}
                className={`w-full px-8 py-4 text-lg rounded-lg text-white font-medium transition-colors ${
                  loading || joinStatus === "joining" || !roomId.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 active:bg-primary/80"
                }`}
              >
                {loading || joinStatus === "joining" ? "Connecting..." : "Join Game"}
              </button>

              <div className="text-center">
                <a
                  href="/admin"
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Back to Admin
                </a>
              </div>
            </div>
          )}

          {/* Info Box */}
          {joinStatus === "idle" && !manualEntry && (
            <div className="mt-6 p-4 bg-background-muted rounded-lg border border-border">
              <p className="text-sm text-text-secondary text-center">
                Loading room information...
              </p>
            </div>
          )}

          {manualEntry && joinStatus === "idle" && (
            <div className="mt-6 p-4 bg-background-muted rounded-lg border border-border">
              <p className="text-sm font-semibold text-text-primary mb-2">How to join:</p>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Get the room code from the host device</li>
                <li>Enter it above and click &ldquo;Join Game&rdquo;</li>
                <li>You&rsquo;ll be connected and can control the game</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
