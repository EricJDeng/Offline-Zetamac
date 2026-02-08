const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "med", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const OPS = [
  { value: "+", label: "+" },
  { value: "-", label: "-" },
  { value: "*", label: "×" },
  { value: "/", label: "÷" },
];

export default function GameSettings({
  difficulty,
  setDifficulty,
  ops,
  setOps,
  disabled,
  compact = false,
}) {
  return (
    <div className={`settings ${compact ? "settings-compact" : ""}`}>
      <div className="settings-group">
        <div className="settings-label">Difficulty</div>
        <div className="segmented">
          {DIFFICULTIES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                difficulty === item.value
                  ? "segment active"
                  : "segment"
              }
              onClick={() => setDifficulty(item.value)}
              disabled={disabled}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-group">
        <div className="settings-label">Operations</div>
        <div className="ops">
          {OPS.map((op) => (
            <label key={op.value} className="op-pill">
              <input
                type="checkbox"
                checked={ops[op.value]}
                onChange={(event) =>
                  setOps({ ...ops, [op.value]: event.target.checked })
                }
                disabled={disabled}
              />
              <span>{op.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
