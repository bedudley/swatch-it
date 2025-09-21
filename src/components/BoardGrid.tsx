"use client";

import { useGameStore } from "@/lib/store";
import Tile from "./Tile";

export default function BoardGrid() {
  const { pack } = useGameStore();

  if (!pack) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">No game pack loaded</p>
      </div>
    );
  }

  const { categories } = pack.board;

  return (
    <div className="bg-blue-900 p-4 rounded-lg">
      <div className="grid grid-cols-5 gap-2">
        {/* Category headers */}
        {categories.slice(0, 5).map((category) => (
          <div
            key={category.id}
            className="bg-blue-800 text-white text-center p-4 rounded font-bold text-lg uppercase tracking-wide"
            style={{ minHeight: "80px" }}
          >
            <div className="flex items-center justify-center h-full">
              {category.name}
            </div>
          </div>
        ))}

        {/* Clue tiles */}
        {[0, 1, 2, 3, 4].map((rowIndex) =>
          categories.slice(0, 5).map((category) => {
            const clue = category.clues[rowIndex];
            return clue ? (
              <Tile
                key={`${category.id}-${clue.value}`}
                categoryId={category.id}
                clue={clue}
              />
            ) : (
              <div
                key={`${category.id}-empty-${rowIndex}`}
                className="bg-gray-400 rounded"
                style={{ minHeight: "80px" }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}