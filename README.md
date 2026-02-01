# Vibe-Coded Baseball

**Robert Stock's For Fun, Entirely Vibe-Coded MLB Pitch Analytics App**

A comprehensive web application for analyzing MLB pitch data from Statcast.

## Features

- **Dashboard** - What's happening across MLB, anomalies, weekly summaries
- **Discover** - Statistical analysis (correlations, stickiness, predictive power, trends)
- **Pitchers** - Individual deep-dives with arsenals, heatmaps, game logs
- **Leaderboards** - Sortable rankings by any stat
- **Compare** - Side-by-side pitcher comparison

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + React + Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Data Source | pybaseball (Statcast) + MLB Stats API |
| Hosting | Railway |

## Quick Start (No Docker Required!)

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

### 2. Start the Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 3. Open the App
Go to http://localhost:3000

---

## Database Manager

The app uses SQLite (no database server needed). Use these commands to manage your data:

```bash
cd backend

# Check current database status
python scripts/db_manager.py status

# Load specific months of 2025 data
python scripts/db_manager.py april
python scripts/db_manager.py may
python scripts/db_manager.py june
python scripts/db_manager.py july
python scripts/db_manager.py august
python scripts/db_manager.py september

# Load custom date range
python scripts/db_manager.py load --start 2025-07-01 --end 2025-07-31

# Load full 2025 season (takes a while!)
python scripts/db_manager.py full
```

The database file is stored at `backend/baseball.db`.

## Project Structure

```
├── frontend/          # Next.js app
├── backend/           # FastAPI app
├── docker-compose.yml # Local development
├── PROJECT_SPEC.md    # Full specification
└── FEATURES.md        # Feature documentation
```

## Data

- **Years**: 2015-2025 (Statcast era)
- **Coverage**: All MLB pitchers
- **Metrics**: 100+ statistics
- **Updates**: Daily during season

## License

MIT
