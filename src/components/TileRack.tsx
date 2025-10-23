import { ScrabbleTile } from "./ScrabbleTile";

interface TileRackProps {
  tiles: string[];
  onTileClick: (tile: string, index: number) => void;
}

export const TileRack = ({ tiles, onTileClick }: TileRackProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-board-dark px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-2xl border-4 border-tile-shadow">
        <div className="flex gap-2 sm:gap-3">
          {tiles.map((tile, index) => (
            <ScrabbleTile
              key={index}
              letter={tile}
              onClick={() => onTileClick(tile, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
