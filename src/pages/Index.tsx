import React, { useState } from "react";
import { CrosswordGrid } from "@/components/CrosswordGrid";
import { DraggableTile } from "@/components/DraggableTile";
import { ResumeSection } from "@/components/ResumeSection";
import { toast } from "sonner";

interface GridCell {
  letter: string;
  wordId: string;
  isPlaced: boolean;
  isEmpty: boolean;
}

// Word configuration for crossword
// EXPERIENCE horizontal, PROJECTS down from P, BIO down from I
const EXPERIENCE = "EXPERIENCE";
const PROJECTS = "PROJECTS";
const BIO = "BIO";

const Index = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [availableTiles, setAvailableTiles] = useState<string[]>(["S", "O", "C", "E"]);
  const [draggedTile, setDraggedTile] = useState<string | null>(null);
  
  // Track which letters are placed for each word
  // Users only place tiles at the END: PROJECT+S, BI+O, EXPERIEN+CE
  const [placedLetters, setPlacedLetters] = useState<{
    experience: Set<number>;
    projects: Set<number>;
    bio: Set<number>;
  }>({
    experience: new Set([0, 1, 2, 3, 4, 5, 6, 7]), // EXPERIEN placed, missing C(8) and E(9)
    projects: new Set([0, 1, 2, 3, 4, 5, 6]), // PROJECT placed, missing S(7)
    bio: new Set([0, 1]), // BI placed, missing O(2)
  });

  // Create the crossword grid
  const createGrid = (): (GridCell | null)[][] => {
    const grid: (GridCell | null)[][] = Array(10).fill(null).map(() => Array(12).fill(null));
    
    // EXPERIENCE horizontal (row 2, starting at col 1)
    EXPERIENCE.split("").forEach((letter, idx) => {
      const col = 1 + idx;
      grid[2][col] = {
        letter,
        wordId: "experience",
        isPlaced: placedLetters.experience.has(idx),
        isEmpty: !placedLetters.experience.has(idx),
      };
    });

    // PROJECTS vertical (starting at row 2, col 3 - the P position)
    PROJECTS.split("").forEach((letter, idx) => {
      const row = 2 + idx;
      // Skip P (index 0) as it's shared with EXPERIENCE
      if (idx === 0) return;
      
      grid[row][3] = {
        letter,
        wordId: "projects",
        isPlaced: placedLetters.projects.has(idx),
        isEmpty: !placedLetters.projects.has(idx),
      };
    });

    // BIO vertical (col 6, starting at row 1 - B above the I in EXPERIENCE)
    // B at row 1, I at row 2 (shared with EXPERIENCE), O at row 3
    BIO.split("").forEach((letter, idx) => {
      const row = 1 + idx;
      
      // I (index 1) at row 2 is shared with EXPERIENCE
      if (idx === 1) return; // Skip rendering for BIO, EXPERIENCE will handle it
      
      grid[row][6] = {
        letter,
        wordId: "bio",
        isPlaced: placedLetters.bio.has(idx),
        isEmpty: !placedLetters.bio.has(idx),
      };
    });

    return grid;
  };

  const handleCellDrop = (row: number, col: number, letter: string) => {
    const grid = createGrid();
    const cell = grid[row][col];

    if (!cell || !cell.isEmpty) {
      toast.error("Can't place tile here!");
      return;
    }

    if (cell.letter.toUpperCase() !== letter.toUpperCase()) {
      toast.error(`Wrong tile! This spot needs '${cell.letter}'`);
      return;
    }

    // Correct placement
    const newPlacedLetters = { ...placedLetters };
    
    if (cell.wordId === "experience") {
      const idx = col - 1;
      newPlacedLetters.experience.add(idx);
      // P is shared with PROJECTS
      if (idx === 2) {
        newPlacedLetters.projects.add(0);
      }
      // I is shared with BIO
      if (idx === 5) {
        newPlacedLetters.bio.add(1);
      }
    } else if (cell.wordId === "projects") {
      const idx = row - 2;
      newPlacedLetters.projects.add(idx);
      // P is shared with EXPERIENCE
      if (idx === 0) {
        newPlacedLetters.experience.add(2);
      }
    } else if (cell.wordId === "bio") {
      const idx = row - 1; // BIO starts at row 1, not row 2
      newPlacedLetters.bio.add(idx);
      // I is shared with EXPERIENCE
      if (idx === 1) {
        newPlacedLetters.experience.add(5);
      }
    }

    setPlacedLetters(newPlacedLetters);
    setAvailableTiles(prev => prev.filter(t => t !== letter));
    
    toast.success(`Correct! Tile placed.`);

    // Check if word is complete
    setTimeout(() => {
      if (cell.wordId === "experience" && newPlacedLetters.experience.size === EXPERIENCE.length) {
        toast.success("EXPERIENCE complete!");
        setOpenSection("experience");
      } else if (cell.wordId === "projects" && newPlacedLetters.projects.size === PROJECTS.length) {
        toast.success("PROJECTS complete!");
        setOpenSection("projects");
      } else if (cell.wordId === "bio" && newPlacedLetters.bio.size === BIO.length) {
        toast.success("BIO complete!");
        setOpenSection("bio");
      }
    }, 300);
  };

  const isComplete = (wordId: string) => {
    if (wordId === "experience") return placedLetters.experience.size === EXPERIENCE.length;
    if (wordId === "projects") return placedLetters.projects.size === PROJECTS.length;
    if (wordId === "bio") return placedLetters.bio.size === BIO.length;
    return false;
  };

  const allComplete = isComplete("experience") && isComplete("projects") && isComplete("bio");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-scrabble">
            SCRABBLE RESUME
          </h1>
          <p className="text-lg text-muted-foreground font-content">
            Drag tiles to complete the crossword and unlock resume sections
          </p>
        </div>

        {/* Crossword Grid */}
        <div className="flex justify-center animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CrosswordGrid grid={createGrid()} onCellDrop={handleCellDrop} />
        </div>

        {/* Completion Message */}
        {allComplete && !openSection && (
          <div className="text-center animate-slide-up bg-accent/20 rounded-lg p-6 border-2 border-accent max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-scrabble mb-2">
              CONGRATULATIONS!
            </h2>
            <p className="text-lg text-foreground font-content">
              You've completed all words! Click any word to view its section. 🎉
            </p>
          </div>
        )}

        {/* Word Status Buttons */}
        <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
          {["bio", "projects", "experience"].map((section) => (
            <button
              key={section}
              onClick={() => isComplete(section) && setOpenSection(section)}
              disabled={!isComplete(section)}
              className={`px-6 py-3 rounded-lg font-scrabble text-lg transition-all ${
                isComplete(section)
                  ? "bg-tile hover:bg-tile-hover cursor-pointer shadow-lg hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {section.toUpperCase()} {isComplete(section) ? "✓" : "🔒"}
            </button>
          ))}
        </div>
      </div>

      {/* Tile Rack */}
      {availableTiles.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-board-dark px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-2xl border-4 border-tile-shadow">
            <div className="flex gap-2 sm:gap-3">
              {availableTiles.map((tile, index) => (
                <DraggableTile
                  key={index}
                  letter={tile}
                  onDragStart={() => setDraggedTile(tile)}
                  onDragEnd={() => setDraggedTile(null)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Sections */}
      <ResumeSection
        title="Bio"
        isVisible={openSection === "bio"}
        onClose={() => setOpenSection(null)}
        content={
          <div>
            <p className="text-base sm:text-lg leading-relaxed">
              Creative developer passionate about building innovative web experiences. 
              I specialize in React, TypeScript, and modern frontend technologies. 
              When I'm not coding, you can find me playing board games or exploring new design patterns.
            </p>
            <div className="mt-6 space-y-2">
              <p><strong>Location:</strong> San Francisco, CA</p>
              <p><strong>Email:</strong> developer@example.com</p>
              <p><strong>GitHub:</strong> github.com/developer</p>
            </div>
          </div>
        }
      />

      <ResumeSection
        title="Projects"
        isVisible={openSection === "projects"}
        onClose={() => setOpenSection(null)}
        content={
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Interactive Resume Builder</h3>
              <p className="text-muted-foreground mb-2">A Scrabble-themed resume that combines gaming with professional presentation</p>
              <p className="text-sm mb-2"><strong>Tech:</strong> React, TypeScript, Tailwind CSS</p>
              <p className="text-sm leading-relaxed">
                Developed an engaging interactive resume experience using drag-and-drop functionality 
                and crossword-style layout. Implemented smooth animations and responsive design.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Task Management App</h3>
              <p className="text-muted-foreground mb-2">Full-stack productivity tool with real-time collaboration</p>
              <p className="text-sm mb-2"><strong>Tech:</strong> React, Node.js, PostgreSQL, WebSocket</p>
              <p className="text-sm leading-relaxed">
                Built a collaborative task management platform with real-time updates, user authentication, 
                and team workspace features. Handles 10,000+ daily active users.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Design System Library</h3>
              <p className="text-muted-foreground mb-2">Reusable component library with comprehensive documentation</p>
              <p className="text-sm mb-2"><strong>Tech:</strong> React, Storybook, Tailwind CSS</p>
              <p className="text-sm leading-relaxed">
                Created a comprehensive design system with 50+ components, complete with Storybook documentation 
                and accessibility compliance. Adopted by 5 product teams.
              </p>
            </div>
          </div>
        }
      />

      <ResumeSection
        title="Experience"
        isVisible={openSection === "experience"}
        onClose={() => setOpenSection(null)}
        content={
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Senior Frontend Developer</h3>
              <p className="text-muted-foreground mb-3">Tech Innovation Inc. • 2022 - Present</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Led development of customer-facing web applications serving 500K+ users</li>
                <li>Improved performance by 40% through code optimization and lazy loading</li>
                <li>Mentored 5 junior developers and conducted weekly code reviews</li>
                <li>Architected component library adopted across 3 major products</li>
                <li>Collaborated with design team to implement pixel-perfect responsive UIs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Frontend Developer</h3>
              <p className="text-muted-foreground mb-3">Creative Solutions Ltd. • 2020 - 2022</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Built responsive web applications using React and modern JavaScript</li>
                <li>Integrated RESTful APIs and managed complex state with Redux</li>
                <li>Implemented automated testing with Jest and React Testing Library</li>
                <li>Collaborated with cross-functional teams in Agile environment</li>
                <li>Reduced bug rate by 30% through comprehensive test coverage</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Junior Web Developer</h3>
              <p className="text-muted-foreground mb-3">StartupCo • 2019 - 2020</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Developed and maintained company website and landing pages</li>
                <li>Created email templates and automated marketing workflows</li>
                <li>Assisted in migration from legacy codebase to React</li>
                <li>Participated in daily standups and sprint planning sessions</li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Index;
