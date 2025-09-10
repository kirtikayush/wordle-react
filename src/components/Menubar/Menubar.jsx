import { useState } from "react";
import "./Menubar.css";

function Menubar() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="menubar">
      <div className="menubar-title">Wordle Maybe?</div>
      <div className="help-icon" onClick={() => setShowPopup((prev) => !prev)}>
        ?
      </div>

      {showPopup && (
        <div className="popup">
          <strong>How to Play:</strong>
          <p>Guess the word in 6 tries.</p>
          <p>Each guess must be a valid 5-letter word.</p>
          <p>
            Green: Correct letter in correct place.
            <br />
            Yellow: Correct letter in wrong place.
            <br />
            Gray: Incorrect letter.
          </p>
        </div>
      )}
    </div>
  );
}
export default Menubar;
