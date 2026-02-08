import { useEffect, useRef } from "react";

export default function QuestionCard({
  question,
  running,
  answer,
  setAnswer,
  onSubmit,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (running && inputRef.current) {
      inputRef.current.focus();
    }
  }, [running, question]);

  return (
    <div className="question-card">
      <div className="question-prompt">
        {question?.prompt ?? "Press start to begin"}
      </div>
      <form onSubmit={onSubmit} className="question-form">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={!running}
          placeholder={running ? "Answer" : ""}
        />
      </form>
    </div>
  );
}
