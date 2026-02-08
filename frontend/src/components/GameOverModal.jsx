export default function GameOverModal({ result, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-title">Run complete</div>
        <div className="modal-body">
          <div className="modal-score">Score: {result.score}</div>
          <div>Accuracy: {result.correct}/{result.attempted}</div>
          {result.isNewHighScore && (
            <div className="badge">New high score</div>
          )}
          {!result.isNewHighScore && (
            <div className="muted">Best score: {result.bestScore}</div>
          )}
        </div>
        <button type="button" className="primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
