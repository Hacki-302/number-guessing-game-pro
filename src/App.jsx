import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp, BookOpen, Check, CircleHelp, Dice5, Gamepad2, Hash,
  Lightbulb, Moon, RefreshCw, Send, Sparkles, Sun, Target, Trophy, UserRound
} from "lucide-react";

const MAX_ATTEMPTS = 7;
const makeSecret = () => Math.floor(Math.random() * 100) + 1;

const features = [
  { icon: Dice5, title: "Random number", detail: "(1 – 100)", color: "cyan" },
  { icon: UserRound, title: "User guesses", detail: "with input field", color: "green" },
  { icon: ArrowDownUp, title: "Higher/lower hints", detail: "after each guess", color: "purple" },
  { icon: Hash, title: "Attempt counter", detail: "(7 attempts)", color: "amber" },
  { icon: Trophy, title: "Win/lose message", detail: "with final result", color: "red" },
  { icon: RefreshCw, title: "Play again button", detail: "to start a new game", color: "cyan" },
];

const steps = [
  "The game picks a random number between 1 and 100.",
  'You enter a guess and click "Guess".',
  "The game tells you if the number is higher or lower.",
  "Your attempts are counted.",
  "When you guess correctly or run out of attempts, you see a message and can play again.",
];

function getSavedBest() {
  try {
    const value = Number(localStorage.getItem("ngg-best-score"));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [secret, setSecret] = useState(makeSecret);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState(getSavedBest);
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("Make your first guess!");
  const [history, setHistory] = useState([]);
  const [lightMode, setLightMode] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (status === "playing") inputRef.current?.focus();
  }, [status]);

  function submitGuess(event) {
    event.preventDefault();
    if (status !== "playing") return;

    const trimmed = guess.trim();
    const value = Number(trimmed);
    if (!trimmed || !Number.isInteger(value) || value < 1 || value > 100) {
      setError("Enter a whole number between 1 and 100.");
      inputRef.current?.focus();
      return;
    }

    setError("");
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setHistory((previous) => [value, ...previous].slice(0, 5));
    setGuess("");

    if (value === secret) {
      setStatus("won");
      setMessage(`Brilliant! ${secret} was the number. You won in ${nextAttempts} ${nextAttempts === 1 ? "attempt" : "attempts"}!`);
      if (!best || nextAttempts < best) {
        setBest(nextAttempts);
        try { localStorage.setItem("ngg-best-score", String(nextAttempts)); } catch { /* storage may be unavailable */ }
      }
    } else if (nextAttempts >= MAX_ATTEMPTS) {
      setStatus("lost");
      setMessage(`Game over! The secret number was ${secret}. Give it another try.`);
    } else {
      setMessage(value < secret ? "Too low! Try a higher number." : "Too high! Try a lower number.");
    }
    inputRef.current?.focus();
  }

  function restart() {
    setSecret(makeSecret());
    setGuess("");
    setAttempts(0);
    setStatus("playing");
    setMessage("Make your first guess!");
    setHistory([]);
    setError("");
  }

  const progress = (attempts / MAX_ATTEMPTS) * 100;

  return (
    <main className={`app-shell ${lightMode ? "light-mode" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Number Guessing Game home">
          <span className="brand-target">🎯</span>
          <span>Number <span className="gradient-text">Guessing</span> Game</span>
        </a>
        <div className="top-actions">
          <div className="best-pill"><Trophy size={25} className="trophy-icon" /><span>Best Score<strong>{best ? `${best} ${best === 1 ? "attempt" : "attempts"}` : "--"}</strong></span></div>
          <button className="theme-button" onClick={() => setLightMode((v) => !v)} aria-label="Toggle color theme" title="Toggle theme">
            {lightMode ? <Moon size={21} /> : <Sun size={21} />}
          </button>
        </div>
      </header>

      <section className="dashboard">
        <aside className="side-card features-card">
          <h2><Sparkles size={24} className="heading-icon" />Game Features</h2>
          <div className="side-divider" />
          <div className="feature-list">
            {features.map(({ icon: Icon, title, detail, color }) => (
              <div className="feature-item" key={title}>
                <span className={`round-icon ${color}`}><Icon size={23} strokeWidth={2.2} /></span>
                <span className="feature-copy"><strong>{title}</strong><small>{detail}</small></span>
              </div>
            ))}
          </div>
        </aside>

        <section className="game-card">
          <div className="target-wrap"><Target size={78} strokeWidth={1.7} /><span className="target-spark spark-one">✦</span><span className="target-spark spark-two">✦</span></div>
          <p className="eyebrow">THINK. GUESS. WIN.</p>
          <h1>Number <span className="gradient-text">Guessing</span> Game</h1>
          <p className="subtitle">I have chosen a number between 1 and 100.<br className="desktop-break" /> Can you guess it?</p>

          <div className="stat-grid">
            <div className="stat-card"><span className="round-icon cyan"><Gamepad2 size={23} /></span><span className="stat-copy"><small>Attempts</small><strong>{attempts} / {MAX_ATTEMPTS}</strong></span></div>
            <div className="stat-card"><span className="round-icon purple"><Target size={23} /></span><span className="stat-copy"><small>Range</small><strong>1 – 100</strong></span></div>
            <div className="stat-card"><span className="round-icon green"><Trophy size={23} /></span><span className="stat-copy"><small>Best Score</small><strong>{best ?? "--"}</strong></span></div>
          </div>

          <form className="guess-form" onSubmit={submitGuess}>
            <label className="guess-input-wrap">
              <Hash size={22} aria-hidden="true" />
              <input
                ref={inputRef}
                type="number"
                min="1"
                max="100"
                step="1"
                value={guess}
                onChange={(event) => { setGuess(event.target.value); if (error) setError(""); }}
                placeholder="Enter your guess (1 - 100)"
                aria-label="Enter your guess between 1 and 100"
                disabled={status !== "playing"}
              />
            </label>
            <button className="guess-button" type="submit" disabled={status !== "playing"}><Send size={20} />Guess</button>
          </form>

          {error && <p className="validation-message" role="alert">{error}</p>}

          <div className="progress-meta"><span>GAME PROGRESS</span><span>{attempts} of {MAX_ATTEMPTS}</span></div>
          <div className="progress-track" aria-label={`${attempts} of ${MAX_ATTEMPTS} attempts used`} role="progressbar" aria-valuemin="0" aria-valuemax={MAX_ATTEMPTS} aria-valuenow={attempts}>
            <div className={`progress-fill ${status === "won" ? "success-fill" : status === "lost" ? "fail-fill" : ""}`} style={{ width: `${progress}%` }} />
          </div>

          <div className={`feedback ${status === "won" ? "feedback-success" : status === "lost" ? "feedback-fail" : ""}`} role="status">
            <Lightbulb size={25} className="bulb-icon" />
            <span>{message}</span>
          </div>

          {history.length > 0 && (
            <div className="history-row"><span>Recent guesses</span><div>{history.map((item, index) => <span key={`${item}-${index}`} className={`guess-chip ${item === secret ? "correct-chip" : ""}`}>{item}</span>)}</div></div>
          )}

          <button className="replay-button" type="button" onClick={restart}><RefreshCw size={19} />Play Again</button>
        </section>

        <aside className="side-card instructions-card">
          <h2><BookOpen size={25} className="heading-icon" />How to Play</h2>
          <div className="side-divider" />
          <ol className="steps-list">
            {steps.map((step, index) => <li key={step}><span className="step-number">{index + 1}</span><p>{step}</p></li>)}
          </ol>
          <div className="good-luck">Good Luck!<span /></div>
        </aside>
      </section>

      <footer className="footer">
        <div className="footer-line" />
        <div className="footer-content">
          <div className="built-with"><span>Built with</span><span className="tech-badge html-badge">5</span><span className="tech-badge css-badge">3</span><span className="tech-badge js-badge">JS</span><span className="react-badge">React</span><span className="tailwind-badge">Tailwind</span></div>
          <span className="have-fun">♥ <span>Have fun!</span></span>
        </div>
      </footer>
    </main>
  );
}