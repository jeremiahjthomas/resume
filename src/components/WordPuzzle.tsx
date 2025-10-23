import { ScrabbleTile } from "./ScrabbleTile";
import { cn } from "@/lib/utils";

interface WordPuzzleProps {
  word: string;
  missingIndex: number;
  isCompleted: boolean;
  onSlotClick?: () => void;
  className?: string;
}

export const WordPuzzle = ({
  word,
  missingIndex,
  isCompleted,
  onSlotClick,
  className,
}: WordPuzzleProps) => {
  return (
    <div className={cn("flex gap-1 sm:gap-2 justify-center items-center", className)}>
      {word.split("").map((letter, index) => (
        <div key={index}>
          {index === missingIndex && !isCompleted ? (
            <ScrabbleTile
              letter=""
              isEmpty
              onClick={onSlotClick}
            />
          ) : (
            <ScrabbleTile
              letter={letter}
              isPlaced={index === missingIndex && isCompleted}
            />
          )}
        </div>
      ))}
    </div>
  );
};
