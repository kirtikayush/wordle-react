import { useEffect, useRef, useState } from "react";
import words from "./words.json";
import "./App.css";
import Menubar from "./components/Menubar/Menubar"; // Correct import

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function App() {
  const inputRef = useRef(null);

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

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setSolution(words[randomIndex].toUpperCase());
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentRow]);

  const handleKeyDown = (e) => {
    if (gameOver) return;
    if (currentRow >= MAX_GUESSES) return;

    const key = e.key;

    if (key === "Backspace") {
      if (currentCol > 0) {
        updateCell(currentRow, currentCol - 1, "");
        setCurrentCol(currentCol - 1);
      }
      e.preventDefault();
    } else if (/^[a-zA-Z]$/.test(key)) {
      if (currentCol < WORD_LENGTH) {
        updateCell(currentRow, currentCol, key.toUpperCase());

        const cellElement = document.querySelector(
          `.line:nth-child(${currentRow + 1}) .title:nth-child(${
            currentCol + 1
          })`
        );
        if (cellElement) {
          cellElement.classList.remove("typing");
          void cellElement.offsetWidth;
          cellElement.classList.add("typing");
        }

        setCurrentCol(currentCol + 1);
      }
      e.preventDefault();
    } else if (key === "Enter") {
      if (currentCol === WORD_LENGTH) {
        submitGuess();
      }
      e.preventDefault();
    }
  };

  const updateCell = (row, col, value) => {
    const newGuesses = guesses.map((r) => [...r]);
    newGuesses[row][col] = value;
    setGuesses(newGuesses);
  };

  const submitGuess = () => {
    const guessWord = guesses[currentRow].join("").toLowerCase();

    if (!words.includes(guessWord)) {
      // setMessage("Not a valid word!");

      const currentLine = document.querySelector(
        `.board .line:nth-child(${currentRow + 1})`
      );
      if (currentLine) {
        currentLine.classList.remove("shake");
        void currentLine.offsetWidth;
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

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === solutionLetters[i]) {
        computedColors[i] = "green";
        letterCount[guessLetters[i]]--;
      }
    }

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

    for (let i = 0; i < WORD_LENGTH; i++) {
      setTimeout(() => {
        setColors((prevColors) => {
          const newColors = prevColors.map((r) => [...r]);
          newColors[currentRow][i] = "flip";
          return newColors;
        });

        setTimeout(() => {
          setColors((prevColors) => {
            const newColors = prevColors.map((r) => [...r]);
            newColors[currentRow][i] = computedColors[i];
            return newColors;
          });
        }, 400);
      }, i * 300);
    }

    setTimeout(() => {
      if (guessWord.toUpperCase() === solution) {
        setGameOver(true);
      } else if (currentRow + 1 >= MAX_GUESSES) {
        setGameOver(true);
      } else {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
      }
    }, WORD_LENGTH * 300 + 500);
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
    inputRef.current?.focus();
  };

  return (
    <>
      <Menubar />

      <div
        className="board-container"
        onClick={() => inputRef.current?.focus()}
      >
        {/* <h1 style={{ color: "white" }}>Wordle Maybe?</h1> */}

        <input
          type="text"
          ref={inputRef}
          autoFocus
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
            top: 0,
            left: 0,
            zIndex: -1,
          }}
          onKeyDown={handleKeyDown}
        />

        <div className="board">
          {guesses.map((guessRow, rowIndex) => (
            <Line key={rowIndex} guess={guessRow} colors={colors[rowIndex]} />
          ))}
        </div>

        {message && <div className="message">{message}</div>}

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
    </>
  );
}

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
