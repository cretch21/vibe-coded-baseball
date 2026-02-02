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
| Database | SQLite |
| Data Source | pybaseball (Statcast) + MLB Stats API |
| Hosting | Railway |

## Quick Start (No Docker Required!)

### Prerequisites
- Node.js 18+
- Python 3.10+

### Option 1: One-Click Start (Windows)

Double-click `start.bat` to launch both servers in the background:
- Backend runs at http://localhost:8000
- Frontend runs at http://localhost:3000

Use `stop.bat` to shut everything down.

### Option 2: Manual Start

**1. Start the Backend**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

**2. Start the Frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

**3. Open the App**
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

### Loading FanGraphs Stats

The Statcast loader only populates pitch-level stats (velocity, spin, whiff%, etc.). To add traditional stats (ERA, FIP, WAR, etc.), run:

```bash
cd backend
python scripts/load_fangraphs_stats.py
```

This pulls data from FanGraphs and matches it to existing pitchers by name.

## Project Structure

```
├── frontend/                    # Next.js app
├── backend/                     # FastAPI app
│   ├── app/                     # API code
│   ├── scripts/                 # Data loaders
│   │   ├── db_manager.py        # Main database manager
│   │   ├── load_statcast.py     # Statcast pitch data loader
│   │   └── load_fangraphs_stats.py  # FanGraphs stats loader
│   └── baseball.db              # SQLite database
├── start.bat                    # Start both servers (Windows)
├── stop.bat                     # Stop both servers (Windows)
└── README.md
```

## Data

- **Years**: 2024-2025 (expandable to 2015+)
- **Coverage**: All MLB pitchers
- **Pitch Data**: Velocity, spin rate, movement, whiff%, strike%, zone%
- **FanGraphs Stats**: ERA, FIP, xFIP, SIERA, WHIP, K/9, BB/9, WAR, batted ball stats
- **Updates**: Run data loaders to add new data

## License

MIT
