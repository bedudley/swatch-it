"use client";

import { useState, useEffect } from "react";
import { PackMetadata, loadBuiltInPacks } from "@/lib/packLibrary";
import { Pack } from "@/lib/schema";
import PackCard from "./PackCard";

interface PackLibraryProps {
  currentPack?: Pack | null;
  onPackSelect: (pack: Pack) => void;
}

export default function PackLibrary({ currentPack, onPackSelect }: PackLibraryProps) {
  const [availablePacks, setAvailablePacks] = useState<PackMetadata[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to skip loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function loadPacks() {
      console.log('PackLibrary: useEffect starting');
      try {
        const packs = loadBuiltInPacks();
        console.log('PackLibrary: Got packs:', packs);
        setAvailablePacks(packs);
        setError(null);
      } catch (err) {
        console.error('PackLibrary: Failed to load built-in packs:', err);
        setError('Failed to load available class packs');
      }
    }

    loadPacks();
  }, []);

  const handlePackLoad = (packMetadata: PackMetadata) => {
    onPackSelect(packMetadata.pack);
  };

  if (loading) {
    return (
      <div>
        <h4 className="text-md font-semibold mb-3 text-text-primary">Available Built-in Packs</h4>
        <div className="flex items-center justify-center py-8">
          <div className="text-text-secondary">Loading class packs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h4 className="text-md font-semibold mb-3 text-text-primary">Available Built-in Packs</h4>
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <p className="text-error text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-md font-semibold mb-3 text-text-primary">Available Built-in Packs</h4>

      {availablePacks.length === 0 ? (
        <p className="text-text-secondary text-sm">No class packs available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePacks.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              isLoaded={currentPack?.id === pack.id || currentPack?.title === pack.title}
              onLoad={handlePackLoad}
            />
          ))}
        </div>
      )}
    </div>
  );
}