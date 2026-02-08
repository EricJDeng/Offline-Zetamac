# Offline-Zetamac

I made this so that I can practice zetamac when there's no wifi! (eg. trip from NZ to NYC)

## Quickstart (dev servers)

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:5173`.
