import { useEffect, useState } from "react";
import words from "./words.json"; // Array of valid 5-letter words
import "./App.css";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function App() {
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState(
    Array(MAX_GUESSES)
      .fill("")
      .map(() => Array(WORD_LENGTH).fill(""))
  );
  const [colors, setColors] = useState(
    Array(MAX_GUESSES)
      .fill("")
      .map(() => Array(WORD_LENGTH).fill("empty"))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  // Pick a random solution word
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setSolution(words[randomIndex].toUpperCase());
  }, []);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (currentRow >= MAX_GUESSES) return;

      if (e.key === "Backspace") {
        if (currentCol > 0) {
          updateCell(currentRow, currentCol - 1, "");
          setCurrentCol(currentCol - 1);
        }
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentCol < WORD_LENGTH) {
          updateCell(currentRow, currentCol, e.key.toUpperCase());

          // Add typing animation class
          const cellElement = document.querySelector(
            `.line:nth-child(${currentRow + 1}) .title:nth-child(${
              currentCol + 1
            })`
          );
          if (cellElement) {
            cellElement.classList.remove("typing"); // reset in case of retyping fast
            void cellElement.offsetWidth; // trigger reflow
            cellElement.classList.add("typing");
          }

          setCurrentCol(currentCol + 1);
        }
      } else if (e.key === "Enter") {
        if (currentCol === WORD_LENGTH) {
          submitGuess();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentRow, currentCol, guesses, solution, gameOver]);

  // Update a specific cell
  const updateCell = (row, col, value) => {
    const newGuesses = guesses.map((r) => [...r]);
    newGuesses[row][col] = value;
    setGuesses(newGuesses);
  };

  // Submit current guess
  const submitGuess = () => {
    const guessWord = guesses[currentRow].join("").toLowerCase();

    if (!words.includes(guessWord)) {
      setMessage("Not a valid word!");

      const currentLine = document.querySelector(
        `.board .line:nth-child(${currentRow + 1})`
      );
      if (currentLine) {
        currentLine.classList.remove("shake");
        void currentLine.offsetWidth; // trigger reflow
        currentLine.classList.add("shake");
      }

      setTimeout(() => setMessage(""), 1500);
      return;
    }

    setMessage("");

    const solutionLetters = solution.split("");
    const guessLetters = guesses[currentRow];
    const letterCount = {};
    solutionLetters.forEach((l) => {
      letterCount[l] = (letterCount[l] || 0) + 1;
    });

    const computedColors = Array(WORD_LENGTH).fill("gray");

    // First pass: green
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === solutionLetters[i]) {
        computedColors[i] = "green";
        letterCount[guessLetters[i]]--;
      }
    }

    // Second pass: yellow
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (
        computedColors[i] !== "green" &&
        solutionLetters.includes(guessLetters[i]) &&
        letterCount[guessLetters[i]] > 0
      ) {
        computedColors[i] = "yellow";
        letterCount[guessLetters[i]]--;
      }
    }

    // Correct flip + color logic (no direct DOM manipulation here)
    for (let i = 0; i < WORD_LENGTH; i++) {
      setTimeout(() => {
        // Step 1: Apply flip animation
        setColors((prevColors) => {
          const newColors = prevColors.map((r) => [...r]);
          newColors[currentRow][i] = "flip";
          return newColors;
        });

        // Step 2: Apply final color after flip
        setTimeout(() => {
          setColors((prevColors) => {
            const newColors = prevColors.map((r) => [...r]);
            newColors[currentRow][i] = computedColors[i]; // green/yellow/gray
            return newColors;
          });
        }, 400); // halfway through flip
      }, i * 300); // staggered
    }

    // Proceed after animation
    setTimeout(() => {
      if (guessWord.toUpperCase() === solution) {
        setGameOver(true);
      } else if (currentRow + 1 >= MAX_GUESSES) {
        setGameOver(true);
      } else {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
      }
    }, WORD_LENGTH * 300 + 500); // properly adjusted timing
  };

  const resetGame = () => {
    setGuesses(
      Array(MAX_GUESSES)
        .fill("")
        .map(() => Array(WORD_LENGTH).fill(""))
    );
    setColors(
      Array(MAX_GUESSES)
        .fill("")
        .map(() => Array(WORD_LENGTH).fill("empty"))
    );
    setCurrentRow(0);
    setCurrentCol(0);
    setGameOver(false);
    setMessage("");

    const randomIndex = Math.floor(Math.random() * words.length);
    setSolution(words[randomIndex].toUpperCase());
  };

  return (
    <div className="board-container">
      <h1>Wordle Maybe?</h1>

      <div className="board">
        {guesses.map((guessRow, rowIndex) => (
          <Line key={rowIndex} guess={guessRow} colors={colors[rowIndex]} />
        ))}
      </div>

      {/* Optional message (currently commented out) */}
      {/* {message && <div className="message">{message}</div>} */}
      {/* {solution} */}
      {gameOver && (
        <div className="game-over-container">
          <div className="solution">
            Solution: <strong>{solution}</strong>
          </div>
          <button className="reset-button" onClick={resetGame}>
            New Game
          </button>
        </div>
      )}
    </div>
  );
}

// Single line (row) of the grid
function Line({ guess, colors }) {
  return (
    <div className="line">
      {guess.map((char, i) => (
        <div key={i} className={`title ${colors[i]}`}>
          {char}
        </div>
      ))}
    </div>
  );
}

export default App;
