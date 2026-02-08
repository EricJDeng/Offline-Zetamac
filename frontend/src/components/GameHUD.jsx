export default function GameHUD({ score, streak, timeLeft, accuracy }) {
  return (
    <div className="hud">
      <div className="hud-card">
        <div className="hud-label">Score</div>
        <div className="hud-value">{score}</div>
      </div>
      <div className="hud-card">
        <div className="hud-label">Streak</div>
        <div className="hud-value">{streak}</div>
      </div>
      <div className="hud-card">
        <div className="hud-label">Time</div>
        <div className={`hud-value ${timeLeft <= 10 ? "danger" : ""}`}>
          {timeLeft}s
        </div>
      </div>
      <div className="hud-card">
        <div className="hud-label">Accuracy</div>
        <div className="hud-value">{accuracy}%</div>
      </div>
    </div>
  );
}
