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

    // Check if guess is in words.json
    if (!words.includes(guessWord)) {
      setMessage("Not a valid word!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    // Reset message
    setMessage("");

    const newColors = colors.map((r) => [...r]);
    const solutionLetters = solution.split("");
    const guessLetters = guesses[currentRow];

    const letterCount = {};
    solutionLetters.forEach((l) => {
      letterCount[l] = (letterCount[l] || 0) + 1;
    });

    // First pass: green letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === solutionLetters[i]) {
        newColors[currentRow][i] = "green";
        letterCount[guessLetters[i]]--;
      }
    }

    // Second pass: yellow and gray letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (newColors[currentRow][i] !== "green") {
        if (
          solutionLetters.includes(guessLetters[i]) &&
          letterCount[guessLetters[i]] > 0
        ) {
          newColors[currentRow][i] = "yellow";
          letterCount[guessLetters[i]]--;
        } else {
          newColors[currentRow][i] = "gray";
        }
      }
    }

    setColors(newColors);

    // Check for win / game over
    if (guessWord.toUpperCase() === solution) {
      setGameOver(true);
    } else if (currentRow + 1 >= MAX_GUESSES) {
      setGameOver(true);
    } else {
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
    }
  };

  return (
    <div className="board-container">
      <h1>Wordle Clone</h1>

      <div className="board">
        {guesses.map((guessRow, rowIndex) => (
          <Line key={rowIndex} guess={guessRow} colors={colors[rowIndex]} />
        ))}
      </div>

      {message && <div className="message">{message}</div>}

      {gameOver && (
        <div className="solution">
          Solution: <strong>{solution}</strong>
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
