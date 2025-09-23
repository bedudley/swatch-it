"use client";

import { useGameStore } from "@/lib/store";
import { Question } from "@/lib/schema";

interface TileProps {
  categoryId: string;
  question: Question;
}

export default function Tile({ categoryId, question }: TileProps) {
  const { openQuestion, isQuestionOpened, boardDisabled } = useGameStore();

  const isOpened = isQuestionOpened(categoryId, question.value);

  const handleClick = () => {
    if (!isOpened && !boardDisabled) {
      openQuestion(categoryId, question.value);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOpened || boardDisabled}
      className={`
        rounded-lg text-3xl sm:text-4xl lg:text-5xl font-bold transition-all duration-200 shadow-lg
        ${
          isOpened
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-tertiary text-white hover:bg-tertiary/90 hover:scale-105 cursor-pointer active:scale-95"
        }
        ${boardDisabled && !isOpened ? "opacity-50" : ""}
      `}
      style={{ minHeight: "120px" }}
    >
      {isOpened ? "" : `$${question.value}`}
    </button>
  );
}