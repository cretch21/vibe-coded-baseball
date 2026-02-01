# Baseball App Features

A comprehensive baseball statistics analysis platform by Stockyard Baseball Co.

---

## Table of Contents

1. [Statistical Analysis Engine](#statistical-analysis-engine)
2. [Data Filtering & Customization](#data-filtering--customization)
3. [Interactive Visualizations](#interactive-visualizations)
4. [Pitcher Profile Analysis](#pitcher-profile-analysis)
5. [Data Management](#data-management)
6. [Rankings & Tables](#rankings--tables)
7. [User Interface & Controls](#user-interface--controls)

---

## Statistical Analysis Engine

### Correlation Analysis
- **Single-Year Correlation**: Analyze correlations between any two stats within the same year
- **Predictive Analysis**: Find which stats in one year best predict performance in another year
- **Multi-Year Correlation**: Run correlations across 10+ years of data (2015-2025)
- **Stickiness Analysis**: Measure which stats are most consistent year-over-year
- **Combined Analysis**: Find stats that are both sticky (repeatable) AND predictive of future performance
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
- **Minimum IP**: Adjustable innings pitched threshold (default 50 IP) to exclude low-volume pitchers

### Analysis Filters
- **Target Stat Selection**: Choose any stat to predict/analyze (ERA, K/9, WHIP, FIP, etc.)
- **Year Selection**: Analyze any year from 2015-2025
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
- Trend direction indicators (↗ upward, ↘ downward)
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
- CSV data integration for projections
- Position verification (filters for pitchers only)

### Multi-Season Stats
- Stats for seasons 2015-2025 (11 years)
- Hybrid data sourcing:
  - MLB Stats API for historical data
  - CSV data for 2026+ projections
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

## Data Management

### CSV Data Loading
- Auto-loads multiple CSV files from GitHub
- Tab and comma delimiter detection
- Data merging by player name
- Year-prefix handling (e.g., "2024_ERA")
- 11 years of data (2015-2025)

### MLB Stats API Integration
- Real-time player search
- Multi-season stat fetching
- Game log retrieval
- Play-by-play pitch data
- 24-hour response caching
- Batch processing (5 games at a time)

### Stat Definitions
- 100+ comprehensive stat definitions
- Hover tooltips explaining metrics
- Coverage includes:
  - Basic stats (ERA, W, L, IP)
  - Advanced estimators (FIP, xFIP, SIERA)
  - Pitch-specific metrics
  - Value stats (WAR, RAR, WPA)
  - Plate discipline stats
  - Contact quality metrics

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

### Analysis Modes (5 modes)
1. **Correlation Mode**: Analyze stat relationships
2. **Stickiness Mode**: Year-over-year consistency
3. **Combined Mode**: Sticky + predictive combined
4. **Trends Mode**: How correlations change over time
5. **Pitcher Mode**: Individual player detailed analysis

### Time Mode Selection
- **Single Year**: Analyze within one year or year-to-year
- **All Years**: Analyze across all 10+ years

### Year Selectors
- Predictor Year dropdown (2015-2025)
- Target Year dropdown (2015-2025)
- Quick buttons for common selections

### Display Controls
- Show/Hide full rankings table
- Group by family / Flat list toggle
- Interactive scatter plot stat selectors
- Pitch type filters
- Batter handedness filters (All, vs LHB, vs RHB)
- Count filters (0-0 through 3-2)

### Visual Design
- Stockyard Baseball Co. branding
- Dark green (#183521) background
- Gold accents (#E1C825)
- Responsive design (mobile, tablet, desktop)
- TailwindCSS styling

---

## Technical Features

### Performance Optimization
- Lazy loading of data
- API response caching (24-hour)
- Batch processing for game data
- Memoized calculations
- Efficient filtering with Maps and Sets
- Responsive containers with ResizeObserver

### Data Validation
- Graceful handling of missing data
- Network error handling with user messages
- Empty result set handling
- Minimum sample size validation
- Console logging for debugging

---

## Data Coverage

- **Years**: 2015-2025 (11 seasons)
- **Stats**: 100+ metrics across all categories
- **Sources**: MLB Stats API + Historical CSV data
- **Deployment**: Production-ready on Vercel
