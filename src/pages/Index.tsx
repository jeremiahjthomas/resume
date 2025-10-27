import React, { useState } from "react";
import { CrosswordGrid } from "@/components/CrosswordGrid";
import { DraggableTile } from "@/components/DraggableTile";
import { ResumeSection } from "@/components/ResumeSection";
import { toast } from "sonner";
import { Linkedin, Github, Mail } from "lucide-react";

interface GridCell {
  letter: string;
  wordId: string;
  isPlaced: boolean;
  isEmpty: boolean;
  multiplier?: "TW" | "DW" | "TL" | "DL" | "STAR" | null;
}

// Word configuration for crossword
// EXPERIENCE horizontal, PROJECTS down from P, BIO down from I
// EDUCATION horizontal from E in PROJECTS, TOOLS horizontal from T in PROJECTS
const EXPERIENCE = "EXPERIENCE";
const PROJECTS = "PROJECTS";
const BIO = "BIO";
const EDUCATION = "EDUCATION";
const TOOLS = "TOOLS";

const Index = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [availableTiles, setAvailableTiles] = useState<string[]>(["O", "E", "S", "N", "O", "L", "S"]);
  const [draggedTile, setDraggedTile] = useState<string | null>(null);
  
  // Track which letters are placed for each word
  // Users only place tiles at the END: BI+O, EXPERIENC+E, PROJECT+S, EDUCATIO+N, TO+OLS
  const [placedLetters, setPlacedLetters] = useState<{
    experience: Set<number>;
    projects: Set<number>;
    bio: Set<number>;
    education: Set<number>;
    tools: Set<number>;
  }>({
    experience: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]), // EXPERIENC placed, missing E(9)
    projects: new Set([0, 1, 2, 3, 4, 5, 6]), // PROJECT placed, missing S(7)
    bio: new Set([0, 1]), // BI placed, missing O(2)
    education: new Set([0, 1, 2, 3, 4, 5, 6, 7]), // EDUCATIO placed, missing N(8)
    tools: new Set([0, 1]), // TO placed, missing O(2), L(3), S(4)
  });

  // Get multiplier for a cell based on standard Scrabble board layout
  // Map grid coordinates to standard 15x15 Scrabble board (rows 0-9, cols 3-14)
  const getMultiplier = (row: number, col: number): "TW" | "DW" | "TL" | "DL" | "STAR" | null => {
    // Map to standard Scrabble board coordinates (offset by starting position)
    const boardRow = row;
    const boardCol = col + 3; // Our grid starts at column D (3) on the Scrabble board
    
    // Triple Word Score (TW) - Red corners
    const tripleWord = [[0,0], [0,7], [0,14], [7,0], [7,14]];
    if (tripleWord.some(([r, c]) => r === boardRow && c === boardCol)) return "TW";
    
    // Double Word Score (DW) - Pink diagonal
    const doubleWord = [
      [1,1], [1,13], [2,2], [2,12], [3,3], [3,11], [4,4], [4,10],
      [10,4], [10,10], [11,3], [11,11], [12,2], [12,12], [13,1], [13,13]
    ];
    if (doubleWord.some(([r, c]) => r === boardRow && c === boardCol)) return "DW";
    
    // Triple Letter Score (TL) - Dark blue
    const tripleLetter = [
      [1,5], [1,9], [5,1], [5,5], [5,9], [5,13],
      [9,1], [9,5], [9,9], [9,13], [13,5], [13,9]
    ];
    if (tripleLetter.some(([r, c]) => r === boardRow && c === boardCol)) return "TL";
    
    // Double Letter Score (DL) - Light blue
    const doubleLetter = [
      [0,3], [0,11], [2,6], [2,8], [3,0], [3,7], [3,14],
      [6,2], [6,6], [6,8], [6,12], [7,3], [7,11],
      [8,2], [8,6], [8,8], [8,12], [11,0], [11,7], [11,14],
      [12,6], [12,8], [14,3], [14,11]
    ];
    if (doubleLetter.some(([r, c]) => r === boardRow && c === boardCol)) return "DL";
    
    // Center Star
    if (boardRow === 7 && boardCol === 7) return "STAR";
    
    return null;
  };

  // Create the crossword grid - full board with multipliers
  const createGrid = (): (GridCell | null)[][] => {
    // Create a full 10x12 grid with all cells initialized
    const grid: (GridCell | null)[][] = Array(10).fill(null).map((_, row) => 
      Array(12).fill(null).map((_, col) => ({
        letter: "",
        wordId: "",
        isPlaced: false,
        isEmpty: true,
        multiplier: getMultiplier(row, col),
      }))
    );
    
    // EXPERIENCE horizontal (row 2, starting at col 1)
    EXPERIENCE.split("").forEach((letter, idx) => {
      const col = 1 + idx;
      grid[2][col]!.letter = letter;
      grid[2][col]!.wordId = "experience";
      grid[2][col]!.isPlaced = placedLetters.experience.has(idx);
      grid[2][col]!.isEmpty = !placedLetters.experience.has(idx);
    });

    // PROJECTS vertical (starting at row 2, col 3 - the P position)
    PROJECTS.split("").forEach((letter, idx) => {
      const row = 2 + idx;
      // Skip P (index 0) as it's shared with EXPERIENCE
      if (idx === 0) return;
      
      grid[row][3]!.letter = letter;
      grid[row][3]!.wordId = "projects";
      grid[row][3]!.isPlaced = placedLetters.projects.has(idx);
      grid[row][3]!.isEmpty = !placedLetters.projects.has(idx);
    });

    // BIO vertical (col 6, starting at row 1 - B above the I in EXPERIENCE)
    // B at row 1, I at row 2 (shared with EXPERIENCE), O at row 3
    BIO.split("").forEach((letter, idx) => {
      const row = 1 + idx;
      
      // I (index 1) at row 2 is shared with EXPERIENCE
      if (idx === 1) return; // Skip rendering for BIO, EXPERIENCE will handle it
      
      grid[row][6]!.letter = letter;
      grid[row][6]!.wordId = "bio";
      grid[row][6]!.isPlaced = placedLetters.bio.has(idx);
      grid[row][6]!.isEmpty = !placedLetters.bio.has(idx);
    });

    // EDUCATION horizontal (row 6, starting at col 3 - the E in PROJECTS)
    EDUCATION.split("").forEach((letter, idx) => {
      const col = 3 + idx;
      // Skip E (index 0) as it's shared with PROJECTS
      if (idx === 0) return;
      
      grid[6][col]!.letter = letter;
      grid[6][col]!.wordId = "education";
      grid[6][col]!.isPlaced = placedLetters.education.has(idx);
      grid[6][col]!.isEmpty = !placedLetters.education.has(idx);
    });

    // TOOLS horizontal (row 8, starting at col 3 - the T in PROJECTS)
    TOOLS.split("").forEach((letter, idx) => {
      const col = 3 + idx;
      // Skip T (index 0) as it's shared with PROJECTS
      if (idx === 0) return;
      
      grid[8][col]!.letter = letter;
      grid[8][col]!.wordId = "tools";
      grid[8][col]!.isPlaced = placedLetters.tools.has(idx);
      grid[8][col]!.isEmpty = !placedLetters.tools.has(idx);
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
      // E is shared with EDUCATION
      if (idx === 4) {
        newPlacedLetters.education.add(0);
      }
      // T is shared with TOOLS
      if (idx === 6) {
        newPlacedLetters.tools.add(0);
      }
    } else if (cell.wordId === "bio") {
      const idx = row - 1; // BIO starts at row 1, not row 2
      newPlacedLetters.bio.add(idx);
      // I is shared with EXPERIENCE
      if (idx === 1) {
        newPlacedLetters.experience.add(5);
      }
    } else if (cell.wordId === "education") {
      const idx = col - 3;
      newPlacedLetters.education.add(idx);
      // E is shared with PROJECTS
      if (idx === 0) {
        newPlacedLetters.projects.add(4);
      }
    } else if (cell.wordId === "tools") {
      const idx = col - 3;
      newPlacedLetters.tools.add(idx);
      // T is shared with PROJECTS
      if (idx === 0) {
        newPlacedLetters.projects.add(6);
      }
    }

    setPlacedLetters(newPlacedLetters);
    // Remove only one instance of the placed letter
    setAvailableTiles(prev => {
      const index = prev.indexOf(letter);
      if (index > -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
    
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
      } else if (cell.wordId === "education" && newPlacedLetters.education.size === EDUCATION.length) {
        toast.success("EDUCATION complete!");
        setOpenSection("education");
      } else if (cell.wordId === "tools" && newPlacedLetters.tools.size === TOOLS.length) {
        toast.success("TOOLS complete!");
        setOpenSection("tools");
      }
    }, 300);
  };

  const isComplete = (wordId: string) => {
    if (wordId === "experience") return placedLetters.experience.size === EXPERIENCE.length;
    if (wordId === "projects") return placedLetters.projects.size === PROJECTS.length;
    if (wordId === "bio") return placedLetters.bio.size === BIO.length;
    if (wordId === "education") return placedLetters.education.size === EDUCATION.length;
    if (wordId === "tools") return placedLetters.tools.size === TOOLS.length;
    return false;
  };

  const allComplete = isComplete("experience") && isComplete("projects") && isComplete("bio") && 
                      isComplete("education") && isComplete("tools");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-scrabble">
            JEREMIAH THOMAS
          </h1>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a 
              href="https://www.linkedin.com/in/jeremiahjthomas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors duration-200"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={28} />
            </a>
            <a 
              href="https://github.com/jeremiahjthomas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors duration-200"
              aria-label="GitHub Profile"
            >
              <Github size={28} />
            </a>
            <a 
              href="mailto:jeremiahjthomas21@gmail.com"
              className="text-muted-foreground hover:text-accent transition-colors duration-200"
              aria-label="Email"
            >
              <Mail size={28} />
            </a>
          </div>
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
          {["bio", "education", "tools", "projects", "experience"].map((section) => (
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
            <p className="text-base sm:text-lg leading-relaxed mb-6">
              Computer Engineering student at Texas A&M University with a passion for full-stack development, 
              data analytics, and machine learning. I specialize in creating innovative solutions that bridge 
              hardware and software, with experience in web development, computer vision, and embedded systems. 
              When I'm not coding, I'm volunteering with community organizations or working on personal projects 
              that push the boundaries of technology.
            </p>
            <div className="space-y-2">
              <p><strong>Location:</strong> Irving, Texas</p>
              <p><strong>Email:</strong> jeremiahjthomas21@gmail.com</p>
              <p><strong>Phone:</strong> (469) 404-6089</p>
              <p><strong>GitHub:</strong> github.com/jeremiahjthomas</p>
              <p><strong>LinkedIn:</strong> linkedin.com/in/jeremiahjthomas</p>
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
              <h3 className="font-bold text-xl text-accent mb-2">Sports Analytics Display</h3>
              <p className="text-muted-foreground mb-2">Raspberry Pi | Python | RESTful API • October 2025</p>
              <p className="text-sm leading-relaxed">
                Connected an LED matrix display to a Raspberry Pi to display live sports statistics in real-time through 
                API-Sports and Python. System uses a gyroscopic wireless controller to switch between sports, teams, and 
                desired statistics through gesture detection. Rotary encoder allows user to adjust display settings. 
                PIR motion sensors automatically turn system on and off.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Computer Vision Posture Correction</h3>
              <p className="text-muted-foreground mb-2">Python • May 2023 – June 2023</p>
              <p className="text-sm leading-relaxed">
                Used MediaPipe's Pose and Facial Landmark Detection library and Numpy to calculate the user's trunk angle, 
                hip angle, neck angle, and shoulder relaxation to correct a user's posture in real-time. Uses OpenCV to 
                create a camera feed and tracks 543 landmarks efficiently, accounting for garbage collection.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Aggie Shell</h3>
              <p className="text-muted-foreground mb-2">C | LINUX | x86-64 Assembly • October 2024</p>
              <p className="text-sm leading-relaxed">
                Created a mock Linux Shell by implementing pipe commands. Implemented a user-space thread library, using 
                cooperative multitasking with the C Thread API. Connected multiple processes with UNIX pipes. Worked on 
                applying job sessions using process groups, sessions, and signal implementation.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Electronic Security System</h3>
              <p className="text-muted-foreground mb-2">Operational Amplifiers | Digital Logic | Circuit Design • June 2023 – February 2024</p>
              <p className="text-sm leading-relaxed">
                Designed and built an infrared-based security detection system that detects beam interruption to trigger 
                an alarm state. Created an IR emitter-detector circuit with optimized resistor values for maximum range 
                detection. Implemented signal amplification using op-amps, voltage comparison circuitry, and a digital 
                latch system for state maintenance.
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
              <h3 className="font-bold text-xl text-accent mb-1">Data Analyst Intern</h3>
              <p className="text-muted-foreground mb-3">Urban Resilience AI • August 2024 – August 2025</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Combed through 100+ addresses on Google Maps to determine property visibility to locate ideal areas for data collection</li>
                <li>Processed 700+ data points through Python automation, improving efficiency by 20%</li>
                <li>Transformed and visualized data with Pandas and Tableau using CI/CD workflow</li>
                <li>Highlighted structural flaws in properties affected by Hurricane Helene with PIL and OpenCV on panoramic image data</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Teaching Assistant</h3>
              <p className="text-muted-foreground mb-3">Texas A&M University Mathematics Department • January 2024 – Present</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Assisting in grading and providing lecture problem solutions for ordinary differential equations and linear algebra classes</li>
                <li>Communicating with students via GradeScope to clarify concepts and provide feedback</li>
                <li>Supporting professors in course material preparation and administrative tasks</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Undergraduate Researcher</h3>
              <p className="text-muted-foreground mb-3">University of North Texas • August 2021 – May 2023</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Processed 300,000 data points to analyze Twitter (X) data with Pandas</li>
                <li>Developed a model to detect geopolitical biases in Twitter (X) using Natural Language Processing techniques</li>
                <li>Created a 91% accurate algorithm to locate the true URL and domain of a discrete link</li>
                <li>Used tokenization, lemmatization, and stemming to create a logistic regression model predicting Twitter users' political standing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Full Stack Developer</h3>
              <p className="text-muted-foreground mb-3">Freelance • February 2019 – December 2022</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Developed User Interfaces and deployed sites for clients on Fiverr using Figma, Docker, and React</li>
                <li>Designed 100+ logos, thumbnails, and banners for well-known Twitch Streamers, YouTubers, and TikTokers</li>
                <li>Used Photoshop and Procreate to create professional-grade graphics and branding materials</li>
              </ul>
            </div>
          </div>
        }
      />

      <ResumeSection
        title="Education"
        isVisible={openSection === "education"}
        onClose={() => setOpenSection(null)}
        content={
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl text-accent mb-1">Bachelor of Science in Computer Engineering</h3>
              <p className="text-sm text-muted-foreground mb-1">Minor in Mathematics</p>
              <p className="text-muted-foreground mb-3">Texas A&M University • Expected May 2026</p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Cumulative GPA: 3.62</li>
                <li>Dean's List</li>
                <li>TAMU Datathon Advanced Challenge Winner</li>
                <li>Relevant coursework: Data Structures, Algorithms, Digital Logic, Circuit Design, Computer Architecture, Embedded Systems</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Organizations & Involvement</h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>Thrive South Asian Intervarsity - Missional Development Leader</li>
                <li>Asian Presidents Council - Member</li>
                <li>Brazos County Food Bank - Volunteer</li>
                <li>Samaritan's Purse - Operation Christmas Child Volunteer</li>
              </ul>
            </div>
          </div>
        }
      />

      <ResumeSection
        title="Tools"
        isVisible={openSection === "tools"}
        onClose={() => setOpenSection(null)}
        content={
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Developer Tools</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Git, TensorFlow, Sklearn, Jupyter, Google Workspace, Microsoft Office Suite, Unity, Power BI, Docker
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">UI/UX Design</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Figma, Procreate, Adobe Creative Cloud, JIRA, Confluence, Azure DevOps
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Programming Languages & Frameworks</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Python, C++, C#, JavaScript (React, Node.js, Angular), TypeScript, Java, HTML, CSS, MATLAB, MySQL, 
                PostgreSQL, LaTeX, Linux, Haskell, Rust, Spring Boot, Rexx, Express.js
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Hardware & Embedded Systems</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Circuit Design, Digital Logic, AutoCAD, OnShape, Verilog, HDL, Assembler
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl text-accent mb-2">Cloud & DevOps</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                AWS Cloud, Terraform, npm, Web Services, WebSockets, API development, Agile
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Index;
