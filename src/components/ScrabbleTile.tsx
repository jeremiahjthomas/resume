import { cn } from "@/lib/utils";

interface ScrabbleTileProps {
  letter: string;
  points?: number;
  isEmpty?: boolean;
  isPlaced?: boolean;
  onClick?: () => void;
  className?: string;
  multiplier?: "TW" | "DW" | "TL" | "DL" | "STAR" | null;
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
  multiplier = null,
}: ScrabbleTileProps) => {
  const tilePoints = points ?? LETTER_POINTS[letter.toUpperCase()] ?? 1;

  // Multiplier tile styles
  const getMultiplierStyles = () => {
    if (!multiplier || !isEmpty) return "";
    
    switch (multiplier) {
      case "TW":
        return "bg-[hsl(var(--triple-word))] text-[hsl(var(--triple-word-foreground))] border-[hsl(var(--triple-word))]";
      case "DW":
        return "bg-[hsl(var(--double-word))] text-[hsl(var(--double-word-foreground))] border-[hsl(var(--double-word))]";
      case "TL":
        return "bg-[hsl(var(--triple-letter))] text-[hsl(var(--triple-letter-foreground))] border-[hsl(var(--triple-letter))]";
      case "DL":
        return "bg-[hsl(var(--double-letter))] text-[hsl(var(--double-letter-foreground))] border-[hsl(var(--double-letter))]";
      case "STAR":
        return "bg-[hsl(var(--center-star))] text-[hsl(var(--center-star-foreground))] border-[hsl(var(--center-star))]";
      default:
        return "";
    }
  };

  const getMultiplierText = () => {
    if (!multiplier) return "";
    if (multiplier === "STAR") return "★";
    return multiplier;
  };

  if (isEmpty) {
    return (
      <div
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded border-2 flex items-center justify-center transition-all font-bold",
          multiplier 
            ? getMultiplierStyles() 
            : "border-dashed border-[hsl(var(--grid-line))] bg-[hsl(var(--board))]",
          onClick && "cursor-pointer hover:opacity-80",
          className
        )}
        onClick={onClick}
      >
        {multiplier ? (
          <span className="text-xs sm:text-sm font-bold">
            {getMultiplierText()}
          </span>
        ) : (
          <span className="text-muted-foreground text-2xl font-bold">_</span>
        )}
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
