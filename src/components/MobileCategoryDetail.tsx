"use client";

import { useGameStore } from "@/lib/store";

export default function MobileCategoryDetail() {
  const { pack, opened, selectedCategoryId, setSelectedCategory, openQuestion } = useGameStore();

  if (!pack || !selectedCategoryId) return null;

  const category = pack.board.categories.find(c => c.id === selectedCategoryId);
  if (!category) return null;

  const isQuestionAnswered = (value: number) => {
    const key = `${selectedCategoryId}:${value}`;
    return opened[key];
  };

  const handleQuestionClick = (value: number) => {
    if (!isQuestionAnswered(value)) {
      openQuestion(selectedCategoryId, value);
    }
  };

  return (
    <div className="p-4">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-primary hover:text-primary/80 text-2xl font-bold"
          aria-label="Back to categories"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-text-primary flex-1">
          {category.name}
        </h2>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {category.questions
          .sort((a, b) => a.value - b.value)
          .map((question) => {
            const answered = isQuestionAnswered(question.value);

            if (answered) {
              // Collapsed answered question
              return (
                <div
                  key={question.value}
                  className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg opacity-60"
                >
                  <span className="text-success text-xl">✓</span>
                  <span className="text-gray-500 line-through text-sm">
                    {question.value} points
                  </span>
                </div>
              );
            }

            // Full unanswered question card
            return (
              <button
                key={question.value}
                onClick={() => handleQuestionClick(question.value)}
                className="w-full bg-primary text-white rounded-lg shadow-md p-6 text-left hover:bg-primary/90 active:scale-98 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {question.value}
                  </span>
                  <span className="text-lg opacity-90">
                    points
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
