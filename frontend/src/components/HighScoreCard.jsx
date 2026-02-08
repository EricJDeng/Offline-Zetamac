export default function HighScoreCard({ score }) {
  return (
    <div className="highscore-card">
      <div className="highscore-label">High Score</div>
      <div className="highscore-value">{score}</div>
    </div>
  );
}
