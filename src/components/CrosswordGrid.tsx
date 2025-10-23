import React from "react";
import { ScrabbleTile } from "./ScrabbleTile";
import { cn } from "@/lib/utils";

interface GridCell {
  letter: string;
  wordId: string;
  isPlaced: boolean;
  isEmpty: boolean;
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
    <div className="inline-flex flex-col gap-1 sm:gap-2 bg-board p-4 sm:p-6 rounded-lg shadow-2xl border-4 border-board-dark">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:gap-2">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
              onDragOver={handleDragOver}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16",
                cell === null && "opacity-0 pointer-events-none"
              )}
            >
              {cell && (
                cell.isEmpty ? (
                  <ScrabbleTile
                    letter=""
                    isEmpty
                    className="border-accent"
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
