# MLB Pitch Analytics Platform

## Overview
A comprehensive web application for analyzing MLB pitch data from Statcast.

**Robert Stock's For Fun, Entirely Vibe-Coded App**

## Goals
- Personal analysis and exploration
- Build a public-facing tool
- Support research and writing

## Branding & Design
| Element | Value |
|---------|-------|
| Primary Color | Dark Green (#183521) |
| Accent Color | Gold (#E1C825) |
| Style | Clean, professional, mobile-responsive |

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + React + Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Primary Data Source | pybaseball (Baseball Savant/Statcast) |
| Secondary Data Source | MLB Stats API (player search, game metadata) |
| Hosting | Railway |
| Scheduling | Railway cron jobs |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |

## Data Sources

### pybaseball (Primary)
- Statcast pitch-level data (~90 columns per pitch)
- Velocity, spin rate, movement, exit velocity
- Pitch location coordinates
- Batted ball data
- Historical data 2015-present

### MLB Stats API (Secondary)
- Real-time player search with autocomplete
- Game logs and metadata
- Player biographical info
- Fills gaps where pybaseball doesn't cover

## Testing & Automation

### Testing Stack
| Type | Tool | Purpose |
|------|------|---------|
| Python Unit Tests | pytest | Test backend functions |
| Python Linting | Ruff | Fast Python linter |
| Python Types | mypy | Static type checking |
| API Integration | pytest + httpx | Test FastAPI endpoints |
| JS/TS Linting | ESLint | Frontend code quality |
| JS/TS Types | TypeScript | Catch type errors |
| Component Tests | Vitest + React Testing Library | Test React components |
| E2E Tests | Playwright | Full browser automation |
| Data Validation | Pydantic + Great Expectations | Validate pitch data |

### Automation Workflow
```
Code Change
    │
    ├──► Linting (Ruff + ESLint)
    ├──► Type Checking (mypy + TypeScript)
    ├──► Unit Tests (pytest + Vitest)
    ├──► Integration Tests (API endpoints)
    ├──► E2E Tests (Playwright)
    │
    ▼
All Pass? ──► Auto Deploy to Railway
    │
    ▼
Failure? ──► Auto-fix attempt ──► Re-run tests
```

### Development Rules
1. **Auto-run tests** after every code change
2. **Auto-fix and retry** on test failures
3. **Mock/seed data** for fast local testing
4. **Docker** for consistent environments

### CI/CD Pipeline (GitHub Actions)
- On push: Run full test suite
- On PR: Run tests + preview deployment
- On merge to main: Auto-deploy to Railway

### Test Data Strategy
- **Mock data**: Generated fake pitches for unit/integration tests
- **Seed data**: Small subset of real Statcast data for E2E tests
- **Full data**: Production database with all historical data

## Data Scope
- **Years:** 2015-present (Statcast era)
- **Coverage:** All MLB pitchers
- **Metrics:** 100+ statistics across all categories
- **Update frequency:** Daily during season

---

## App Structure

### Global Header
- **Search bar** - Always visible, pitcher autocomplete
- **Navigation** - Dashboard, Discover, Pitchers, Leaderboards, Compare

### Dashboard (Homepage)
The main landing page showing what's happening across MLB:

- **"What's Happening"** - Recent anomalies, velocity changes, new pitches detected
- **"This Week in MLB"** - Auto-generated weekly summary card
- **Quick Search** - Prominent pitcher search
- **Quick Links** - Cards linking to each main section

### Main Sections

#### 1. Discover (Statistical Research)
League-wide statistical analysis tools, organized as tabs:

| Tab | Purpose |
|-----|---------|
| Correlations | Analyze relationships between any two stats |
| Stickiness | Year-over-year consistency of stats |
| Predictive Power | Stats that are both sticky AND predictive (renamed from "Combined") |
| Trends | How correlations change over 10+ years |

Each tab includes:
- Interactive scatter plots with regression lines
- Rankings tables (sortable, clickable)
- Side panel explaining what the chart shows
- Export button (PNG)

#### 2. Pitchers (Individual Deep-Dives)
Individual pitcher analysis pages:

- Arsenal performance cards
- Game logs (up to 30 games)
- Strike zone heatmaps (25-zone, filterable)
- Velocity trending through games
- Pitch-by-pitch data
- Splits (vs LHB / vs RHB)
- Season selector (2015-present)

#### 3. Leaderboards
Sortable rankings by any stat:

- Top 10/25/50 toggle
- Filter by starter/reliever
- Filter by minimum IP
- Click any pitcher → opens their profile
- Categories: Velocity, Spin, Whiff%, Movement, Value stats, etc.

#### 4. Compare
Side-by-side pitcher comparison:

- Select 2-4 pitchers
- Overlay arsenals, velocity trends, heatmaps
- Stat comparison table
- Visual diff highlighting

### UI/UX Patterns

| Element | Behavior |
|---------|----------|
| Stat abbreviations | Hover tooltip with definition |
| Charts | Side panel with plain-English explanation |
| Data points | Hover tooltip with details |
| All charts | Export button (PNG download) |
| Tables | Click row to drill into detail |
| Mobile | Fully responsive, touch-friendly |

---

## Statistical Analysis Engine

### Correlation Analysis
- **Single-Year Correlation**: Analyze correlations between any two stats within the same year
- **Predictive Analysis**: Find which stats in one year best predict performance in another year
- **Multi-Year Correlation**: Run correlations across 10+ years of data (2015-present)
- **Stickiness Analysis**: Measure which stats are most consistent year-over-year
- **Combined Analysis**: Find stats that are both sticky (repeatable) AND predictive
- **Trend Analysis**: Track how stat correlations with a target variable change over time

### Statistical Metrics Calculated
- Pearson correlation coefficient (r)
- R² (coefficient of determination)
- P-value significance testing
- Linear regression equations (y = mx + b)
- Sample size tracking

---

## Data Filtering & Customization

### Pitcher Filters
- **Pitcher Type**: Separate analysis for starters, relievers, or all pitchers
- **Minimum IP**: Adjustable innings pitched threshold (default 50 IP)

### Analysis Filters
- **Target Stat Selection**: Choose any stat to predict/analyze (ERA, K/9, WHIP, FIP, etc.)
- **Year Selection**: Analyze any year from 2015-present
- **Stat Family Grouping**: Toggle between grouped view by category or flat list

### Stat Category Filters
Enable/disable analysis on specific stat families:
- Strikeouts & Walks
- ERA Estimators (FIP, xFIP, SIERA)
- Value Metrics (WAR, RAR, WPA)
- WHIP & Contact Stats
- Home Run Metrics
- Batted Ball Data
- Contact Quality (Barrel%, HardHit%)
- Plate Discipline (SwStr%, Zone%)
- Pitch Velocity
- Pitch Usage & Movement
- Pitch Run Values
- Clutch & Leverage Stats
- Plus Metrics
- Counting Stats
- Starter/Reliever Specific Stats
- Pace & Context

---

## Interactive Visualizations

### Scatter Plots
- Interactive scatter plots showing stat relationships
- Color-coded data points with hover tooltips
- Regression line overlay
- Click-to-explore from rankings table

### Trend Analysis Charts
- Line charts tracking correlation changes across years
- Multiple stat comparison on single chart
- Trend direction indicators
- Percentage change visualization

### Strike Zone Heatmaps
- 25-zone (5×5 grid) pitcher effectiveness heatmaps
- Strike zone outlined in gold
- Multiple metrics per zone:
  - Whiff Rate (swinging strikes)
  - Chase Rate (swings outside zone)
  - CSW% (called strikes + whiffs)
  - Run Value (positive/negative for pitcher)
- Filterable by count (0-0, 1-1, 2-2, etc.)
- Separate heatmaps for game-specific and season-wide data

### Arsenal Performance Cards
Pitch-type cards displaying:
- Usage percentage
- Average velocity
- Velocity range (min/max)
- Spin rate
- Whiff rate
- Run value per 100 pitches

---

## Pitcher Profile Analysis

### Player Search
- Real-time pitcher search via MLB Stats API
- Autocomplete suggestions
- Position verification (filters for pitchers only)

### Multi-Season Stats
- Stats for seasons 2015-present
- Clear data source indicators

### Game Log & Analysis
- Full game log for selected season
- Up to 30 games displayed with scrolling
- Game-by-game statistics:
  - Date & Opponent
  - IP, H, R, ER, BB, K, Pitches

### Pitch-by-Pitch Data
Detailed pitch information including:
- Pitch type and code (FF, SL, CU, CH, etc.)
- Velocity & Spin rate
- Exact location coordinates
- Pitch result (ball, strike, whiff, hit)
- Batter info and handedness
- Inning and count

### Pitch Arsenal Breakdown
Aggregated stats per pitch type:
- Total count and usage %
- Velocity stats (avg, min, max)
- Average spin rate
- Called strike %
- Swinging strike %
- In-play results
- Run value calculations

### Strike Zone Mapping
- Scatter plot of all pitches
- Color-coded by pitch type
- Hover tooltips with details
- Interactive pitch type filtering
- Strike zone boundary markers

### Velocity Trending
- Line chart through game progression
- Fatigue/performance pattern tracking
- Filterable by pitch type

### Season-Wide Heatmaps
- All pitches aggregated from entire season
- Filterable by:
  - Batter hand (All, vs LHB, vs RHB)
  - Count (0-0 through 3-2)
  - Pitch type
- Dynamic recalculation

---

## Rankings & Tables

### Correlation Rankings
- Sorted by correlation strength (R-value)
- Displays: Rank, Stat name, R², Sample size, Regression equation
- Click rows to view scatter plot

### Combined Rankings
- Combined score percentage
- Sticky R² (year-to-year consistency)
- Predictive R² (predicts target stat)
- Grouped by stat family

### Trend Rankings
- Average R² across all years
- Trend percentage showing change over time
- Visual trend direction indicators
- Years tracked

### View Options
- **Grouped View**: Statistics organized by family (18+ families)
- **Flat View**: Single sortable table

---

## User Interface & Controls

### Time Mode Selection
- **Single Year**: Analyze within one year or year-to-year
- **All Years**: Analyze across all 10+ years

### Year Selectors
- Predictor Year dropdown (2015-present)
- Target Year dropdown (2015-present)
- Quick buttons for common selections

### Display Controls
- Show/Hide full rankings table
- Group by family / Flat list toggle
- Interactive scatter plot stat selectors
- Pitch type filters
- Batter handedness filters (All, vs LHB, vs RHB)
- Count filters (0-0 through 3-2)

### Stat Definitions
- 100+ comprehensive stat definitions
- Hover tooltips explaining metrics

---

## Chart Explanations

Every chart includes a side panel with:
- **What you're looking at** - Plain-English description
- **How to read it** - What high/low values mean
- **Why it matters** - Context for the analysis

Example for a correlation scatter plot:
> "This chart shows the relationship between K/9 (strikeouts per 9 innings) and ERA. Each dot is a pitcher's 2024 season. The trend line shows that higher K/9 tends to predict lower ERA. The R² of 0.42 means strikeout rate explains about 42% of the variation in ERA."

---

## Core Features (Phased)

### Phase 1: Foundation
- [ ] Database schema for pitch data
- [ ] Data ingestion pipeline (pybaseball + MLB Stats API)
- [ ] Basic API endpoints
- [ ] Pitcher list/search with autocomplete
- [ ] Docker development environment

### Phase 2: Dashboard & Navigation
- [ ] Global header with search
- [ ] Dashboard homepage
- [ ] "What's Happening" anomaly feed
- [ ] Weekly summary card
- [ ] Navigation between sections

### Phase 3: Pitchers Section
- [ ] Individual pitcher pages
- [ ] Pitch arsenal cards
- [ ] Season-by-season stats
- [ ] Game logs (up to 30 games)
- [ ] Velocity trending charts
- [ ] Strike zone scatter plots
- [ ] 25-zone heatmaps (filterable by count, hand, pitch type)
- [ ] Chart side panels with explanations
- [ ] Export button (PNG)

### Phase 4: Leaderboards
- [ ] Leaderboard page with stat selector
- [ ] Top 10/25/50 toggle
- [ ] Starter/reliever filter
- [ ] Minimum IP filter
- [ ] Click-through to pitcher profiles

### Phase 5: Discover (Statistical Analysis)
- [ ] Correlations tab with scatter plots
- [ ] Stickiness tab
- [ ] Predictive Power tab
- [ ] Trends tab with line charts
- [ ] Rankings tables
- [ ] Stat category filters

### Phase 6: Compare
- [ ] Pitcher comparison tool (2-4 pitchers)
- [ ] Side-by-side arsenal cards
- [ ] Overlay velocity trends
- [ ] Comparison stat table

### Phase 7: Reports & Alerts
- [ ] Weekly league summary report (auto-generated)
- [ ] Anomaly detection (velocity drops, new pitches, etc.)
- [ ] Report archive on dashboard

### Phase 8: Expansion
- [ ] Batter vs pitcher matchups
- [ ] Team-level analysis
- [ ] Custom saved queries

---

## Auto-Generated Reports

### Weekly League Summary
- Top performers of the week
- Notable trends across MLB
- Breakout pitchers
- Pitch usage changes

### Anomaly Alerts
- Significant velocity changes (±2 mph)
- New pitch types added
- Spin rate changes
- Usage pattern shifts

---

## Database Schema (High-Level)

### Tables
- `pitches` - All individual pitch data (~90 columns)
- `pitchers` - Pitcher metadata
- `games` - Game-level info
- `reports` - Generated reports
- `anomalies` - Detected anomalies
- `correlations` - Cached correlation results
- `stat_definitions` - 100+ stat explanations

---

## Performance Optimization

- Lazy loading of data
- API response caching (24-hour for static data)
- Batch processing for game data
- Memoized calculations
- Efficient filtering with Maps and Sets
- Responsive containers with ResizeObserver

## Data Validation

- Graceful handling of missing data
- Network error handling with user messages
- Empty result set handling
- Minimum sample size validation
- Console logging for debugging

---

## Budget
- Railway hosting: ~$20/month
- Includes: PostgreSQL, API server, frontend, cron jobs

## Timeline
- No hard deadline
- Build it right, iterate

## Non-Functional Requirements
- Scalable architecture (handle 10M+ pitches)
- Fast queries (<500ms for common operations)
- Mobile-responsive dashboard
- Clean, professional UI with dark green/gold theme
