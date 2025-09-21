"use client";

import { useGameStore } from "@/lib/store";
import { Clue } from "@/lib/schema";

interface TileProps {
  categoryId: string;
  clue: Clue;
}

export default function Tile({ categoryId, clue }: TileProps) {
  const { openClue, isClueOpened, boardDisabled } = useGameStore();

  const isOpened = isClueOpened(categoryId, clue.value);

  const handleClick = () => {
    if (!isOpened && !boardDisabled) {
      openClue(categoryId, clue.value);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOpened || boardDisabled}
      className={`
        rounded text-2xl font-bold transition-all duration-200
        ${
          isOpened
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-yellow-400 hover:bg-blue-500 hover:scale-105 cursor-pointer"
        }
        ${boardDisabled && !isOpened ? "opacity-50" : ""}
      `}
      style={{ minHeight: "80px" }}
    >
      {isOpened ? "" : `$${clue.value}`}
    </button>
  );
}