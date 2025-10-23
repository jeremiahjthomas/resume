import { cn } from "@/lib/utils";

interface ScrabbleTileProps {
  letter: string;
  points?: number;
  isEmpty?: boolean;
  isPlaced?: boolean;
  onClick?: () => void;
  className?: string;
}

const LETTER_POINTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

export const ScrabbleTile = ({
  letter,
  points,
  isEmpty = false,
  isPlaced = false,
  onClick,
  className,
}: ScrabbleTileProps) => {
  const tilePoints = points ?? LETTER_POINTS[letter.toUpperCase()] ?? 1;

  if (isEmpty) {
    return (
      <div
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded border-2 border-dashed border-board-dark bg-board/30 flex items-center justify-center transition-all",
          onClick && "cursor-pointer hover:bg-board/50 hover:border-accent",
          className
        )}
        onClick={onClick}
      >
        <span className="text-muted-foreground text-2xl font-bold">_</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-14 h-14 sm:w-16 sm:h-16 rounded bg-tile shadow-lg flex flex-col items-center justify-center relative transition-all border-2 border-tile-shadow",
        onClick && "cursor-pointer hover:bg-tile-hover hover:scale-105 hover:shadow-xl active:scale-95",
        isPlaced && "animate-tile-place",
        className
      )}
      onClick={onClick}
    >
      <span className="text-tile-foreground text-3xl sm:text-4xl font-scrabble font-bold leading-none">
        {letter.toUpperCase()}
      </span>
      <span className="absolute bottom-1 right-1.5 text-tile-foreground text-xs font-bold">
        {tilePoints}
      </span>
    </div>
  );
};
