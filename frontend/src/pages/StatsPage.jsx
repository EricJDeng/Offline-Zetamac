import { useEffect, useMemo, useState } from "react";
import { fetchHighScore, fetchRuns } from "../api.js";
import GameSettings from "../components/GameSettings.jsx";
import HighScoreCard from "../components/HighScoreCard.jsx";
import HistoryChart from "../components/HistoryChart.jsx";

const MODE = "timed_60";

export default function StatsPage() {
  const [difficulty, setDifficulty] = useState("easy");
  const [ops, setOps] = useState({ "+": true, "-": true, "*": true, "/": false });
  const [runs, setRuns] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [showAvg, setShowAvg] = useState(true);

  const opsString = useMemo(
    () => Object.keys(ops).filter((key) => ops[key]).join(""),
    [ops]
  );

  useEffect(() => {
    let active = true;
    async function load() {
      if (!opsString) return;
      const [runsRes, highRes] = await Promise.all([
        fetchRuns({ mode: MODE, difficulty, ops: opsString, limit: 200 }),
        fetchHighScore({ mode: MODE, difficulty, ops: opsString }),
      ]);
      if (!active) return;
      setRuns(runsRes.runs || []);
      setHighScore(highRes.best_score || 0);
    }
    load();
    return () => {
      active = false;
    };
  }, [difficulty, opsString]);

  return (
    <div className="stats-page">
      <div className="stats-header">
        <GameSettings
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          ops={ops}
          setOps={setOps}
          disabled={false}
          compact
        />
        <label className="toggle">
          <input
            type="checkbox"
            checked={showAvg}
            onChange={(e) => setShowAvg(e.target.checked)}
          />
          Show moving average
        </label>
      </div>
      <HighScoreCard score={highScore} />
      <HistoryChart runs={runs} showAvg={showAvg} />
      {runs.length === 0 && <div className="empty">No runs yet.</div>}
      {runs.length > 0 && (
        <div className="runs-table">
          <div className="table-row table-head">
            <span>Date</span>
            <span>Score</span>
            <span>Accuracy</span>
          </div>
          {runs.slice(0, 20).map((run) => {
            const accuracy =
              run.attempted > 0
                ? Math.round((run.correct / run.attempted) * 100)
                : 0;
            return (
              <div key={run.id} className="table-row">
                <span>{new Date(run.created_at).toLocaleString()}</span>
                <span>{run.score}</span>
                <span>{accuracy}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
