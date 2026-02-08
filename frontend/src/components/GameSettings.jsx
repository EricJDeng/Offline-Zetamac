const OPS = [
  { value: "+", label: "+" },
  { value: "-", label: "-" },
  { value: "*", label: "×" },
  { value: "/", label: "÷" },
];

export default function GameSettings({
  ops,
  setOps,
  addRangeA,
  setAddRangeA,
  addRangeB,
  setAddRangeB,
  multRangeA,
  setMultRangeA,
  multRangeB,
  setMultRangeB,
  duration,
  setDuration,
  disabled,
  compact = false,
}) {
  return (
    <div className={`settings ${compact ? "settings-compact" : ""}`}>
      <div className="settings-group">
        {!compact && (
          <>
            <div className="settings-title">Arithmetic Game</div>
            <div className="settings-subtitle">
              Customize your drill and start a timed run.
            </div>
          </>
        )}
      </div>
      <div className="settings-group">
        <label className="op-row">
          <input
            type="checkbox"
            checked={ops["+"]}
            onChange={(event) =>
              setOps({ ...ops, "+": event.target.checked })
            }
            disabled={disabled}
          />
          <div className="op-text">
            <div className="op-label">Addition</div>
            <div className="op-range">
              Range:
              <input
                type="number"
                value={addRangeA.min}
                onChange={(event) =>
                  setAddRangeA({ ...addRangeA, min: Number(event.target.value) })
                }
                disabled={disabled}
              />
              to
              <input
                type="number"
                value={addRangeA.max}
                onChange={(event) =>
                  setAddRangeA({ ...addRangeA, max: Number(event.target.value) })
                }
                disabled={disabled}
              />
              +
              <input
                type="number"
                value={addRangeB.min}
                onChange={(event) =>
                  setAddRangeB({ ...addRangeB, min: Number(event.target.value) })
                }
                disabled={disabled}
              />
              to
              <input
                type="number"
                value={addRangeB.max}
                onChange={(event) =>
                  setAddRangeB({ ...addRangeB, max: Number(event.target.value) })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </label>
        <label className="op-row">
          <input
            type="checkbox"
            checked={ops["-"]}
            onChange={(event) =>
              setOps({ ...ops, "-": event.target.checked })
            }
            disabled={disabled}
          />
          <div className="op-text">
            <div className="op-label">Subtraction</div>
            <div className="op-note">Addition problems in reverse.</div>
          </div>
        </label>
        <label className="op-row">
          <input
            type="checkbox"
            checked={ops["*"]}
            onChange={(event) =>
              setOps({ ...ops, "*": event.target.checked })
            }
            disabled={disabled}
          />
          <div className="op-text">
            <div className="op-label">Multiplication</div>
            <div className="op-range">
              Range:
              <input
                type="number"
                value={multRangeA.min}
                onChange={(event) =>
                  setMultRangeA({
                    ...multRangeA,
                    min: Number(event.target.value),
                  })
                }
                disabled={disabled}
              />
              to
              <input
                type="number"
                value={multRangeA.max}
                onChange={(event) =>
                  setMultRangeA({
                    ...multRangeA,
                    max: Number(event.target.value),
                  })
                }
                disabled={disabled}
              />
              ×
              <input
                type="number"
                value={multRangeB.min}
                onChange={(event) =>
                  setMultRangeB({
                    ...multRangeB,
                    min: Number(event.target.value),
                  })
                }
                disabled={disabled}
              />
              to
              <input
                type="number"
                value={multRangeB.max}
                onChange={(event) =>
                  setMultRangeB({
                    ...multRangeB,
                    max: Number(event.target.value),
                  })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </label>
        <label className="op-row">
          <input
            type="checkbox"
            checked={ops["/"]}
            onChange={(event) =>
              setOps({ ...ops, "/": event.target.checked })
            }
            disabled={disabled}
          />
          <div className="op-text">
            <div className="op-label">Division</div>
            <div className="op-note">Multiplication problems in reverse.</div>
          </div>
        </label>
        <div className="duration-row">
          <label>Duration:</label>
          <select
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            disabled={disabled}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={120}>120 seconds</option>
          </select>
        </div>
      </div>
    </div>
  );
}
