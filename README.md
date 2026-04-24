# Corelign Local Setup

This repository contains a FastAPI backend and a Vite/React frontend.

## Option 1: Local development (Python + Node)

### 1. Backend setup
1. Open a terminal in `backend`
2. Create a virtual environment:
   - PowerShell: `python -m venv .venv`
3. Activate it:
   - PowerShell: `.\.venv\Scripts\Activate.ps1`
4. Install dependencies:
   - `python -m pip install --upgrade pip`
   - `python -m pip install -r requirements.txt`
5. Copy environment variables:
   - `copy .env.example .env`
6. Edit `backend\.env` and set `HF_TOKEN`.
   - Optional: set `GROQ_API_KEY` if you want answer generation.
7. Start backend:
   - `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### 2. Frontend setup
1. Open a terminal in `frontend`
2. Install npm dependencies:
   - `npm install`
3. Start the frontend:
   - `npm run dev -- --host 0.0.0.0`
4. Open `http://localhost:5173`

### Notes
- The frontend is configured to use `http://127.0.0.1:8000` by default via `frontend/.env.development`.
- If the backend is not running, the workspace UI cannot reach the API.

## Option 2: Docker Compose (recommended if Docker is installed)

1. Create `backend/.env` from `backend/.env.example` and set at least `HF_TOKEN`.
2. Run from repository root:
   - `docker compose up --build`
3. Open `http://localhost:5173`

## Required values
- `HF_TOKEN` (required for embedding documents)
- `GROQ_API_KEY` (optional)
- `CORS_ORIGINS` should include `http://localhost:5173`

## Troubleshooting
- If upload fails with `HF_TOKEN is not set`, verify `backend/.env` exists and contains the token.
- If the frontend cannot reach the backend, confirm the backend is running on `http://localhost:8000`.
- If `npm install` or `pip install` fails, make sure Node.js and Python 3.11+ are installed on Windows.
