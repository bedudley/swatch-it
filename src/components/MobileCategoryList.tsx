"use client";

import { useGameStore } from "@/lib/store";

export default function MobileCategoryList() {
  const { pack, opened, setSelectedCategory } = useGameStore();

  if (!pack) return null;

  const categories = pack.board.categories;

  // Calculate remaining questions for each category
  const getCategoryProgress = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { remaining: 0, total: 0 };

    const total = category.questions.length;
    const answered = category.questions.filter(q => {
      const key = `${categoryId}:${q.value}`;
      return opened[key];
    }).length;
    const remaining = total - answered;

    return { remaining, total };
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Categories</h2>

      {categories.map((category) => {
        const { remaining, total } = getCategoryProgress(category.id);

        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className="w-full bg-card rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow active:scale-98 border-2 border-border hover:border-primary"
          >
            <h3 className="text-xl font-bold text-text-primary mb-3">
              {category.name}
            </h3>

            {/* Progress indicator with dots */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: total }).map((_, index) => (
                  <span
                    key={index}
                    className={`text-2xl ${
                      index < remaining ? 'text-primary' : 'text-gray-300'
                    }`}
                  >
                    ●
                  </span>
                ))}
              </div>
              <span className="text-sm text-text-secondary ml-2">
                {remaining} of {total} remaining
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
