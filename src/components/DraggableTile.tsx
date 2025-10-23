import React from "react";
import { ScrabbleTile } from "./ScrabbleTile";

interface DraggableTileProps {
  letter: string;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const DraggableTile = ({ letter, onDragStart, onDragEnd }: DraggableTileProps) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", letter);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <ScrabbleTile letter={letter} />
    </div>
  );
};
