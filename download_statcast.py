"""
Statcast Pitch Data Downloader

Downloads all pitch-level data from Baseball Savant using pybaseball.
Handles the 25,000 row API limit by chunking requests by date.

Data includes: pitch type, velocity, spin rate, location, exit velocity,
launch angle, and ~90 other metrics.

Usage:
    python download_statcast.py              # Download 2024 season
    python download_statcast.py 2023         # Download specific year
    python download_statcast.py 2020 2024    # Download range of years
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
from pybaseball import statcast
from tqdm import tqdm


# Configuration
DATA_DIR = Path(__file__).parent / "data"
CHUNK_DAYS = 5  # Days per API request (to stay under 25k row limit)


def get_season_dates(year: int) -> tuple[str, str]:
    """Return approximate MLB season start/end dates for a given year."""
    # Regular season typically runs late March to early October
    # Spring training starts in February, postseason ends late October/early November
    start = f"{year}-03-01"
    end = f"{year}-11-15"
    return start, end


def download_year(year: int, output_dir: Path) -> pd.DataFrame:
    """Download all Statcast data for a single season."""
    start_date, end_date = get_season_dates(year)
    output_file = output_dir / f"statcast_{year}.csv"

    # Check if already downloaded
    if output_file.exists():
        print(f"  {year}: Already exists at {output_file}")
        return pd.read_csv(output_file)

    print(f"  {year}: Downloading from {start_date} to {end_date}...")

    # Generate date chunks
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    chunks = []
    current = start
    while current < end:
        chunk_end = min(current + timedelta(days=CHUNK_DAYS - 1), end)
        chunks.append((
            current.strftime("%Y-%m-%d"),
            chunk_end.strftime("%Y-%m-%d")
        ))
        current = chunk_end + timedelta(days=1)

    # Download each chunk
    all_data = []
    for chunk_start, chunk_end in tqdm(chunks, desc=f"  {year}", unit="chunk"):
        try:
            data = statcast(start_dt=chunk_start, end_dt=chunk_end)
            if data is not None and len(data) > 0:
                all_data.append(data)
        except Exception as e:
            print(f"\n  Warning: Error fetching {chunk_start} to {chunk_end}: {e}")
            continue

    if not all_data:
        print(f"  {year}: No data found")
        return pd.DataFrame()

    # Combine and save
    combined = pd.concat(all_data, ignore_index=True)
    combined.to_csv(output_file, index=False)
    print(f"  {year}: Saved {len(combined):,} pitches to {output_file}")

    return combined


def main():
    # Parse arguments
    if len(sys.argv) == 1:
        # Default: current year - 1
        years = [datetime.now().year - 1]
    elif len(sys.argv) == 2:
        years = [int(sys.argv[1])]
    elif len(sys.argv) == 3:
        start_year, end_year = int(sys.argv[1]), int(sys.argv[2])
        years = list(range(start_year, end_year + 1))
    else:
        print("Usage: python download_statcast.py [year] [end_year]")
        sys.exit(1)

    # Validate years (Statcast started 2015, PITCHf/x 2008)
    for year in years:
        if year < 2008:
            print(f"Error: Data not available before 2008 (PITCHf/x started then)")
            sys.exit(1)
        if year > datetime.now().year:
            print(f"Error: Cannot download future data ({year})")
            sys.exit(1)

    print(f"\nStatcast Data Downloader")
    print(f"========================")
    print(f"Years to download: {years}")
    print(f"Output directory: {DATA_DIR}")

    # Create output directory
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Download each year
    total_pitches = 0
    for year in years:
        data = download_year(year, DATA_DIR)
        total_pitches += len(data)

    print(f"\nComplete! Total pitches: {total_pitches:,}")
    print(f"Data saved to: {DATA_DIR}")


if __name__ == "__main__":
    main()
