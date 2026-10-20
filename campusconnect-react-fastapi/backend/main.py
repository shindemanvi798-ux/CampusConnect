from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
import sqlite3
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "campusconnect.db"


def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with connect_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                date TEXT NOT NULL,
                location TEXT NOT NULL,
                category TEXT NOT NULL,
                organizer TEXT NOT NULL DEFAULT 'CampusConnect'
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        count = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        if count == 0:
            sample_events = [
                ("TechNova Hackathon", "Build a useful prototype with a team, mentors, and a 24-hour sprint.", "2026-11-08", "Innovation Lab", "Technology", "Coding Club"),
                ("Campus Cultural Night", "An evening of music, dance, art, and student performances.", "2026-11-14", "Open Air Theatre", "Cultural", "Cultural Council"),
                ("AI & Future Careers", "Talks and a Q&A on AI, research, internships, and career paths.", "2026-11-19", "Seminar Hall A", "Workshop", "AI Society"),
                ("Inter-College Chess Meet", "Rapid chess rounds for beginner and experienced players.", "2026-11-22", "Student Activity Centre", "Sports", "Sports Committee"),
                ("Green Campus Drive", "Join a campus clean-up and sustainability awareness activity.", "2026-11-27", "Main Garden", "Community", "Eco Club"),
            ]
            conn.executemany("""
                INSERT INTO events (title, description, date, location, category, organizer)
                VALUES (?, ?, ?, ?, ?, ?)
            """, sample_events)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="CampusConnect API",
    description="Backend API for campus events, search, and feedback.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
        allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://shindemanvi798-ux.github.io",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=5, max_length=1000)
    date: str = Field(min_length=10, max_length=10, description="YYYY-MM-DD")
    location: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=40)
    organizer: str = Field(default="CampusConnect", max_length=100)


class FeedbackCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=160)
    message: str = Field(min_length=5, max_length=2000)


def row_to_dict(row):
    return dict(row) if row is not None else None


@app.get("/")
def root():
    return {"message": "CampusConnect API is running", "docs": "/docs"}


@app.get("/api/health")
def health():
    with connect_db() as conn:
        conn.execute("SELECT 1").fetchone()
    return {"status": "ok", "database": "connected", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/events")
def list_events(
    q: Optional[str] = Query(default=None, max_length=100),
    category: Optional[str] = Query(default=None, max_length=40),
):
    sql = "SELECT * FROM events WHERE 1=1"
    params = []
    if q and q.strip():
        pattern = f"%{q.strip()}%"
        sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR organizer LIKE ?)"
        params.extend([pattern, pattern, pattern, pattern])
    if category and category.lower() != "all":
        sql += " AND lower(category) = lower(?)"
        params.append(category)
    sql += " ORDER BY date ASC, id DESC"
    with connect_db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return [row_to_dict(row) for row in rows]


@app.get("/api/events/{event_id}")
def get_event(event_id: int):
    with connect_db() as conn:
        row = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return row_to_dict(row)


@app.post("/api/events", status_code=201)
def create_event(event: EventCreate):
    with connect_db() as conn:
        cursor = conn.execute("""
            INSERT INTO events (title, description, date, location, category, organizer)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (event.title, event.description, event.date, event.location, event.category, event.organizer))
        row = conn.execute("SELECT * FROM events WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return row_to_dict(row)


@app.post("/api/feedback", status_code=201)
def create_feedback(feedback: FeedbackCreate):
    with connect_db() as conn:
        cursor = conn.execute("""
            INSERT INTO feedback (name, email, message, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            feedback.name, feedback.email, feedback.message,
            datetime.now(timezone.utc).isoformat()
        ))
        row = conn.execute("SELECT * FROM feedback WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return row_to_dict(row)


@app.get("/api/feedback")
def list_feedback():
    with connect_db() as conn:
        rows = conn.execute("SELECT * FROM feedback ORDER BY id DESC").fetchall()
    return [row_to_dict(row) for row in rows]
