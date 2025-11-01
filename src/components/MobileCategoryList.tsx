"use client";

import { useGameStore } from "@/lib/store";

export default function MobileCategoryList() {
  const { pack, opened, setSelectedCategory } = useGameStore();

  if (!pack) return null;

  const categories = pack.board.categories;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Categories</h2>

      {categories.map((category) => {

        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className="w-full bg-secondary text-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all active:scale-98 hover:brightness-105"
          >
            <h3 className="text-xl font-bold uppercase tracking-wide mb-3 text-center">
              {category.name}
            </h3>

            {/* Progress indicator with mini question badges */}
            <div className="flex flex-wrap gap-2">
              {category.questions
                .sort((a, b) => a.value - b.value)
                .map((question) => {
                  const key = `${category.id}:${question.value}`;
                  const isAnswered = opened[key];

                  return (
                    <div
                      key={question.value}
                      className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
                        isAnswered
                          ? 'bg-gray-300 text-gray-500 line-through'
                          : 'bg-tertiary text-white'
                      }`}
                    >
                      {question.value}
                    </div>
                  );
                })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
