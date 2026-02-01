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

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 24+
- Python 3.14+

### Development

1. Clone the repo:
```bash
git clone https://github.com/cretch21/vibe-coded-baseball.git
cd vibe-coded-baseball
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the database:
```bash
docker compose up db -d
```

4. Run the backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

5. Run the frontend:
```bash
cd frontend
npm install
npm run dev
```

6. Open http://localhost:3000

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
