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

  // Calculate grid dimensions
  const numCategories = categories.length;
  const maxClues = Math.max(...categories.map(cat => cat.clues.length));

  return (
    <div className="bg-background-muted p-6 rounded-lg border border-border overflow-x-auto">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${numCategories}, minmax(200px, 1fr))`,
          minWidth: `${numCategories * 220}px`
        }}
      >
        {/* Category headers */}
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-secondary text-gray-800 text-center p-6 rounded-lg font-bold text-xl sm:text-2xl lg:text-3xl uppercase tracking-wide shadow-lg"
            style={{ minHeight: "120px" }}
          >
            <div className="flex items-center justify-center h-full">
              {category.name}
            </div>
          </div>
        ))}

        {/* Clue tiles - properly aligned by row */}
        {Array.from({ length: maxClues }, (_, rowIndex) =>
          categories.map((category) => {
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
                className="bg-border rounded-lg"
                style={{ minHeight: "120px" }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}