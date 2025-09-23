"use client";

import { useGameStore } from "@/lib/store";
import { validatePackStructure } from "@/lib/packUtils";
import Tile from "./Tile";

export default function BoardGrid() {
  const { pack } = useGameStore();

  if (!pack || !validatePackStructure(pack)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">
          {!pack ? "No game pack loaded" : "Invalid pack structure"}
        </p>
      </div>
    );
  }

  const { categories } = pack.board;

  // Calculate grid dimensions
  const numCategories = categories.length;
  const maxQuestions = Math.max(...categories.map(cat => cat.questions.length));

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

        {/* Question tiles - properly aligned by row */}
        {Array.from({ length: maxQuestions }, (_, rowIndex) =>
          categories.map((category) => {
            const question = category.questions[rowIndex];
            return question ? (
              <Tile
                key={`${category.id}-${question.value}`}
                categoryId={category.id}
                question={question}
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