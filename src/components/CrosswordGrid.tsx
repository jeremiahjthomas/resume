import React from "react";
import { ScrabbleTile } from "./ScrabbleTile";
import { cn } from "@/lib/utils";

interface GridCell {
  letter: string;
  wordId: string;
  isPlaced: boolean;
  isEmpty: boolean;
  multiplier?: "TW" | "DW" | "TL" | "DL" | "STAR" | null;
}

interface CrosswordGridProps {
  grid: (GridCell | null)[][];
  onCellDrop: (row: number, col: number, letter: string) => void;
}

export const CrosswordGrid = ({ grid, onCellDrop }: CrosswordGridProps) => {
  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData("text/plain");
    onCellDrop(row, col, letter);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="inline-flex flex-col gap-0.5 bg-[hsl(var(--board-dark))] p-3 sm:p-4 rounded shadow-2xl border-2 border-[hsl(var(--grid-line))]">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0.5">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
              onDragOver={handleDragOver}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 border border-[hsl(var(--grid-line))]",
                cell === null && "opacity-0 pointer-events-none"
              )}
            >
              {cell && (
                cell.isEmpty ? (
                  <ScrabbleTile
                    letter=""
                    isEmpty
                    multiplier={cell.multiplier}
                  />
                ) : (
                  <ScrabbleTile
                    letter={cell.letter}
                    isPlaced={cell.isPlaced}
                  />
                )
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
