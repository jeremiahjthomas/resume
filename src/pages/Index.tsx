import { useState } from "react";
import { WordPuzzle } from "@/components/WordPuzzle";
import { TileRack } from "@/components/TileRack";
import { ResumeSection } from "@/components/ResumeSection";
import { toast } from "sonner";

interface PuzzleConfig {
  word: string;
  missingIndex: number;
  missingLetter: string;
  section: string;
}

const puzzles: PuzzleConfig[] = [
  { word: "BIO", missingIndex: 2, missingLetter: "O", section: "bio" },
  { word: "PROJECTS", missingIndex: 0, missingLetter: "P", section: "projects" },
  { word: "EXPERIENCE", missingIndex: 9, missingLetter: "E", section: "experience" },
];

const Index = () => {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [availableTiles, setAvailableTiles] = useState<string[]>(["O", "P", "E"]);
  const [selectedTile, setSelectedTile] = useState<{ letter: string; index: number } | null>(null);

  const handleTileClick = (tile: string, index: number) => {
    if (selectedTile?.index === index) {
      setSelectedTile(null);
      toast.info("Tile deselected");
    } else {
      setSelectedTile({ letter: tile, index });
      toast.info(`Selected tile: ${tile}`);
    }
  };

  const handleSlotClick = (puzzle: PuzzleConfig) => {
    if (!selectedTile) {
      toast.error("Select a tile from your rack first!");
      return;
    }

    if (selectedTile.letter !== puzzle.missingLetter) {
      toast.error(`Wrong tile! You need '${puzzle.missingLetter}' for ${puzzle.word.toUpperCase()}`);
      return;
    }

    // Correct tile placed
    const newTiles = availableTiles.filter((_, i) => i !== selectedTile.index);
    setAvailableTiles(newTiles);
    setCompletedSections(prev => new Set([...prev, puzzle.section]));
    setSelectedTile(null);
    toast.success(`${puzzle.section.toUpperCase()} unlocked!`);
  };

  const getPuzzleStatus = (section: string) => completedSections.has(section);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-scrabble">
            SCRABBLE RESUME
          </h1>
          <p className="text-lg text-muted-foreground font-content">
            Complete the words to unlock sections of the resume
          </p>
        </div>

        {/* Puzzles */}
        <div className="space-y-6">
          {puzzles.map((puzzle, index) => (
            <div
              key={puzzle.section}
              className="space-y-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <WordPuzzle
                word={puzzle.word}
                missingIndex={puzzle.missingIndex}
                isCompleted={getPuzzleStatus(puzzle.section)}
                onSlotClick={() => handleSlotClick(puzzle)}
              />

              <ResumeSection
                title={puzzle.section.charAt(0).toUpperCase() + puzzle.section.slice(1)}
                isVisible={getPuzzleStatus(puzzle.section)}
                content={
                  puzzle.section === "bio" ? (
                    <div>
                      <p className="text-base sm:text-lg leading-relaxed">
                        Creative developer passionate about building innovative web experiences. 
                        I specialize in React, TypeScript, and modern frontend technologies. 
                        When I'm not coding, you can find me playing board games or exploring new design patterns.
                      </p>
                    </div>
                  ) : puzzle.section === "projects" ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-accent">Interactive Resume Builder</h3>
                        <p className="text-muted-foreground">A Scrabble-themed resume that combines gaming with professional presentation</p>
                        <p className="text-sm mt-1">Tech: React, TypeScript, Tailwind CSS</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-accent">Task Management App</h3>
                        <p className="text-muted-foreground">Full-stack productivity tool with real-time collaboration</p>
                        <p className="text-sm mt-1">Tech: React, Node.js, PostgreSQL</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-accent">Design System Library</h3>
                        <p className="text-muted-foreground">Reusable component library with comprehensive documentation</p>
                        <p className="text-sm mt-1">Tech: React, Storybook, Tailwind CSS</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-accent">Senior Frontend Developer</h3>
                        <p className="text-muted-foreground">Tech Innovation Inc. • 2022 - Present</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                          <li>Led development of customer-facing web applications</li>
                          <li>Improved performance by 40% through optimization</li>
                          <li>Mentored junior developers and conducted code reviews</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-accent">Frontend Developer</h3>
                        <p className="text-muted-foreground">Creative Solutions Ltd. • 2020 - 2022</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                          <li>Built responsive web applications using React</li>
                          <li>Collaborated with designers to implement pixel-perfect UIs</li>
                          <li>Integrated RESTful APIs and managed state with Redux</li>
                        </ul>
                      </div>
                    </div>
                  )
                }
              />
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completedSections.size === puzzles.length && (
          <div className="text-center animate-slide-up bg-accent/20 rounded-lg p-6 border-2 border-accent">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-scrabble mb-2">
              CONGRATULATIONS!
            </h2>
            <p className="text-lg text-foreground font-content">
              You've unlocked all sections of the resume! 🎉
            </p>
          </div>
        )}
      </div>

      {/* Tile Rack */}
      {availableTiles.length > 0 && (
        <TileRack tiles={availableTiles} onTileClick={handleTileClick} />
      )}
    </div>
  );
};

export default Index;
