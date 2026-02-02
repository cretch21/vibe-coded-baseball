"""Load FanGraphs pitching stats to populate missing season_stats columns.

This script pulls ERA, FIP, xFIP, SIERA, WHIP, K/9, BB/9, HR/9, WAR,
GB%, FB%, LD%, Hard%, Barrel%, and Chase% from FanGraphs.
"""

import sqlite3
from pathlib import Path
from pybaseball import pitching_stats
import pandas as pd

# Database path
DB_PATH = Path(__file__).parent.parent / "baseball.db"


def normalize_name(name: str, format: str = "first_last") -> str:
    """Normalize pitcher name for matching.

    Args:
        name: The pitcher name
        format: "first_last" for "First Last" or "last_first" for "Last, First"

    Returns:
        Normalized name in "first last" format (lowercase)
    """
    if not name:
        return ""

    # Remove Jr., Sr., III, etc.
    name = name.replace(" Jr.", "").replace(" Sr.", "").replace(" III", "").replace(" II", "")
    name = name.strip()

    if format == "last_first" and "," in name:
        # Convert "Last, First" to "First Last"
        parts = name.split(",", 1)
        if len(parts) == 2:
            name = f"{parts[1].strip()} {parts[0].strip()}"

    # Lowercase
    return name.lower().strip()


def load_fangraphs_data(start_year: int, end_year: int):
    """Load FanGraphs pitching stats for given year range."""
    print(f"Fetching FanGraphs data for {start_year}-{end_year}...")

    # Get pitching stats - qual=0 gets all pitchers
    df = pitching_stats(start_year, end_year, qual=0)

    print(f"  Retrieved {len(df)} pitcher-seasons from FanGraphs")
    return df


def update_season_stats(conn: sqlite3.Connection, fg_data: pd.DataFrame):
    """Update season_stats table with FanGraphs data."""
    cursor = conn.cursor()

    # Get existing pitchers and their season stats
    cursor.execute("""
        SELECT p.id, p.name, ss.id as season_id, ss.year
        FROM pitchers p
        JOIN season_stats ss ON p.id = ss.pitcher_id
    """)

    existing = cursor.fetchall()
    print(f"Found {len(existing)} existing pitcher-seasons to update")

    # Create lookup by normalized name + year
    # Our DB uses "Last, First" format
    pitcher_lookup = {}
    for pitcher_id, name, season_id, year in existing:
        key = (normalize_name(name, format="last_first"), year)
        pitcher_lookup[key] = season_id

    # FanGraphs column mapping to our columns
    column_map = {
        'ERA': 'era',
        'FIP': 'fip',
        'xFIP': 'xfip',
        'SIERA': 'siera',
        'WHIP': 'whip',
        'K/9': 'k_per_9',
        'BB/9': 'bb_per_9',
        'HR/9': 'hr_per_9',
        'WAR': 'war',
        'GB%': 'gb_pct',
        'FB%': 'fb_pct',
        'LD%': 'ld_pct',
        'Hard%': 'hard_hit_pct',
        'Barrel%': 'barrel_pct',
        'O-Swing%': 'chase_pct',  # Chase rate = O-Swing%
    }

    updates = 0
    not_found = 0

    for _, row in fg_data.iterrows():
        name = row.get('Name', '')
        year = int(row.get('Season', 0))

        # FanGraphs uses "First Last" format
        key = (normalize_name(name, format="first_last"), year)
        season_id = pitcher_lookup.get(key)

        if not season_id:
            not_found += 1
            continue

        # Build update query
        update_cols = []
        update_vals = []

        for fg_col, our_col in column_map.items():
            if fg_col in row and pd.notna(row[fg_col]):
                val = row[fg_col]
                # Convert percentages (stored as 0-100 in FanGraphs)
                if '%' in fg_col and isinstance(val, (int, float)):
                    val = float(val)  # Already in percentage form
                update_cols.append(f"{our_col} = ?")
                update_vals.append(val)

        if update_cols:
            update_vals.append(season_id)
            query = f"UPDATE season_stats SET {', '.join(update_cols)} WHERE id = ?"
            cursor.execute(query, update_vals)
            updates += 1

    conn.commit()
    print(f"  Updated {updates} pitcher-seasons")
    print(f"  Could not match {not_found} FanGraphs entries")


def main():
    """Main function to load FanGraphs data."""
    print("=" * 50)
    print("Loading FanGraphs Pitching Stats")
    print("=" * 50)

    conn = sqlite3.connect(DB_PATH)

    # Check what years we have data for
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT year FROM season_stats ORDER BY year")
    years = [row[0] for row in cursor.fetchall()]
    print(f"Years in database: {years}")

    if not years:
        print("No season data found in database!")
        return

    start_year = min(years)
    end_year = max(years)

    # Load FanGraphs data
    fg_data = load_fangraphs_data(start_year, end_year)

    # Update our database
    update_season_stats(conn, fg_data)

    # Verify the update
    print("\nVerifying updates...")
    for col in ['era', 'fip', 'war', 'gb_pct', 'chase_pct']:
        cursor.execute(f"SELECT COUNT(*) FROM season_stats WHERE {col} IS NOT NULL")
        count = cursor.fetchone()[0]
        print(f"  {col}: {count} rows with data")

    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()
