# CampusConnect — React + FastAPI

A beginner-friendly full-stack campus events website.

## Stack
- React + Vite frontend
- FastAPI REST backend
- SQLite database (`backend/campusconnect.db` is created automatically)
- Open-Meteo public weather API

## Requirements
- Node.js 20+ recommended
- Python 3.10+

## 1. Start the backend (Terminal 1)
From the project root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

If PowerShell blocks activation, run the backend without activating the venv:
```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Backend:
- API: http://127.0.0.1:8000
- Interactive API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/api/health

## 2. Start the frontend (Terminal 2)
Open another terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the Local URL printed by Vite, usually http://localhost:5173.

## API endpoints
- `GET /api/health` — backend status
- `GET /api/events?q=&category=` — list/search/filter events
- `GET /api/events/{event_id}` — get one event
- `POST /api/events` — create an event
- `POST /api/feedback` — save feedback
- `GET /api/feedback` — list feedback (demo endpoint)

## How to verify the full stack
1. Start FastAPI and confirm `/api/health` returns `{"status":"ok",...}`.
2. Open `/docs` and try `GET /api/events`.
3. Start React and open the Events page. Events should load from FastAPI.
4. Submit the contact form. Then open `/docs`, try `GET /api/feedback`, and confirm the submitted entry appears.
5. The SQLite file is created automatically inside `backend/`.

## Notes
- CORS is configured for the local Vite development URL.
- This is a local demo starter. Before public deployment, add authentication, rate limiting, stronger validation and privacy controls for feedback.
- Weather uses Open-Meteo directly from the browser and needs internet access.
