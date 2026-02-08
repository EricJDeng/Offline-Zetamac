import { useEffect, useMemo, useRef, useState } from "react";
import { fetchQuestion, saveRun } from "../api.js";
import GameSettings from "../components/GameSettings.jsx";
import GameHUD from "../components/GameHUD.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import GameOverModal from "../components/GameOverModal.jsx";

const MODE = "timed_custom";

export default function GamePage() {
  const [ops, setOps] = useState({ "+": true, "-": true, "*": true, "/": false });
  const [addRangeA, setAddRangeA] = useState({ min: 2, max: 100 });
  const [addRangeB, setAddRangeB] = useState({ min: 2, max: 100 });
  const [multRangeA, setMultRangeA] = useState({ min: 2, max: 12 });
  const [multRangeB, setMultRangeB] = useState({ min: 2, max: 100 });
  const [duration, setDuration] = useState(60);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const autoAdvanceRef = useRef(false);

  const opsSelection = useMemo(
    () => Object.keys(ops).filter((key) => ops[key]).join(""),
    [ops]
  );

  const opsKey = useMemo(() => {
    return `${opsSelection}|a:${addRangeA.min}-${addRangeA.max},${addRangeB.min}-${addRangeB.max}` +
      `|m:${multRangeA.min}-${multRangeA.max},${multRangeB.min}-${multRangeB.max}` +
      `|t:${duration}`;
  }, [opsSelection, addRangeA, addRangeB, multRangeA, multRangeB, duration]);

  useEffect(() => {
    if (!running) return undefined;
    if (timeLeft <= 0) return undefined;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [running, timeLeft]);

  useEffect(() => {
    if (!running) {
      setTimeLeft(duration);
    }
  }, [duration, running]);

  useEffect(() => {
    if (!running || timeLeft > 0) return;
    setRunning(false);
    handleGameOver();
  }, [running, timeLeft]);

  useEffect(() => {
    if (!running || !question) return;
    const trimmed = answer.trim();
    if (!trimmed) return;
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed) || parsed !== question.answer) return;
    if (autoAdvanceRef.current) return;
    autoAdvanceRef.current = true;
    setAnswer("");
    (async () => {
      await submitAnswer(trimmed);
      autoAdvanceRef.current = false;
    })();
  }, [answer, question, running]);

  async function loadQuestion() {
    const next = await fetchQuestion({
      difficulty: "custom",
      ops: opsSelection,
      ranges: {
        add: { a: addRangeA, b: addRangeB },
        mult: { a: multRangeA, b: multRangeB },
      },
    });
    setQuestion(next);
  }

  async function startGame() {
    setScore(0);
    setStreak(0);
    setAttempted(0);
    setCorrect(0);
    setGameResult(null);
    setTimeLeft(duration);
    setRunning(true);
    await loadQuestion();
    setAnswer("");
  }

  async function submitAnswer(value) {
    if (!running || !question) return;
    const parsed = Number.parseInt(value, 10);
    const isCorrect = Number.isFinite(parsed) && parsed === question.answer;
    setAttempted((prev) => prev + 1);
    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      await loadQuestion();
    } else {
      setStreak(0);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const current = answer.trim();
    if (!current) return;
    setAnswer("");
    await submitAnswer(current);
  }

  async function handleGameOver() {
    if (saving) return;
    setSaving(true);
    try {
      const result = await saveRun({
        mode: MODE,
        difficulty: "custom",
        ops: opsKey,
        score,
        attempted,
        correct,
      });
      setGameResult({
        score,
        attempted,
        correct,
        isNewHighScore: result.is_new_high_score,
        bestScore: result.best_score,
      });
    } finally {
      setSaving(false);
    }
  }

  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return (
    <div className="game-page">
      <GameSettings
        ops={ops}
        setOps={setOps}
        addRangeA={addRangeA}
        setAddRangeA={setAddRangeA}
        addRangeB={addRangeB}
        setAddRangeB={setAddRangeB}
        multRangeA={multRangeA}
        setMultRangeA={setMultRangeA}
        multRangeB={multRangeB}
        setMultRangeB={setMultRangeB}
        duration={duration}
        setDuration={setDuration}
        disabled={running}
      />
      <GameHUD
        score={score}
        streak={streak}
        timeLeft={timeLeft}
        accuracy={accuracy}
      />
      <div className="game-area">
        <QuestionCard
          question={question}
          running={running}
          answer={answer}
          setAnswer={setAnswer}
          onSubmit={handleSubmit}
        />
        <div className="game-actions">
          {!running ? (
            <button
              type="button"
              className="primary"
              onClick={startGame}
              disabled={!opsSelection}
            >
              Start Run
            </button>
          ) : (
            <button
              type="button"
              className="ghost"
              onClick={() => setTimeLeft(0)}
            >
              End Run
            </button>
          )}
        </div>
      </div>
      {gameResult && (
        <GameOverModal
          result={gameResult}
          onClose={() => setGameResult(null)}
        />
      )}
    </div>
  );
}
