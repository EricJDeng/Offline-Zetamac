const API_BASE = "http://localhost:8000";

export async function fetchQuestion({ difficulty, ops, ranges }) {
  const res = await fetch(`${API_BASE}/api/question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty, ops, ranges }),
  });
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json();
}

export async function saveRun(payload) {
  const res = await fetch(`${API_BASE}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save run");
  return res.json();
}

export async function fetchHighScore({ mode, difficulty, ops }) {
  const qs = new URLSearchParams({ mode, difficulty, ops });
  const res = await fetch(`${API_BASE}/api/highscore?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch high score");
  return res.json();
}

export async function fetchRuns({ mode, difficulty, ops, limit = 200 }) {
  const qs = new URLSearchParams({ mode, difficulty, ops, limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/runs?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}
