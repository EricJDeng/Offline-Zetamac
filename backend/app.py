from __future__ import annotations

import random
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data.db"

app = FastAPI(title="Offline Zetamac API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@dataclass(frozen=True)
class RangeConfig:
    add_sub_min: int
    add_sub_max: int
    mult_min: int
    mult_max: int


DIFFICULTY_RANGES = {
    "easy": RangeConfig(add_sub_min=1, add_sub_max=20, mult_min=1, mult_max=12),
    "med": RangeConfig(add_sub_min=10, add_sub_max=99, mult_min=2, mult_max=19),
    "hard": RangeConfig(add_sub_min=100, add_sub_max=999, mult_min=11, mult_max=29),
}


class QuestionRequest(BaseModel):
    difficulty: str
    ops: str


class QuestionResponse(BaseModel):
    id: str
    prompt: str
    answer: int


class RunCreate(BaseModel):
    mode: str
    difficulty: str
    ops: str
    score: int
    attempted: int
    correct: int


class RunCreateResponse(BaseModel):
    run_id: int
    is_new_high_score: bool
    best_score: int


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                mode TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                ops TEXT NOT NULL,
                score INTEGER NOT NULL,
                attempted INTEGER NOT NULL,
                correct INTEGER NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS high_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mode TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                ops TEXT NOT NULL,
                best_score INTEGER NOT NULL,
                best_run_id INTEGER NOT NULL,
                UNIQUE(mode, difficulty, ops)
            );
            """
        )


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def _pick_op(ops: str) -> str:
    normalized = [c for c in ops if c in ["+", "-", "*", "/"]]
    if not normalized:
        raise HTTPException(status_code=400, detail="No valid ops provided")
    return random.choice(normalized)


def _generate_question(difficulty: str, ops: str) -> QuestionResponse:
    if difficulty not in DIFFICULTY_RANGES:
        raise HTTPException(status_code=400, detail="Invalid difficulty")

    ranges = DIFFICULTY_RANGES[difficulty]
    op = _pick_op(ops)

    if op in ["+", "-"]:
        a = random.randint(ranges.add_sub_min, ranges.add_sub_max)
        b = random.randint(ranges.add_sub_min, ranges.add_sub_max)
        if op == "-" and difficulty in ["easy", "med"] and b > a:
            a, b = b, a
        answer = a + b if op == "+" else a - b
        prompt = f"{a} {op} {b}"
    elif op == "*":
        a = random.randint(ranges.mult_min, ranges.mult_max)
        b = random.randint(ranges.mult_min, ranges.mult_max)
        answer = a * b
        prompt = f"{a} × {b}"
    else:
        # Division: ensure integer answers
        b = random.randint(ranges.mult_min, ranges.mult_max)
        k = random.randint(ranges.mult_min, ranges.mult_max)
        a = b * k
        answer = k
        prompt = f"{a} ÷ {b}"

    return QuestionResponse(id=str(uuid.uuid4()), prompt=prompt, answer=answer)


@app.post("/api/question", response_model=QuestionResponse)
def create_question(payload: QuestionRequest) -> QuestionResponse:
    return _generate_question(payload.difficulty, payload.ops)


@app.post("/api/runs", response_model=RunCreateResponse)
def create_run(payload: RunCreate) -> RunCreateResponse:
    with get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO runs (mode, difficulty, ops, score, attempted, correct)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.mode,
                payload.difficulty,
                payload.ops,
                payload.score,
                payload.attempted,
                payload.correct,
            ),
        )
        run_id = cur.lastrowid

        row = conn.execute(
            """
            SELECT best_score FROM high_scores
            WHERE mode = ? AND difficulty = ? AND ops = ?
            """,
            (payload.mode, payload.difficulty, payload.ops),
        ).fetchone()

        if row is None or payload.score > row["best_score"]:
            conn.execute(
                """
                INSERT INTO high_scores (mode, difficulty, ops, best_score, best_run_id)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(mode, difficulty, ops)
                DO UPDATE SET best_score = excluded.best_score, best_run_id = excluded.best_run_id
                """,
                (
                    payload.mode,
                    payload.difficulty,
                    payload.ops,
                    payload.score,
                    run_id,
                ),
            )
            is_new_high_score = True
            best_score = payload.score
        else:
            is_new_high_score = False
            best_score = int(row["best_score"])

    return RunCreateResponse(
        run_id=run_id, is_new_high_score=is_new_high_score, best_score=best_score
    )


@app.get("/api/highscore")
def get_highscore(
    mode: str, difficulty: str, ops: str
) -> dict:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT best_score, best_run_id FROM high_scores
            WHERE mode = ? AND difficulty = ? AND ops = ?
            """,
            (mode, difficulty, ops),
        ).fetchone()

    if row is None:
        return {"best_score": 0, "best_run_id": None}

    return {"best_score": int(row["best_score"]), "best_run_id": row["best_run_id"]}


@app.get("/api/runs")
def list_runs(
    mode: Optional[str] = None,
    difficulty: Optional[str] = None,
    ops: Optional[str] = None,
    limit: int = 200,
) -> dict:
    limit = max(1, min(limit, 500))
    clauses = []
    params = []
    if mode:
        clauses.append("mode = ?")
        params.append(mode)
    if difficulty:
        clauses.append("difficulty = ?")
        params.append(difficulty)
    if ops:
        clauses.append("ops = ?")
        params.append(ops)

    where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    sql = f"""
        SELECT id, created_at, mode, difficulty, ops, score, attempted, correct
        FROM runs
        {where_sql}
        ORDER BY datetime(created_at) DESC
        LIMIT ?
    """
    params.append(limit)

    with get_conn() as conn:
        rows = conn.execute(sql, params).fetchall()

    results = [
        {
            "id": row["id"],
            "created_at": row["created_at"],
            "mode": row["mode"],
            "difficulty": row["difficulty"],
            "ops": row["ops"],
            "score": row["score"],
            "attempted": row["attempted"],
            "correct": row["correct"],
        }
        for row in rows
    ]
    return {"runs": results}

